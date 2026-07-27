/**
 * Global real estate markets: countries and their key cities/regions. Replaces
 * the source app's UK-postcode selector (shared/ukPostcodes.ts) so advisors
 * anywhere can select the markets they cover, not just UK postcode areas.
 */
export type Country = { code: string; name: string };

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "CH", name: "Switzerland" },
  { code: "MC", name: "Monaco" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "IT", name: "Italy" },
  { code: "GR", name: "Greece" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "JP", name: "Japan" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
];

/**
 * Key cities/regions per country. Mirrors the source app's area -> district
 * drill-down: selecting a country reveals its cities.
 */
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  US: ["New York", "Miami", "Los Angeles", "Aspen", "San Francisco", "Palm Beach"],
  GB: ["London", "Edinburgh", "Manchester", "Bath"],
  AE: ["Dubai", "Abu Dhabi"],
  CH: ["Geneva", "Zurich", "Gstaad", "St. Moritz"],
  MC: ["Monte Carlo"],
  SG: ["Singapore"],
  HK: ["Hong Kong"],
  FR: ["Paris", "Cannes", "Courchevel", "Saint-Tropez"],
  ES: ["Madrid", "Marbella", "Ibiza", "Barcelona"],
  PT: ["Lisbon", "Cascais", "Comporta"],
  IT: ["Milan", "Rome", "Portofino", "Lake Como"],
  GR: ["Athens", "Mykonos", "Santorini"],
  AU: ["Sydney", "Melbourne", "Gold Coast"],
  CA: ["Toronto", "Vancouver", "Whistler"],
  DE: ["Berlin", "Munich"],
  JP: ["Tokyo", "Kyoto"],
  TH: ["Bangkok", "Phuket"],
  TR: ["Istanbul", "Bodrum"],
  SA: ["Riyadh", "Jeddah"],
  QA: ["Doha"],
};

export function citiesForCountry(code: string): string[] {
  return CITIES_BY_COUNTRY[code] ?? [];
}

export function countryLabel(code: string): string {
  const found = COUNTRIES.find((c) => c.code === code);
  return found ? found.name : code;
}

/**
 * A selected location value is either a bare country code ("US") or a
 * "COUNTRYCODE::City Name" pair ("US::New York"), mirroring the source app's
 * area/district encoding.
 */
export function isCityValue(value: string): boolean {
  return value.includes("::");
}

export function locationLabel(value: string): string {
  if (isCityValue(value)) {
    const [code = "", city = ""] = value.split("::");
    return `${city}, ${countryLabel(code)}`;
  }
  return countryLabel(value);
}
