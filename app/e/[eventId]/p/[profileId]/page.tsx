import { supabase } from "@/lib/supabase";

export default async function EventProfilePage({
  params,
}: {
  params: Promise<{ eventId: string; profileId: string }>;
}) {
  const { eventId, profileId } = await params;

  // Fetch event + profile in parallel
  const [eventRes, profileRes] = await Promise.all([
    supabase.from("events").select("id, name, background_url, theme_color").eq("id", eventId).single(),
    supabase.from("profiles").select("id, display_name, avatar_url").eq("id", profileId).single(),
  ]);

  const event   = eventRes.data;
  const profile = profileRes.data;
  const bg      = event?.background_url ?? null;
  const theme   = event?.theme_color ?? "#0E410E";

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
        background: bg ? `url(${bg}) center/cover no-repeat fixed` : theme,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      {/* Scrim */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.65))",
          zIndex: 0,
        }}
      />

      {/* Card */}
      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: 24,
          padding: "32px 28px",
          maxWidth: 360,
          width: "100%",
          color: "#fff",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* Avatar */}
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.display_name ?? ""}
            style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px" }}
          />
        ) : (
          <div
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: theme, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 32, margin: "0 auto 12px",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            {profile?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>
          {profile?.display_name ?? "Ukendt profil"}
        </h1>
        <p style={{ margin: "0 0 20px", fontSize: 14, opacity: 0.7 }}>
          {event?.name ?? "Ukendt event"}
        </p>

        {/* Open in app button */}
        <a
          href={`mindr://e/${eventId}/p/${profileId}`}
          style={{
            display: "block",
            background: theme,
            color: "#fff",
            borderRadius: 50,
            padding: "13px 0",
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
            marginBottom: 10,
          }}
        >
          Åbn i MINDR
        </a>

        <p style={{ fontSize: 12, opacity: 0.5, margin: 0 }}>
          Hent MINDR fra App Store for den bedste oplevelse
        </p>
      </div>

      {/* MINDR branding */}
      <p style={{ position: "relative", zIndex: 1, marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>
        MINDR
      </p>
    </main>
  );
}
