import { Logo } from "./Logo";

export function Sidebar({
  onNewContent,
  onGetFullAccess,
}: {
  onNewContent: () => void;
  onGetFullAccess: () => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-advsr-border md:flex">
      <div className="flex h-16 items-center gap-2 px-4">
        <Logo className="h-5 w-auto" />
        <span className="font-heading text-lg font-bold tracking-wide text-advsr-text">
          AD<span className="text-advsr-orange">V</span>SR
        </span>
        <span className="text-sm font-medium text-advsr-muted">Content Engine</span>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onNewContent}
          className="w-full rounded-lg bg-advsr-orange px-3 py-2 text-left font-heading text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          + New content ✨
        </button>
      </div>

      <div className="px-4 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-advsr-muted">
        History
      </div>

      <div className="flex-1" />

      <div className="border-t border-advsr-border p-3">
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
