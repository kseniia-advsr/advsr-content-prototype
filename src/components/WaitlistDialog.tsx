import { useState } from "react";
import { COUNTRIES } from "../engine/countries";

export type WaitlistSubmission = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  country: string;
  expectedPrice: string;
  hasAdvsrLogin: boolean;
};

const ADVSR_LOGIN_URL = "https://advsr.ai/login";
const CONTACT_EMAIL = "kseniia@advsr.ai";

function AccountToggle({
  hasAccount,
  onChange,
}: {
  hasAccount: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <a
        href={ADVSR_LOGIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={
          "transition-colors hover:underline " +
          (hasAccount ? "text-advsr-orange" : "text-advsr-muted")
        }
      >
        I have an ADVSR account
      </a>
      <button
        type="button"
        role="switch"
        aria-checked={!hasAccount}
        onClick={() => onChange(!hasAccount)}
        className="relative h-6 w-11 shrink-0 rounded-full bg-advsr-orange"
      >
        <span
          className={
            "absolute top-0.5 size-5 rounded-full bg-white transition-transform " +
            (hasAccount ? "translate-x-0.5" : "translate-x-[22px]")
          }
        />
      </button>
      <a
        href={ADVSR_LOGIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={
          "transition-colors hover:underline " +
          (!hasAccount ? "text-advsr-orange" : "text-advsr-muted")
        }
      >
        I don't have an ADVSR account
      </a>
    </div>
  );
}

export function WaitlistDialog({
  onClose,
  onSubmit,
  submitting,
  error,
  submitted,
}: {
  onClose: () => void;
  onSubmit: (submission: WaitlistSubmission) => void;
  submitting: boolean;
  error: string | null;
  submitted: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [hasAdvsrLogin, setHasAdvsrLogin] = useState(false);

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    company.trim() &&
    country.trim() &&
    priceAmount.trim() &&
    !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      company: company.trim(),
      country: country.trim(),
      expectedPrice: `$${priceAmount.trim()}`,
      hasAdvsrLogin,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-advsr-border bg-advsr-surface">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-advsr-muted hover:text-advsr-text"
        >
          ✕
        </button>

        <div className="max-h-[85vh] overflow-y-auto px-6 py-6">
          {submitted ? (
            <div className="py-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-advsr-text">
                You're on the list.
              </h2>
              <p className="mt-2 text-advsr-muted">
                We'll be in touch as the full ADVSR content engine goes live.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-lg border border-advsr-border px-4 py-2 text-sm text-advsr-text transition-colors hover:border-advsr-orange-2"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-bold text-advsr-text">
                That's a taste of what this can do for you every day.
              </h2>
              <p className="mt-2 text-advsr-muted">
                Join the waitlist and you'll be first to use the content
                generator with no usage limit.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <AccountToggle hasAccount={hasAdvsrLogin} onChange={setHasAdvsrLogin} />

                <div>
                  <label className="text-sm font-medium text-advsr-text" htmlFor="wl-first">
                    First Name
                  </label>
                  <input
                    id="wl-first"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-advsr-border bg-advsr-bg px-3 py-2 text-advsr-text focus:border-advsr-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-advsr-text" htmlFor="wl-last">
                    Last Name
                  </label>
                  <input
                    id="wl-last"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-advsr-border bg-advsr-bg px-3 py-2 text-advsr-text focus:border-advsr-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-advsr-text" htmlFor="wl-email">
                    Email
                  </label>
                  <input
                    id="wl-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-advsr-border bg-advsr-bg px-3 py-2 text-advsr-text focus:border-advsr-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-advsr-text" htmlFor="wl-company">
                    Company
                  </label>
                  <input
                    id="wl-company"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-advsr-border bg-advsr-bg px-3 py-2 text-advsr-text focus:border-advsr-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-advsr-text" htmlFor="wl-country">
                    Country
                  </label>
                  <input
                    id="wl-country"
                    list="wl-country-options"
                    required
                    autoComplete="off"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Start typing..."
                    className="mt-1.5 w-full rounded-lg border border-advsr-border bg-advsr-bg px-3 py-2 text-advsr-text placeholder:text-advsr-muted focus:border-advsr-orange focus:outline-none"
                  />
                  <datalist id="wl-country-options">
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-sm font-medium text-advsr-text" htmlFor="wl-price">
                    What are your monthly price expectations of the Engine?
                  </label>
                  <div className="mt-1.5 flex w-full items-stretch overflow-hidden rounded-lg border border-advsr-border bg-advsr-bg focus-within:border-advsr-orange">
                    <span className="flex items-center pl-3 text-advsr-muted select-none">$</span>
                    <input
                      id="wl-price"
                      required
                      inputMode="decimal"
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      placeholder="150/month"
                      className="w-full bg-transparent py-2 pl-1 pr-3 text-advsr-text placeholder:text-advsr-muted focus:outline-none"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full rounded-lg bg-advsr-orange px-4 py-3 font-heading font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Joining…" : "Join the waitlist"}
                </button>

                <p className="text-center text-xs text-advsr-muted">
                  Questions?{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-advsr-orange hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
