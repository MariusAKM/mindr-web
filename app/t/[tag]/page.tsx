import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;

  // Prøv public_code først, derefter UUID (bagudkompatibilitet)
  const { data } = await supabase
    .from("nfc_tags")
    .select(`
      id,
      event_id,
      event_profile_id,
      event_profiles (
        id,
        event_id
      )
    `)
    .or(`public_code.eq.${tag},id.eq.${tag}`)
    .limit(1)
    .maybeSingle();

  // Ny arkitektur: brug event_profile_id
  if (data?.event_profile_id && data?.event_profiles) {
    const ep = Array.isArray(data.event_profiles)
      ? data.event_profiles[0]
      : data.event_profiles;
    if (ep?.event_id) {
      redirect(`/e/${ep.event_id}/p/${data.event_profile_id}`);
    }
  }

  // Gammel arkitektur fallback: brug event_id + owner direkte fra nfc_tags
  if (data?.event_id && data?.id) {
    redirect(`/e/${data.event_id}/p/${data.id}`);
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
