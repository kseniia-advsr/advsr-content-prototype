import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-advsr-border px-2.5 py-1 text-xs text-advsr-muted transition-colors hover:border-advsr-orange-2 hover:text-advsr-text"
    >
      {copied ? "Copied" : "Copy and paste"}
    </button>
  );
}
