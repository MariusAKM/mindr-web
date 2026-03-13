import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;

  // Look up the NFC tag → get event_id and owner_id (profile)
  const { data, error } = await supabase
    .from("nfc_tags")
    .select("id, event_id, owner_id")
    .eq("id", tag)
    .single();

  if (error || !data || !data.event_id || !data.owner_id) {
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

  redirect(`/e/${data.event_id}/p/${data.owner_id}`);
}
