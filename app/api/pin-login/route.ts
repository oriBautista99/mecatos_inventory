import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  
  const { pin } = await req.json();
  // Buscar usuario por PIN
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("profile_id, email, pin_hash");

  if (error || !profile || profile.length === 0) {
    return NextResponse.json({ error: "PIN inválido" }, { status: 401 });
  }

  // Verificar el hash
  const isValid = profile.find((p) => bcrypt.compareSync(pin, p.pin_hash));
  if (!isValid) {
    return NextResponse.json({ error: "PIN inválido" }, { status: 401 });
  }

  console.log(isValid)

  return NextResponse.json(isValid.email);
}