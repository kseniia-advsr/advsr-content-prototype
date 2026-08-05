export function Sidebar({
  onNewContent,
  onGetFullAccess,
  newContentDisabled,
}: {
  onNewContent: () => void;
  onGetFullAccess: () => void;
  /** Locks "+ New content" while the insights funnel is pending or open, so a reset can't land mid-funnel. */
  newContentDisabled?: boolean;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col md:flex">
      <div className="flex h-16 items-center gap-2 px-4">
        <img src="/logo.png" alt="ADVSR" className="h-5 w-auto" />
        <span className="text-sm font-medium text-advsr-muted">Content Engine</span>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onNewContent}
          disabled={newContentDisabled}
          className="w-full rounded-lg bg-advsr-orange px-3 py-2 text-left font-heading text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + New content
        </button>
      </div>

      <div className="px-4 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-advsr-muted">
        History
      </div>

      <div className="flex-1" />

      <div className="px-3 pb-2 pt-3">
        <button
          type="button"
          onClick={onGetFullAccess}
          className="w-full rounded-lg bg-advsr-orange px-3 py-2 font-heading text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Get full access
        </button>
      </div>
    </aside>
  );
}
