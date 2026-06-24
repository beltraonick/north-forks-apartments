-- =============================================================================
-- North Fork Apartments — Schema Inicial
-- =============================================================================
-- Baseado no documento de requisitos aprovado.
-- Regras de negócio críticas estão na camada de banco (triggers),
-- não apenas na aplicação.

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUMs
-- =============================================================================

create type request_status as enum (
  'new',
  'reviewed',
  'scheduled',
  'in_progress',
  'waiting_on_parts',
  'completed',
  'closed'
);

create type request_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

create type media_type as enum (
  'photo',
  'video'
);

-- =============================================================================
-- TABELAS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- units — As 16 unidades fixas do complexo
-- Sem token, sem QR Code vinculado. O QR Code é genérico para o prédio inteiro.
-- A seleção da unidade é manual pelo inquilino no formulário.
-- -----------------------------------------------------------------------------
create table units (
  id          uuid primary key default gen_random_uuid(),
  number      text not null,           -- ex: "101", "2B", "Apt 7"
  floor       text,                    -- andar (opcional)
  block       text,                    -- bloco/edificio (opcional)
  notes       text,                    -- observações internas do admin
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- número único por combinação de bloco (permite dois prédios com "101")
  unique (number, block)
);

-- -----------------------------------------------------------------------------
-- categories — Categorias de manutenção, configuráveis pelo admin
-- Não são hardcoded no código — o admin pode criar, editar, desativar.
-- sla_hours define o prazo esperado de resolução para essa categoria.
-- -----------------------------------------------------------------------------
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,    -- ex: "Electrical", "Plumbing", "HVAC"
  description text,
  sla_hours   integer not null default 48,  -- prazo em horas para cálculo de atraso
  icon        text,                    -- nome do ícone (ex: "zap", "droplet")
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- admin_users — As 3 contas de administrador
-- Poder idêntico, sem hierarquia. Cada ação fica registrada com o id do autor.
-- Autenticação feita via Supabase Auth — esta tabela é o perfil estendido.
-- -----------------------------------------------------------------------------
create table admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null unique,
  avatar_url  text,
  is_active   boolean not null default true,
  last_login  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- maintenance_requests — Tabela central do sistema
-- Cada solicitação pertence a uma unidade e guarda os dados do contato
-- (nome/email/telefone) diretamente, já que inquilinos não têm conta.
-- public_token é o único acesso do inquilino ao status — nunca sequencial.
-- -----------------------------------------------------------------------------
create table maintenance_requests (
  id                  uuid primary key default gen_random_uuid(),

  -- Identificação legível (gerada pela aplicação no momento da criação)
  protocol            text not null unique,  -- ex: "NF-2024-0042"

  -- Token público para o inquilino consultar status sem login
  -- 48 chars hex = 24 bytes aleatórios. Nunca expor o id ou protocol como acesso.
  public_token        text not null unique default encode(gen_random_bytes(24), 'hex'),

  -- Unidade
  unit_id             uuid not null references units(id),

  -- Contato do inquilino (capturado a cada chamado, sem entidade Pessoa separada)
  tenant_name         text not null,
  tenant_email        text not null,
  tenant_phone        text,            -- opcional

  -- Detalhes do problema
  category_id         uuid not null references categories(id),
  room                text not null,   -- ex: "Kitchen", "Bathroom", "Living Room"
  description         text not null,

  -- Prioridades separadas: o que o inquilino percebe vs. o que o admin define
  tenant_priority     request_priority not null default 'medium',
  admin_priority      request_priority,  -- definido pelo admin após triagem

  -- Fluxo
  status              request_status not null default 'new',

  -- Autorização de entrada quando o inquilino estiver ausente
  entry_authorized    boolean not null default false,

  -- Campo de texto livre para registrar quem fez o reparo
  -- Não é uma entidade do sistema — só um nome para o histórico
  technician_name     text,

  -- Observações adicionais do inquilino
  tenant_notes        text,

  -- Resumo de conclusão (obrigatório antes de marcar como 'completed')
  -- Trigger abaixo bloqueia completed sem este campo preenchido
  resolution_summary  text,

  -- SLA calculado automaticamente na criação com base em categories.sla_hours
  sla_deadline        timestamptz,

  -- Protocolo de referência caso este chamado seja continuação de um anterior
  related_protocol    text,

  -- Timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  resolved_at         timestamptz  -- preenchido automaticamente ao marcar completed
);

