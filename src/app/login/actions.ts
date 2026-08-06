"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return "Email and password are required.";

  const user = await verifyCredentials(email, password);
  if (!user) return "Invalid email or password.";

  await createSession(user);
  redirect(user.role === "CLIENT" ? "/portal" : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
