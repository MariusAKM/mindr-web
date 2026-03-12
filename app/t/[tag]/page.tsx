export default async function TagPage({
  params,
}: {
  params: { tag: string };
}) {
  return (
    <main style={{ padding: 40 }}>
      <h1>MINDR</h1>
      <p>Tag scanned:</p>
      <p>{params.tag}</p>
    </main>
  );
}