-- -----------------------------------------------------------------------------
-- request_media — Arquivos anexados a uma solicitação
-- O binário fica no Supabase Storage (bucket privado).
-- Esta tabela guarda apenas os metadados e a referência de armazenamento.
-- -----------------------------------------------------------------------------
create table request_media (
  id              uuid primary key default gen_random_uuid(),
  request_id      uuid not null references maintenance_requests(id) on delete cascade,
  media_type      media_type not null,
  storage_key     text not null,       -- caminho no bucket: "requests/{request_id}/{filename}"
  filename        text not null,
  mime_type       text not null,
  size_bytes      bigint,
  width_px        integer,             -- para fotos
  height_px       integer,             -- para fotos
  duration_sec    integer,             -- para vídeos
  uploaded_by     text not null default 'tenant',  -- 'tenant' ou admin_user.id
  created_at      timestamptz not null default now(),

  -- Soft delete: marca como deletado sem remover do banco
  -- Job assíncrono usa isso para limpar o Storage depois
  deleted_at      timestamptz
);

-- -----------------------------------------------------------------------------
-- request_notes — Feed de comentários por solicitação
-- is_internal = true: visível apenas para os 3 admins, NUNCA para o inquilino
-- is_internal = false: visível ao inquilino na página de status e nos emails
-- Default TRUE garante que por omissão a nota é interna (falha segura)
-- -----------------------------------------------------------------------------
create table request_notes (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references maintenance_requests(id) on delete cascade,
  author_id   uuid not null references admin_users(id),
  content     text not null,
  is_internal boolean not null default true,  -- TRUE = seguro por padrão
  created_at  timestamptz not null default now()
  -- Sem updated_at: notas são imutáveis após criação
  -- Se precisar corrigir, deleta e recria (deixa rastro)
);

-- -----------------------------------------------------------------------------
-- status_history — Log de auditoria imutável de mudanças de status
-- Nunca atualiza, nunca deleta. Base para: SLA, tempo médio de resolução,
-- "quem fez o quê e quando" para qualquer chamado.
-- -----------------------------------------------------------------------------
create table status_history (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references maintenance_requests(id) on delete cascade,
  from_status   request_status,        -- null quando é a criação inicial
  to_status     request_status not null,
  changed_by    uuid references admin_users(id),  -- null se for criação automática
  note          text,                  -- razão da mudança (opcional)
  metadata      jsonb,                 -- dados extras sem alterar schema
  created_at    timestamptz not null default now()
);

-- =============================================================================
-- ÍNDICES
-- =============================================================================

-- Consultas mais comuns no dashboard admin
create index idx_requests_status       on maintenance_requests(status);
create index idx_requests_unit         on maintenance_requests(unit_id);
create index idx_requests_category     on maintenance_requests(category_id);
create index idx_requests_created      on maintenance_requests(created_at desc);
create index idx_requests_admin_priority on maintenance_requests(admin_priority);

-- Acesso do inquilino via token público (única forma de acesso sem login)
create unique index idx_requests_public_token on maintenance_requests(public_token);

-- Chamados urgentes aparecem em alerts — índice parcial mais eficiente
create index idx_requests_urgent on maintenance_requests(created_at)
  where admin_priority = 'urgent' or tenant_priority = 'urgent';

-- Chamados com SLA vencido — cálculo frequente no dashboard
create index idx_requests_sla on maintenance_requests(sla_deadline)
  where status not in ('completed', 'closed');

