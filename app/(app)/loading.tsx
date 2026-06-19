export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 h-8 w-48 rounded-lg" style={{ background: "var(--line)" }} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl" style={{ background: "var(--line)" }} />
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-lg" style={{ background: "var(--line)" }} />
        ))}
      </div>
    </div>
  );
}
