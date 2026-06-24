"use client";

import { useEffect } from "react";
import { logout } from "../logout/actions";

const ADMIN_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #000; --bg1: #0d0d0d; --surface: #1c1c1e; --surface2: #2c2c2e; --surface3: #3a3a3c;
  --text: #f5f5f7; --text2: #ebebf0cc; --muted: #98989d;
  --blue: #0a84ff; --green: #30d158; --red: #ff453a; --amber: #ff9f0a;
  --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
}
body { background: #111; font-family: -apple-system,'SF Pro Display','SF Pro Text','Inter',sans-serif; color: var(--text); min-height: 100vh; }
.admin-topbar { display:flex; justify-content:space-between; align-items:center; padding:14px 32px; border-bottom:1px solid var(--border); background:#000; }
.admin-topbar-brand { font-size:14px; font-weight:700; letter-spacing:-0.2px; }
.admin-topbar-user { display:flex; align-items:center; gap:14px; }
.admin-topbar-name { font-size:13px; color:var(--text2); }
.admin-topbar-email { font-size:12px; color:var(--muted); }
.logout-btn { background:var(--surface); border:1px solid var(--border2); color:var(--text2); padding:7px 14px; border-radius:10px; font-size:12.5px; cursor:pointer; font-family:inherit; }
.logout-btn:hover { color:var(--text); border-color:var(--border2); }
.screen { display: none; }
.screen.active { display: block; }
.card { background: var(--surface); border-radius: 18px; padding: 16px 18px; margin-bottom: 12px; border: 1px solid var(--border); }
.inp { background: var(--surface); border: 1px solid var(--border2); border-radius: 13px; padding: 13px 15px; color: var(--text); font-size: 15px; width: 100%; font-family: inherit; outline:none; }
.inp.error { border-color: var(--red); }
.field-label { font-size: 11.5px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 7px; display: block; }
.btn { padding: 15px; border-radius: 14px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; font-family: inherit; letter-spacing: -0.2px; }
.btn-blue { background: var(--blue); color: #fff; }
.btn-ghost { background: var(--surface); color: var(--text); border: 1px solid var(--border2); }
.btn-sm { padding: 9px 16px; border-radius: 10px; font-size: 13.5px; width: auto; }
.btn-xs { padding: 7px 13px; border-radius: 9px; font-size: 12.5px; width: auto; }
.badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.1px; }
.b-blue { background: rgba(10,132,255,0.15); color: #4da6ff; }
.b-green { background: rgba(48,209,88,0.15); color: #34c759; }
.b-red { background: rgba(255,69,58,0.15); color: #ff6961; }
.b-amber { background: rgba(255,159,10,0.15); color: #ffb340; }
.b-gray { background: rgba(255,255,255,0.08); color: var(--muted); }
.admin-wrap { padding: 32px 40px 48px; max-width: 1080px; margin: 0 auto; }
.admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
.page-title { font-size: 24px; font-weight: 700; letter-spacing: -0.4px; margin-bottom: 4px; }
.page-sub { font-size: 13px; color: var(--muted); }
.admin-section { margin-bottom: 32px; }
.admin-section:last-child { margin-bottom: 0; }
.section-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; }
.summary-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.summary-card { background: var(--surface); border-radius: 18px; padding: 22px 18px; border: 1px solid var(--border); cursor: pointer; transition: border-color 0.15s, transform 0.1s; }
.summary-card:hover { border-color: var(--border2); transform: translateY(-1px); }
.summary-num { font-size: 34px; font-weight: 700; letter-spacing: -0.6px; line-height: 1; margin-bottom: 8px; }
.summary-label { font-size: 13px; color: var(--muted); font-weight: 500; }
.attention-empty { background: rgba(48,209,88,0.07); border: 1px solid rgba(48,209,88,0.18); border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--text2); }
.attention-list { display: flex; flex-direction: column; gap: 10px; }
.attention-item { background: rgba(255,69,58,0.06); border: 1px solid rgba(255,69,58,0.18); border-radius: 16px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.attention-item:hover { border-color: rgba(255,69,58,0.35); background: rgba(255,69,58,0.1); }
.attention-unit { background: var(--surface2); border-radius: 10px; padding: 6px 12px; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.attention-body { flex: 1; min-width: 0; }
.attention-issue { font-size: 14.5px; font-weight: 600; margin-bottom: 2px; }
.attention-reason { font-size: 12.5px; color: var(--red); }
.attention-arrow { color: var(--muted); font-size: 16px; flex-shrink: 0; }
.filter-toggle { background: none; border: 1px solid var(--border2); color: var(--muted); padding: 5px 12px; border-radius: 14px; font-size: 12px; cursor: pointer; font-family: inherit; }
.filter-toggle:hover { color: var(--text); }
.filter-row { display: flex; gap: 8px; flex-wrap: wrap; padding: 14px 22px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.012); }
.filter-pill { background: var(--surface2); border: 1px solid var(--border); color: var(--muted); padding: 7px 15px; border-radius: 20px; font-size: 12.5px; cursor: pointer; font-family: inherit; }
.filter-pill:hover { border-color: var(--border2); color: var(--text); }
.filter-pill.active { background: rgba(10,132,255,0.12); border-color: rgba(10,132,255,0.4); color: var(--blue); font-weight: 600; }
.table-wrap { background: var(--surface); border-radius: 18px; overflow: hidden; border: 1px solid var(--border); }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.015); }
table { width: 100%; border-collapse: collapse; }
th { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; padding: 13px 18px; text-align: left; border-bottom: 1px solid var(--border); }
td { padding: 15px 18px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13.5px; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tbody tr { cursor: pointer; transition: background 0.12s; }
tbody tr:nth-child(even) td { background: rgba(255,255,255,0.012); }
tbody tr:hover td { background: rgba(255,255,255,0.035); }
.detail-grid { display: grid; grid-template-columns: 1fr 270px; gap: 18px; }
.det-photo-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.det-photo-thumb { aspect-ratio: 1; border-radius: 12px; background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; transition: border-color 0.15s, transform 0.1s; }
.det-photo-thumb:hover { border-color: var(--border2); transform: scale(0.98); }
.det-photos-empty { font-size: 13px; color: var(--muted); }
.lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 1000; }
.lightbox-overlay.open { display: flex; }
.lightbox-box { background: var(--surface); border-radius: 20px; padding: 24px; max-width: 420px; text-align: center; border: 1px solid var(--border2); }
.lightbox-icon { font-size: 64px; margin-bottom: 14px; }
.lightbox-close { margin-top: 16px; }
.back-link { font-size: 13px; color: var(--blue); cursor: pointer; margin-bottom: 16px; display: inline-flex; align-items: center; gap: 5px; }
.back-link:hover { opacity: 0.8; }
.note { border-radius: 13px; padding: 12px 14px; margin-bottom: 8px; }
.note-internal { background: rgba(255,159,10,0.07); border: 1px solid rgba(255,159,10,0.18); }
.note-public { background: rgba(255,255,255,0.03); border: 1px solid var(--border); }
.note-meta { display: flex; justify-content: space-between; margin-bottom: 6px; }
.note-tag-internal { font-size: 11px; font-weight: 600; color: var(--amber); }
.note-tag-public { font-size: 11px; font-weight: 500; color: var(--muted); }
.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 50; align-items: flex-end; justify-content: center; }
.modal-overlay.open { display: flex; }
.modal-sheet { background: #1c1c1e; border-radius: 22px 22px 0 0; padding: 10px 22px 32px; width: 100%; max-width: 520px; border: 1px solid var(--border2); border-bottom: none; }
.modal-handle { width: 36px; height: 4px; background: var(--surface3); border-radius: 2px; margin: 12px auto 20px; }
.modal-title { font-size: 17px; font-weight: 700; margin-bottom: 16px; }
.status-opt { display: flex; justify-content: space-between; align-items: center; padding: 13px 15px; border-radius: 12px; cursor: pointer; font-size: 14.5px; margin-bottom: 6px; border: 1.5px solid transparent; }
.status-opt:hover { background: var(--surface2); }
.status-opt.sel { border-color: var(--blue); background: rgba(10,132,255,0.08); }
.divider { border: none; border-top: 1px solid var(--border); margin: 14px 0; }
.row { display: flex; justify-content: space-between; align-items: center; }
.mb-8 { margin-bottom: 8px; } .mb-12 { margin-bottom: 12px; } .mb-16 { margin-bottom: 16px; }
.flash { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(80px); background: var(--surface2); border: 1px solid var(--border2); border-radius: 14px; padding: 12px 20px; font-size: 14px; z-index: 200; opacity: 0; transition: all 0.28s cubic-bezier(.34,1.56,.64,1); white-space: nowrap; }
.flash.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.flash-green { border-color: rgba(48,209,88,0.35); color: var(--green); }
.flash-blue { border-color: rgba(10,132,255,0.35); color: var(--blue); }
.flash-red { border-color: rgba(255,69,58,0.35); color: var(--red); }
`;

const ADMIN_HTML = `
<div class="screen active" id="screen-admin-dash">
<div class="admin-wrap">
  <div class="admin-header">
    <div>
      <div class="page-title">Dashboard</div>
      <div class="page-sub" id="dash-date">Loading…</div>
    </div>
    <button class="btn btn-blue btn-sm" onclick="showFlash('Create request — coming soon.','flash-blue')">+ New Request</button>
  </div>

  <div class="admin-section">
    <div class="section-label" style="color:var(--red);">Needs Attention</div>
    <div id="attention-wrap"></div>
  </div>

  <div class="admin-section">
    <div class="section-label">Quick Summary</div>
    <div class="summary-row">
      <div class="summary-card" onclick="openSection('new')">
        <div class="summary-num" style="color:var(--red);" id="sum-new">3</div>
        <div class="summary-label">New Requests</div>
      </div>
      <div class="summary-card" onclick="openSection('progress')">
        <div class="summary-num" style="color:var(--blue);" id="sum-progress">8</div>
        <div class="summary-label">In Progress</div>
      </div>
      <div class="summary-card" onclick="openSection('parts')">
        <div class="summary-num" style="color:var(--amber);" id="sum-parts">2</div>
        <div class="summary-label">Waiting Parts</div>
      </div>
      <div class="summary-card" onclick="openSection('completed')">
        <div class="summary-num" style="color:var(--green);" id="sum-completed">4</div>
        <div class="summary-label">Completed</div>
      </div>
    </div>
  </div>

  <div class="admin-section">
    <div class="table-wrap">
      <div class="table-header">
        <div style="font-size:15px;font-weight:600;" id="table-title">Recent Requests</div>
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="font-size:12px;color:var(--muted);" id="table-count">5 requests</span>
          <button class="filter-toggle" onclick="toggleFilters()">⚙ Filter</button>
        </div>
      </div>

      <div class="filter-row" id="filter-row" style="display:none;">
        <button class="filter-pill active" data-filter="all" onclick="applyFilter('all')">All</button>
        <button class="filter-pill" data-filter="new" onclick="applyFilter('new')">New</button>
        <button class="filter-pill" data-filter="reviewed" onclick="applyFilter('reviewed')">Reviewed</button>
        <button class="filter-pill" data-filter="progress" onclick="applyFilter('progress')">In Progress</button>
        <button class="filter-pill" data-filter="parts" onclick="applyFilter('parts')">Waiting Parts</button>
        <button class="filter-pill" data-filter="scheduled" onclick="applyFilter('scheduled')">Scheduled</button>
        <button class="filter-pill" data-filter="completed" onclick="applyFilter('completed')">Completed</button>
        <button class="filter-pill" data-filter="overdue" onclick="applyFilter('overdue')">⚠️ Overdue</button>
      </div>

      <table><thead><tr>
        <th>Unit</th><th>Issue</th><th>Status</th><th>Date</th>
      </tr></thead><tbody id="req-tbody"></tbody></table>
    </div>
  </div>
</div>
</div>

<div class="screen" id="screen-admin-detail">
<div class="admin-wrap">
  <div onclick="go('admin-dash')" class="back-link">← All Requests</div>
  <div class="admin-header">
    <div>
      <div style="font-size:20px;font-weight:700;letter-spacing:-0.3px;margin-bottom:6px;" id="det-protocol">NF-002</div>
      <span class="badge b-blue" id="det-status-badge">In Progress</span>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-ghost btn-sm" onclick="openPriorityModal()">Edit Priority</button>
      <button class="btn btn-blue btn-sm" onclick="openStatusModal()">Update Status →</button>
    </div>
  </div>

  <div class="detail-grid">
    <div>
      <div class="card mb-12">
        <div class="row mb-12">
          <div style="font-size:16px;font-weight:600;" id="det-cat-room">⚡ Electrical · Kitchen</div>
          <span class="badge b-blue" id="det-priority-badge">Medium</span>
        </div>
        <div style="font-size:14px;color:var(--text2);line-height:1.65;margin-bottom:14px;" id="det-desc">The outlet near the sink stopped working. I tried resetting the breaker but it didn't help.</div>
        <div id="det-access-wrap" style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:11px;padding:11px 14px;font-size:13px;color:var(--muted);">
          <span style="font-weight:600;color:var(--text2);">Access Notes: </span><span id="det-access">Dog inside, please knock before entering.</span>
        </div>
      </div>

      <div id="det-photos-section" class="card mb-12">
        <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Photos & Videos</div>
        <div id="det-photos-grid" class="det-photo-grid"></div>
      </div>

      <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Notes</div>

      <div class="note note-internal mb-8">
        <div class="note-meta">
          <span class="note-tag-internal">🔒 Internal</span>
          <span style="font-size:11px;color:var(--muted);">Sarah · Jun 15, 11:02 AM</span>
        </div>
        <div style="font-size:13.5px;color:var(--text2);">GFCI tripped. Mike will check today, might need replacement (~$40).</div>
      </div>
      <div class="note note-public mb-8">
        <div class="note-meta">
          <span class="note-tag-public">Public · visible to tenant</span>
          <span style="font-size:11px;color:var(--muted);">Sarah · Jun 16, 9:00 AM</span>
        </div>
        <div style="font-size:13.5px;color:var(--text2);">Technician Mike is working on the outlet. Should be resolved today.</div>
      </div>

      <div id="extra-notes"></div>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;margin-top:4px;">
        <textarea class="inp" id="note-input" rows="2" placeholder="Write a note…" style="margin-bottom:10px;"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-xs" style="background:rgba(255,159,10,0.12);color:var(--amber);border:1px solid rgba(255,159,10,0.2);border-radius:9px;" onclick="addNote(true)">🔒 Internal</button>
          <button class="btn btn-blue btn-xs" onclick="addNote(false)">Send to Tenant</button>
        </div>
      </div>
    </div>

    <div>
      <div class="card mb-12">
        <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Tenant</div>
        <div style="font-size:15px;font-weight:600;margin-bottom:4px;" id="det-name">Maria Johnson</div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:2px;" id="det-email">maria@email.com</div>
        <div style="font-size:13px;color:var(--muted);" id="det-phone">(555) 123-4567</div>
        <div class="divider"></div>
        <div class="row"><span style="font-size:12px;color:var(--muted);">Unit</span><span style="font-size:13px;font-weight:500;" id="det-unit">Unit 1</span></div>
      </div>
      <div class="card">
        <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Status History</div>
        <div id="status-history">
          <div class="mb-8">
            <div style="font-size:12.5px;margin-bottom:3px;"><span class="badge b-gray" style="font-size:11px;">New</span> → <span class="badge b-gray" style="font-size:11px;">Reviewed</span></div>
            <div style="font-size:11px;color:var(--muted);">Sarah · Jun 15, 11:02 AM</div>
          </div>
          <div>
            <div style="font-size:12.5px;margin-bottom:3px;"><span class="badge b-gray" style="font-size:11px;">Reviewed</span> → <span class="badge b-blue" style="font-size:11px;">In Progress</span></div>
            <div style="font-size:11px;color:var(--muted);">Sarah · Jun 16, 9:00 AM</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

<div class="modal-overlay" id="modal-status">
<div class="modal-sheet">
  <div class="modal-handle"></div>
  <div class="modal-title">Update Status</div>
  <div id="status-opts"></div>
  <div id="resolution-wrap" style="display:none;margin-top:10px;">
    <label class="field-label">Resolution Summary <span style="color:var(--red);">— Required</span></label>
    <textarea class="inp" id="resolution-txt" rows="3" placeholder="Describe what was done to resolve the issue…" style="margin-bottom:0;"></textarea>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
    <button class="btn btn-ghost btn-sm" onclick="closeModal('modal-status')">Cancel</button>
    <button class="btn btn-blue btn-sm" onclick="confirmStatus()">Confirm</button>
  </div>
</div>
</div>

<div class="modal-overlay" id="modal-priority">
<div class="modal-sheet">
  <div class="modal-handle"></div>
  <div class="modal-title">Set Priority</div>
  <div id="priority-opts"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
    <button class="btn btn-ghost btn-sm" onclick="closeModal('modal-priority')">Cancel</button>
    <button class="btn btn-blue btn-sm" onclick="confirmPriority()">Save</button>
  </div>
</div>
</div>

<div class="lightbox-overlay" id="lightbox-overlay" onclick="if(event.target===this) closeLightbox()">
  <div class="lightbox-box">
    <div class="lightbox-icon" id="lightbox-icon">🖼️</div>
    <div style="font-size:14px;color:var(--text2);">Photo preview — <span id="lightbox-label">Photo 1</span></div>
    <div style="font-size:12px;color:var(--muted);margin-top:4px;">Submitted by tenant</div>
    <button class="btn btn-ghost btn-sm lightbox-close" onclick="closeLightbox()">Close</button>
  </div>
</div>

<div class="flash" id="flash-el"></div>
`;

const ADMIN_JS = `
(function() {
const REQUESTS = [
  { id:'NF-005', unit:'4', cat:'⚡ Electrical',  status:'new',           sb:'b-red',   priority:'Urgent', pb:'b-red',   stuck:true,  reason:'Overdue by 1 day',      date:'Jun 17', photos:3 },
  { id:'NF-004', unit:'9', cat:'💧 Plumbing',    status:'in_progress',   sb:'b-blue',  priority:'High',   pb:'b-amber', stuck:true,  reason:'Overdue, 6h left',      date:'Jun 16', photos:1 },
  { id:'NF-003', unit:'124', cat:'🌬️ HVAC',        status:'scheduled',     sb:'b-gray',  priority:'Medium', pb:'b-gray',  stuck:false, reason:'',                       date:'Jun 15', photos:0, overdue:false },
  { id:'NF-002', unit:'7', cat:'⚡ Electrical',  status:'in_progress',   sb:'b-blue',  priority:'Medium', pb:'b-blue',  stuck:true,  reason:'No update in 4 days',   date:'Jun 15', photos:2 },
  { id:'NF-001', unit:'12', cat:'🔑 Locks',       status:'waiting_parts', sb:'b-amber', priority:'Low',    pb:'b-gray',  stuck:false, reason:'',                       date:'Jun 14', photos:0, overdue:false },
  { id:'NF-006', unit:'2', cat:'🚿 Plumbing',     status:'completed',     sb:'b-green', priority:'Medium', pb:'b-blue',  stuck:false, reason:'',                       date:'Jun 13', photos:4, overdue:false },
];
REQUESTS[0].overdue = true; REQUESTS[1].overdue = true;
const SL = { new:'New', reviewed:'Reviewed', scheduled:'Scheduled', in_progress:'In Progress', waiting_parts:'Waiting Parts', completed:'Completed', closed:'Closed' };
const SB = { new:'b-red', reviewed:'b-gray', scheduled:'b-gray', in_progress:'b-blue', waiting_parts:'b-amber', completed:'b-green', closed:'b-gray' };
const STATUSES = ['new','reviewed','scheduled','in_progress','waiting_parts','completed','closed'];
const PRIORITIES = [{key:'Low',badge:'b-gray'},{key:'Medium',badge:'b-blue'},{key:'High',badge:'b-amber'},{key:'Urgent',badge:'b-red'}];

let S = { currentStatus:'in_progress', selectedStatus:null, adminPriority:'Medium', selectedAdminPriority:'Medium' };

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
  if(id==='admin-dash') { renderAttention(); renderTable('all'); }
}

function showFlash(msg, cls) {
  const el = document.getElementById('flash-el');
  el.textContent = msg; el.className = 'flash '+(cls||'')+' show';
  setTimeout(() => el.classList.remove('show'), 3000);
}

function renderAttention() {
  const items = REQUESTS.filter(r => r.stuck);
  const wrap = document.getElementById('attention-wrap');
  if (!items.length) {
    wrap.innerHTML = '<div class="attention-empty"><span style="font-size:18px;">✓</span><span>Nothing needs attention right now. All requests are on track.</span></div>';
    return;
  }
  wrap.innerHTML = '<div class="attention-list">' + items.map(r =>
    '<div class="attention-item" onclick="openDetail(\\''+r.id+'\\',\\''+r.unit+'\\',\\''+r.cat+'\\',\\''+r.status+'\\',\\''+r.sb+'\\',\\''+r.priority+'\\',\\''+r.pb+'\\')">' +
      '<div class="attention-unit">Unit '+r.unit+'</div>' +
      '<div class="attention-body">' +
        '<div class="attention-issue">'+r.cat+'</div>' +
        '<div class="attention-reason">'+r.reason+'</div>' +
      '</div>' +
      '<div class="attention-arrow">→</div>' +
    '</div>').join('') + '</div>';
}

function toggleFilters() {
  const row = document.getElementById('filter-row');
  row.style.display = row.style.display === 'none' ? 'flex' : 'none';
}

function openSection(f) {
  document.getElementById('filter-row').style.display = 'flex';
  applyFilter(f);
}

function renderTable(filter) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.filter===filter));
  const titles={all:'Recent Requests',new:'New',reviewed:'Reviewed',progress:'In Progress',parts:'Waiting Parts',scheduled:'Scheduled',completed:'Completed',overdue:'⚠️ Overdue'};
  const filters={new:r=>r.status==='new',reviewed:r=>r.status==='reviewed',progress:r=>r.status==='in_progress',parts:r=>r.status==='waiting_parts',scheduled:r=>r.status==='scheduled',completed:r=>r.status==='completed',overdue:r=>r.overdue};
  const data = filter==='all' ? REQUESTS : REQUESTS.filter(filters[filter]||(() => true));
  document.getElementById('table-title').textContent = titles[filter]||'Requests';
  document.getElementById('table-count').textContent = data.length + ' request' + (data.length!==1?'s':'');
  document.getElementById('req-tbody').innerHTML = data.length
    ? data.map(r=>'<tr onclick="openDetail(\\''+r.id+'\\',\\''+r.unit+'\\',\\''+r.cat+'\\',\\''+r.status+'\\',\\''+r.sb+'\\',\\''+r.priority+'\\',\\''+r.pb+'\\')">' +
        '<td><span style="background:var(--surface2);border-radius:8px;padding:3px 9px;font-size:12.5px;font-weight:600;">'+r.unit+'</span></td>' +
        '<td>'+r.cat+'</td>' +
        '<td><span class="badge '+r.sb+'">'+SL[r.status]+'</span></td>' +
        '<td style="color:var(--muted);font-size:12.5px;">'+r.date+'</td>' +
      '</tr>').join('')
    : '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:28px;">No requests found.</td></tr>';
}

function applyFilter(f) { renderTable(f); }

function openDetail(id,unit,cat,status,sb,priority,pb) {
  document.getElementById('det-protocol').textContent=id;
  const sbe=document.getElementById('det-status-badge'); sbe.textContent=SL[status]; sbe.className='badge '+sb;
  document.getElementById('det-cat-room').textContent=cat+' · Kitchen';
  const pbe=document.getElementById('det-priority-badge'); pbe.textContent=priority; pbe.className='badge '+pb;
  document.getElementById('det-unit').textContent='Unit '+unit;
  S.currentStatus=status; S.selectedStatus=status; S.adminPriority=priority; S.selectedAdminPriority=priority;
  const req = REQUESTS.find(r => r.id === id);
  renderDetailPhotos(req ? req.photos : 0);
  go('admin-detail');
}

function renderDetailPhotos(count) {
  const grid = document.getElementById('det-photos-grid');
  if (!count) {
    grid.innerHTML = '<div class="det-photos-empty">No photos or videos submitted by the tenant.</div>';
    return;
  }
  grid.innerHTML = Array.from({length: count}, (_, i) =>
    '<div class="det-photo-thumb" onclick="openLightbox('+(i+1)+')">📷</div>'
  ).join('');
}

function openLightbox(n) {
  document.getElementById('lightbox-label').textContent = 'Photo '+n;
  document.getElementById('lightbox-overlay').classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox-overlay').classList.remove('open');
}

function openStatusModal() {
  S.selectedStatus=S.currentStatus;
  document.getElementById('resolution-wrap').style.display='none';
  document.getElementById('resolution-txt').classList.remove('error');
  document.getElementById('status-opts').innerHTML=STATUSES.map(s=>
    '<div class="status-opt '+(s===S.currentStatus?'sel':'')+'" onclick="selectStatus(\\''+s+'\\',this)">' +
      '<span>'+SL[s]+'</span><span class="badge '+SB[s]+'" style="font-size:11px;">'+SL[s]+'</span>' +
    '</div>').join('');
  document.getElementById('modal-status').classList.add('open');
}

function selectStatus(key,el) {
  S.selectedStatus=key;
  document.querySelectorAll('#status-opts .status-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('resolution-wrap').style.display=key==='completed'?'block':'none';
}

function confirmStatus() {
  if(!S.selectedStatus) return;
  if(S.selectedStatus==='completed'&&!document.getElementById('resolution-txt').value.trim()) {
    document.getElementById('resolution-txt').classList.add('error');
    showFlash('Resolution summary is required for Completed.','flash-red'); return;
  }
  const label=SL[S.selectedStatus], badge=SB[S.selectedStatus];
  S.currentStatus=S.selectedStatus;
  const sbe=document.getElementById('det-status-badge'); sbe.textContent=label; sbe.className='badge '+badge;
  const now=new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  document.getElementById('status-history').innerHTML+=
    '<div style="margin-top:8px;">' +
      '<div style="font-size:12.5px;margin-bottom:3px;"><span class="badge b-gray" style="font-size:11px;">prev</span> → <span class="badge '+badge+'" style="font-size:11px;">'+label+'</span></div>' +
      '<div style="font-size:11px;color:var(--muted);">Admin · '+now+'</div>' +
    '</div>';
  closeModal('modal-status');
  showFlash('Status updated to ' + label,'flash-green');
}

function openPriorityModal() {
  S.selectedAdminPriority=S.adminPriority;
  document.getElementById('priority-opts').innerHTML=PRIORITIES.map(p=>
    '<div class="status-opt '+(p.key===S.adminPriority?'sel':'')+'" onclick="selectAdminPriority(\\''+p.key+'\\',this)">' +
      '<span>'+p.key+'</span><span class="badge '+p.badge+'" style="font-size:11px;">'+p.key+'</span>' +
    '</div>').join('');
  document.getElementById('modal-priority').classList.add('open');
}

function selectAdminPriority(key,el) {
  S.selectedAdminPriority=key;
  document.querySelectorAll('#priority-opts .status-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
}

function confirmPriority() {
  S.adminPriority=S.selectedAdminPriority;
  const p=PRIORITIES.find(x=>x.key===S.adminPriority);
  const pb=document.getElementById('det-priority-badge'); pb.textContent=p.key; pb.className='badge '+p.badge;
  closeModal('modal-priority');
  showFlash('Priority set to ' + p.key,'flash-blue');
}

function addNote(isInternal) {
  const inp=document.getElementById('note-input'), text=inp.value.trim();
  if(!text) { inp.classList.add('error'); return; }
  inp.classList.remove('error');
  const now=new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  const div=document.createElement('div');
  div.className='note '+(isInternal?'note-internal':'note-public')+' mb-8';
  div.innerHTML='<div class="note-meta"><span class="'+(isInternal?'note-tag-internal':'note-tag-public')+'">'+(isInternal?'🔒 Internal':'Public · visible to tenant')+'</span><span style="font-size:11px;color:var(--muted);">Admin · '+now+'</span></div><div style="font-size:13.5px;color:var(--text2);">'+text+'</div>';
  document.getElementById('extra-notes').appendChild(div);
  inp.value='';
  showFlash(isInternal?'Internal note saved.':'Note sent to tenant.', isInternal?'flash-blue':'flash-green');
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m => m.addEventListener('click',e=>{ if(e.target===m) m.classList.remove('open'); }));

renderAttention();
renderTable('all');
const D=new Date(), days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], months=['January','February','March','April','May','June','July','August','September','October','November','December'];
document.getElementById('dash-date').textContent=days[D.getDay()]+', '+months[D.getMonth()]+' '+D.getDate()+', '+D.getFullYear();

window.go = go;
window.showFlash = showFlash;
window.toggleFilters = toggleFilters;
window.openSection = openSection;
window.applyFilter = applyFilter;
window.openDetail = openDetail;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.openStatusModal = openStatusModal;
window.selectStatus = selectStatus;
window.confirmStatus = confirmStatus;
window.openPriorityModal = openPriorityModal;
window.selectAdminPriority = selectAdminPriority;
window.confirmPriority = confirmPriority;
window.addNote = addNote;
window.closeModal = closeModal;
})();
`;

export default function AdminApp({ name, email }: { name: string; email: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.id = "admin-app-script";
    script.textContent = ADMIN_JS;
    document.body.appendChild(script);
    return () => {
      document.getElementById("admin-app-script")?.remove();
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ADMIN_CSS }} />
      <div className="admin-topbar">
        <div className="admin-topbar-brand">North Fork Apartments</div>
        <div className="admin-topbar-user">
          <div>
            <div className="admin-topbar-name">{name}</div>
            <div className="admin-topbar-email">{email}</div>
          </div>
          <form action={logout}>
            <button type="submit" className="logout-btn">
              Log Out
            </button>
          </form>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: ADMIN_HTML }} />
    </>
  );
}
