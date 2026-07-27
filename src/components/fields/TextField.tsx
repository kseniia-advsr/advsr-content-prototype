import type { ToneField } from "../../engine/toneProfile";

type Props = {
  field: ToneField;
  value: string;
  onChange: (next: string) => void;
  multiline?: boolean;
};

export function TextField({ field, value, onChange, multiline }: Props) {
  return (
    <div>
      <label className="font-medium text-advsr-text" htmlFor={field.id}>
        {field.label}
      </label>
      {field.help && <p className="mt-1 text-sm text-advsr-muted">{field.help}</p>}
      {multiline ? (
        <textarea
          id={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="mt-3 w-full rounded-lg border border-advsr-border bg-advsr-surface px-3 py-2 text-advsr-text placeholder:text-advsr-muted focus:border-advsr-orange focus:outline-none"
        />
      ) : (
        <input
          id={field.id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="mt-3 w-full rounded-lg border border-advsr-border bg-advsr-surface px-3 py-2 text-advsr-text placeholder:text-advsr-muted focus:border-advsr-orange focus:outline-none"
        />
      )}
    </div>
  );
}
