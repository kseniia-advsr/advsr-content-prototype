import type { ToneField } from "../../engine/toneProfile";

type Props = {
  field: ToneField;
  value: string;
  onChange: (next: string) => void;
};

export function SingleSelectField({ field, value, onChange }: Props) {
  return (
    <div>
      <p className="font-medium text-advsr-text">{field.label}</p>
      {field.help && <p className="mt-1 text-sm text-advsr-muted">{field.help}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {field.options?.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={
                "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                (active
                  ? "border-advsr-orange bg-advsr-orange/15 text-advsr-orange"
                  : "border-advsr-border text-advsr-muted hover:border-advsr-orange-2 hover:text-advsr-text")
              }
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
