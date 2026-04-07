import { supabase } from "@/lib/supabase";

export default async function EventTagPage({
  params,
}: {
  params: Promise<{ eventId: string; tagId: string }>;
}) {
  const { eventId, tagId } = await params;

  // Look up tag by public_code or UUID — eventId used for display only, not for lookup
  // Only include id lookup when tagId is a valid UUID (avoids Postgres cast error)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tagId);
  const orFilter = isUUID
    ? `public_code.eq.${tagId},id.eq.${tagId}`
    : `public_code.eq.${tagId}`;

  const { data: tag } = await supabase
    .from("nfc_tags")
    .select(`
      id,
      event_id,
      event_profile_id,
      event_profiles (
        id,
        display_name,
        status,
        claimed_by_user_id,
        profiles ( display_name, avatar_url )
      )
    `)
    .or(orFilter)
    .limit(1)
    .maybeSingle();

  // Fetch event for branding — lookup by short_id (numeric) or UUID (fallback)
  const isNumeric = /^\d+$/.test(eventId);
  const { data: event } = await supabase
    .from("events")
    .select("id, name, background_url, theme_color")
    .eq(isNumeric ? "short_id" : "id", eventId)
    .maybeSingle();

  // Tag ikke fundet → 404
  if (!tag) {
    return (
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif",
        background: "#0e0e10", color: "#fff", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>MINDR</h1>
        <p style={{ color: "#888", margin: 0 }}>Ukendt armbånd.</p>
      </main>
    );
  }

  const bg    = event?.background_url ?? null;
  const theme = event?.theme_color ?? "#0E410E";

  // Resolve profile info
  const ep = tag?.event_profile_id
    ? (Array.isArray(tag.event_profiles) ? tag.event_profiles[0] : tag.event_profiles)
    : null;
  const claimedProfile = ep?.profiles
    ? (Array.isArray(ep.profiles) ? ep.profiles[0] : ep.profiles)
    : null;
  const displayName = ep?.display_name ?? claimedProfile?.display_name ?? null;
  const avatarUrl   = (claimedProfile as { avatar_url?: string } | null)?.avatar_url ?? null;

  // Build deep link — always use real event UUID for app deep link
  const realEventId = event?.id ?? eventId;
  const resolvedProfileId = ep?.id ?? tag?.id;
  const appUrl = resolvedProfileId
    ? `mindr://open?event=${realEventId}&profile=${resolvedProfileId}`
    : `mindr://open?event=${realEventId}`;

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
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName ?? ""}
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
            {displayName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>
          {displayName ?? "Ukendt profil"}
        </h1>
        <p style={{ margin: "0 0 20px", fontSize: 14, opacity: 0.7 }}>
          {event?.name ?? "Ukendt event"}
        </p>

        <a
          href={appUrl}
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

      <p style={{ position: "relative", zIndex: 1, marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>
        MINDR
      </p>
    </main>
  );
}
