"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/admin/login?error=Please enter your email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=Invalid email or password.");
  }

  await supabase
    .from("admin_users")
    .update({ last_login: new Date().toISOString() })
    .eq("email", email);

  redirect("/admin/dashboard");
}
