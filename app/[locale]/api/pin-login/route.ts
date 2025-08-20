import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ojo: solo en el backend
);

export async function POST(req: Request) {
  const { pin } = await req.json();

  console.log('PIN', pin)

  // Buscar usuario por PIN
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("profile_id, pin_hash")
    .eq("pin_hash", null) // Esto se ajusta abajo
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "PIN inválido" }, { status: 401 });
  }

  // Verificar el hash
  const isValid = await bcrypt.compare(pin, profile.pin_hash);
  if (!isValid) {
    return NextResponse.json({ error: "PIN inválido" }, { status: 401 });
  }

  // Generar un magic link o session
  const { data: magicLink, error: magicError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: "test@example.com", // 👈 aquí está el detalle
    });

  if (magicError) {
    return NextResponse.json({ error: magicError.message }, { status: 500 });
  }

  return NextResponse.json({ url: magicLink.properties.action_link });
}