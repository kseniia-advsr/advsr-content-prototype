import { useState } from "react";
import { COUNTRIES, citiesForCountry } from "../../engine/countries";

type Props = {
  label: string;
  help?: string;
  value: string[];
  onChange: (next: string[]) => void;
};

/** Country -> city drill-down multi-select, used for "markets you cover". */
export function LocationField({ label, help, value, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const selectedCountries = value.filter((v) => !v.includes("::"));

  const toggleCountry = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((v) => v !== code && !v.startsWith(`${code}::`)));
    } else {
      onChange([...value, code]);
    }
  };

  const toggleCity = (code: string, city: string) => {
    const key = `${code}::${city}`;
    onChange(value.includes(key) ? value.filter((v) => v !== key) : [...value, key]);
  };

  return (
    <div>
      <p className="font-medium text-advsr-text">{label}</p>
      {help && <p className="mt-1 text-sm text-advsr-muted">{help}</p>}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search countries..."
        className="mt-3 w-full rounded-lg border border-advsr-border bg-advsr-surface px-3 py-2 text-advsr-text placeholder:text-advsr-muted focus:border-advsr-orange focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {filtered.slice(0, 14).map((country) => {
          const active = value.includes(country.code);
          return (
            <button
              key={country.code}
              type="button"
              onClick={() => toggleCountry(country.code)}
              className={
                "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                (active
                  ? "border-advsr-orange bg-advsr-orange/15 text-advsr-orange"
                  : "border-advsr-border text-advsr-muted hover:border-advsr-orange-2 hover:text-advsr-text")
              }
            >
              {country.name}
            </button>
          );
        })}
      </div>

      {selectedCountries.map((code) => {
        const country = COUNTRIES.find((c) => c.code === code);
        const cities = citiesForCountry(code);
        if (!cities.length) return null;
        return (
          <div key={code} className="mt-3 rounded-lg border border-advsr-border p-3">
            <p className="text-sm text-advsr-muted">{country?.name}: key cities</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {cities.map((city) => {
                const active = value.includes(`${code}::${city}`);
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleCity(code, city)}
                    className={
                      "rounded-full border px-3 py-1 text-xs transition-colors " +
                      (active
                        ? "border-advsr-orange bg-advsr-orange/15 text-advsr-orange"
                        : "border-advsr-border text-advsr-muted hover:border-advsr-orange-2 hover:text-advsr-text")
                    }
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
