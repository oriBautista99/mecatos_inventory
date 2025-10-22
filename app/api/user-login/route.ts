import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase.from("profiles").select(
    `
      profile_id,
      username,
      email,
      auth_user,
      role_id,
      roles (
        role_id,
        name,
        description,
        role_permissions (
          permission_id,
          permissions (
            permission_id,
            name,
            description,
            code
          )
        )
      )
    `
  ).eq("auth_user", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}