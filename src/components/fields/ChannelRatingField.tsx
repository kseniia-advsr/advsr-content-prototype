import type { ChannelRatingField as ChannelRatingFieldSchema } from "../../engine/toneProfile";

type Props = {
  field: ChannelRatingFieldSchema;
  value: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
};

export function ChannelRatingField({ field, value, onChange }: Props) {
  const setRating = (channel: string, rating: number) => {
    onChange({ ...value, [channel]: rating });
  };

  return (
    <div>
      <p className="font-medium text-advsr-text">{field.label}</p>
      <p className="mt-1 text-sm text-advsr-muted">Rate each channel 1 to 5.</p>
      <div className="mt-3 space-y-3">
        {field.channels.map((channel) => (
          <div key={channel} className="flex items-center justify-between gap-4">
            <span className="text-sm text-advsr-text">{channel}</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = value[channel] === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(channel, n)}
                    aria-pressed={active}
                    className={
                      "flex size-8 items-center justify-center rounded-lg border text-sm transition-colors " +
                      (active
                        ? "border-advsr-orange bg-advsr-orange/15 text-advsr-orange"
                        : "border-advsr-border text-advsr-muted hover:border-advsr-orange-2 hover:text-advsr-text")
                    }
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
