import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminApp from "./AdminApp";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("admin_users")
    .select("name, email")
    .eq("id", user.id)
    .single();

  return (
    <AdminApp
      name={profile?.name ?? "Admin"}
      email={profile?.email ?? user.email ?? ""}
    />
  );
}
