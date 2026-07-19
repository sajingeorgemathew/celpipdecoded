// Loading state for the mock-test library and its child routes.
export default function MockTestsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-32 rounded-3xl bg-white/70" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-48 rounded-3xl bg-white/70" />
        <div className="h-48 rounded-3xl bg-white/70" />
        <div className="h-48 rounded-3xl bg-white/70" />
      </div>
    </div>
  );
}
