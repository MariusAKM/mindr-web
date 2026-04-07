import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;

  // Prøv public_code først, derefter UUID (bagudkompatibilitet)
  // Only include id lookup when tag is a valid UUID (avoids Postgres cast error)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tag);
  const orFilter = isUUID
    ? `public_code.eq.${tag},id.eq.${tag}`
    : `public_code.eq.${tag}`;

  const { data } = await supabase
    .from("nfc_tags")
    .select(`
      id,
      event_id,
      event_profile_id,
      event_profiles (
        id,
        event_id
      ),
      events (
        short_id
      )
    `)
    .or(orFilter)
    .limit(1)
    .maybeSingle();

  // Redirect til /e/{short_id}/t/{tag} for per-event App Clip Experience support
  const eventShortId = (data?.events as { short_id?: number } | null)?.short_id;

  // Ny arkitektur: event_id fra event_profiles
  if (data?.event_profile_id && data?.event_profiles) {
    const ep = Array.isArray(data.event_profiles)
      ? data.event_profiles[0]
      : data.event_profiles;
    if (ep?.event_id) {
      redirect(`/e/${eventShortId ?? ep.event_id}/t/${tag}`);
    }
  }

  // Gammel arkitektur fallback: event_id direkte fra nfc_tags
  if (data?.event_id) {
    redirect(`/e/${eventShortId ?? data.event_id}/t/${tag}`);
  }

  // Tag ikke fundet
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        background: "#0e0e10",
        color: "#fff",
        gap: 12,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>MINDR</h1>
      <p style={{ color: "#888", margin: 0 }}>Ukendt armbånd.</p>
    </main>
  );
}