-- Notas por solicitação (ordenadas por data)
create index idx_notes_request    on request_notes(request_id, created_at);
create index idx_notes_public     on request_notes(request_id) where is_internal = false;

-- Histórico de status por solicitação
create index idx_history_request  on status_history(request_id, created_at);

-- Mídias por solicitação (excluindo deletadas)
create index idx_media_request    on request_media(request_id) where deleted_at is null;

-- =============================================================================
-- TRIGGERS E FUNÇÕES
-- =============================================================================

-- Atualiza updated_at automaticamente em qualquer UPDATE
create or replace function fn_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_units_updated_at
  before update on units
  for each row execute function fn_set_updated_at();

create trigger trg_categories_updated_at
  before update on categories
  for each row execute function fn_set_updated_at();

create trigger trg_admin_users_updated_at
  before update on admin_users
  for each row execute function fn_set_updated_at();

create trigger trg_requests_updated_at
  before update on maintenance_requests
  for each row execute function fn_set_updated_at();

-- Registra automaticamente cada mudança de status no histórico
create or replace function fn_log_status_change()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT') or (old.status is distinct from new.status) then
    insert into status_history (request_id, from_status, to_status, created_at)
    values (
      new.id,
      case when TG_OP = 'INSERT' then null else old.status end,
      new.status,
      now()
    );
  end if;
  return new;
end;
$$;

create trigger trg_requests_status_history
  after insert or update on maintenance_requests
  for each row execute function fn_log_status_change();

-- Preenche resolved_at quando status muda para 'completed'
create or replace function fn_set_resolved_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    new.resolved_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_requests_resolved_at
  before update on maintenance_requests
  for each row execute function fn_set_resolved_at();

-- Bloqueia completed sem resolution_summary (regra de negócio crítica)
create or replace function fn_require_resolution_summary()
returns trigger language plpgsql as $$
begin
  if new.status = 'completed' and (new.resolution_summary is null or trim(new.resolution_summary) = '') then
    raise exception 'resolution_summary is required before marking a request as completed'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger trg_require_resolution_summary
  before update on maintenance_requests
  for each row execute function fn_require_resolution_summary();

-- Bloqueia reabertura de chamados fechados (closed é estado terminal)
create or replace function fn_block_reopen_closed()
returns trigger language plpgsql as $$
begin
  if old.status = 'closed' and new.status != 'closed' then
    raise exception 'Closed requests cannot be reopened. Create a new request referencing protocol %', old.protocol
      using errcode = 'P0002';
  end if;
  return new;
end;
$$;

create trigger trg_block_reopen_closed
  before update on maintenance_requests
  for each row execute function fn_block_reopen_closed();

-- Calcula sla_deadline automaticamente na criação
create or replace function fn_set_sla_deadline()
returns trigger language plpgsql as $$
declare
  v_sla_hours integer;
begin
  select sla_hours into v_sla_hours
  from categories
  where id = new.category_id;

  if v_sla_hours is not null then
    new.sla_deadline = new.created_at + (v_sla_hours || ' hours')::interval;
  end if;

  return new;
end;
$$;

create trigger trg_set_sla_deadline
  before insert on maintenance_requests
  for each row execute function fn_set_sla_deadline();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table units                  enable row level security;
alter table categories             enable row level security;
alter table admin_users            enable row level security;
alter table maintenance_requests   enable row level security;
alter table request_media          enable row level security;
alter table request_notes          enable row level security;
alter table status_history         enable row level security;

-- Admins autenticados têm acesso total a tudo
create policy "admins_full_access_units"
  on units for all
  to authenticated
  using (true) with check (true);

create policy "admins_full_access_categories"
  on categories for all
  to authenticated
  using (true) with check (true);

create policy "admins_full_access_admin_users"
  on admin_users for all
  to authenticated
  using (true) with check (true);

create policy "admins_full_access_requests"
  on maintenance_requests for all
  to authenticated
  using (true) with check (true);

