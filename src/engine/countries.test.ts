import { describe, it, expect } from "vitest";
import { COUNTRIES, citiesForCountry, countryLabel, locationLabel } from "./countries";

describe("countries", () => {
  it("has no duplicate country codes", () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("returns cities for a known country and empty for an unknown one", () => {
    expect(citiesForCountry("US")).toContain("New York");
    expect(citiesForCountry("ZZ")).toEqual([]);
  });

  it("labels a bare country code with its name", () => {
    expect(countryLabel("GB")).toBe("United Kingdom");
  });

  it("labels a country::city value as 'City, Country'", () => {
    expect(locationLabel("GB::London")).toBe("London, United Kingdom");
    expect(locationLabel("GB")).toBe("United Kingdom");
  });
});