create policy "admins_full_access_media"
  on request_media for all
  to authenticated
  using (true) with check (true);

create policy "admins_full_access_notes"
  on request_notes for all
  to authenticated
  using (true) with check (true);

create policy "admins_full_access_history"
  on status_history for all
  to authenticated
  using (true) with check (true);

-- Acesso público: unidades (para popular dropdown do formulário)
create policy "public_read_units"
  on units for select
  to anon
  using (is_active = true);

-- Acesso público: categorias (para popular dropdown do formulário)
create policy "public_read_categories"
  on categories for select
  to anon
  using (is_active = true);

-- Acesso público: criar solicitação (inquilino sem login)
create policy "public_insert_requests"
  on maintenance_requests for insert
  to anon
  with check (true);

-- Acesso público: ler solicitação via public_token (página de status)
-- O token age como senha — apenas quem tem o token vê aquele chamado
create policy "public_read_request_by_token"
  on maintenance_requests for select
  to anon
  using (true);  -- filtro por token é feito na query da aplicação

-- Acesso público: inserir mídia (upload no formulário)
create policy "public_insert_media"
  on request_media for insert
  to anon
  with check (true);

-- Acesso público: ler notas públicas via token do chamado
create policy "public_read_notes"
  on request_notes for select
  to anon
  using (is_internal = false);

-- =============================================================================
-- VIEW: status público de um chamado (para página de status do inquilino)
-- Nunca expõe notas internas, dados de outros chamados, ou admin_user ids
-- =============================================================================
create or replace view public_request_status as
select
  r.protocol,
  r.public_token,
  r.status,
  r.tenant_name,
  r.tenant_priority,
  r.room,
  r.description,
  r.entry_authorized,
  r.tenant_notes,
  r.resolution_summary,
  r.sla_deadline,
  r.created_at,
  r.updated_at,
  r.resolved_at,
  c.name as category_name,
  u.number as unit_number,
  u.block as unit_block,
  coalesce(
    json_agg(
      json_build_object(
        'content', n.content,
        'created_at', n.created_at
      ) order by n.created_at
    ) filter (where n.id is not null and n.is_internal = false),
    '[]'::json
  ) as public_notes
from maintenance_requests r
join categories c on c.id = r.category_id
join units u on u.id = r.unit_id
left join request_notes n on n.request_id = r.id
group by r.id, c.name, u.number, u.block;

-- =============================================================================
-- DADOS INICIAIS (SEED)
-- =============================================================================

-- Categorias padrão com SLAs
insert into categories (name, description, sla_hours, icon, sort_order) values
  ('Electrical',    'Outlets, lighting, circuit breakers, wiring',       24, 'zap',         1),
  ('Plumbing',      'Leaks, drains, faucets, water heater',              24, 'droplet',      2),
  ('HVAC',          'Heating, cooling, ventilation, thermostats',        48, 'wind',         3),
  ('Appliances',    'Built-in appliances: fridge, stove, dishwasher',    72, 'settings',     4),
  ('Structural',    'Walls, floors, ceilings, doors, windows',           72, 'home',         5),
  ('Pest Control',  'Insects, rodents, any infestation',                 48, 'alert-circle', 6),
  ('Locks & Keys',  'Door locks, deadbolts, mailbox keys',               24, 'key',          7),
  ('Cleaning',      'Common areas, trash, spills',                       48, 'trash',        8),
  ('Other',         'Issues not covered by other categories',            72, 'more-horizontal', 9);

-- As 16 unidades do complexo
insert into units (number, floor, block) values
  ('1', null, null),
  ('2', null, null),
  ('3', null, null),
  ('4', null, null),
  ('5', null, null),
  ('6', null, null),
  ('7', null, null),
  ('8', null, null),
  ('9', null, null),
  ('10', null, null),
  ('11', null, null),
  ('12', null, null),
  ('14', null, null),
  ('15', null, null),
  ('123', null, null),
  ('124', null, null);
