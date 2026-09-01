/**
 * Full-screen Privacy Notice page for the tone-of-voice questionnaire's
 * "By continuing, you agree to ADVSR's Privacy Notice for this tool" link.
 * Text is the ADVSR Content Engine Privacy Notice (draft), reproduced as
 * given except: the internal "Notes for your solicitor (delete before
 * publishing)" section is omitted entirely, per the document's own
 * instruction; the "[insert URL]" placeholder in the introduction is
 * dropped rather than guessed, since the tool's own URL isn't fixed here;
 * and the "[insert email]" placeholder in Section 9 uses sara@advsr.ai,
 * the privacy contact already named in Sections 2 and 14 of the same
 * document. No other wording changes.
 */

const LEGAL_BASES = [
  {
    purpose: "Generate the sample content you asked for",
    whatWeUse: "Your topic and tone-of-voice answers",
    basis: "Taken at your request / performance of a contract with you (Art. 6(1)(b))",
  },
  {
    purpose: "Understand which styles, topics and price points are popular, to refine this tool",
    whatWeUse: "Tone-of-voice answers (aggregated/analysed) and pricing feedback",
    basis: "Legitimate interests, product development (Art. 6(1)(f)); you can object at any time",
  },
  {
    purpose: "Follow up with you about the waitlist or product launch",
    whatWeUse: "Name, email, existing-membership answer",
    basis: "Consent (Art. 6(1)(a)). You can withdraw this at any time",
  },
  {
    purpose: "Keep the tool secure and prevent abuse",
    whatWeUse: "IP address and basic technical data",
    basis: "Legitimate interests, securing our systems (Art. 6(1)(f))",
  },
  {
    purpose: "Comply with our legal obligations",
    whatWeUse: "Any of the above, where required",
    basis: "Legal obligation (Art. 6(1)(c))",
  },
];

const PROCESSORS = [
  {
    who: "Anthropic PBC",
    what: "Receives your topic and tone-of-voice answers via its API solely to generate your sample content. Processes this on our instructions; does not use API inputs to train its models by default.",
    role: "Processor (AI generation)",
  },
  {
    who: "Supabase, Inc.",
    what: "Hosts the database that stores your waitlist and questionnaire submissions. Accessed only via project-specific secret API keys that are never exposed to your browser or the public.",
    role: "Processor (database hosting)",
  },
];

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-heading text-lg font-semibold text-advsr-text">
        {number}. {title}
      </h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-advsr-text">{children}</div>
    </section>
  );
}

export function PrivacyNotice({ onClose }: { onClose: () => void }) {
  return (
    // z-[60]: renders on top of ToneDialog (z-50), which stays mounted
    // underneath so "Back" returns to the exact same in-progress page.
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-advsr-bg">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <button
          type="button"
          onClick={onClose}
          className="mb-8 text-sm text-advsr-muted transition-colors hover:text-advsr-text"
        >
          ‹ Back
        </button>

        <h1 className="font-heading text-2xl font-bold text-advsr-text">
          ADVSR Content Engine: Privacy Notice
        </h1>

        <Section number="1" title="Introduction">
          <p>
            This notice explains how ADVSR Ltd ("ADVSR", "we", "us", "our") collects, uses, stores and
            shares personal data when you use the ADVSR Content Engine, a tool that generates
            sample real estate marketing content and lets you join our waitlist.
          </p>
          <p>
            It sits alongside, and should be read together with, ADVSR's main privacy policy at
            advsr.ai/privacy-policy, which covers the wider ADVSR membership platform. Where the two
            differ on this specific tool, this notice takes priority.
          </p>
          <p>
            We are a UK company. This notice is written to comply with the UK GDPR and the Data
            Protection Act 2018 and, because people use this tool from many countries, the EU GDPR
            and other data protection laws that may apply to you locally, including US state privacy
            laws such as the California Consumer Privacy Act, and equivalent laws elsewhere (see
            Section 12).
          </p>
        </Section>

        <Section number="2" title="Who we are">
          <p>
            ADVSR Ltd is the data controller for the information described in this notice, meaning we
            decide how and why it's used.
          </p>
          <p>Registered/business address: 298 Regent's Park Road, London, N3 2SZ, United Kingdom</p>
          <p>Contact for privacy questions: hi@advsr.ai</p>
        </Section>

        <Section number="3" title="What information we collect">
          <p className="font-medium text-advsr-text">a) Information you give us directly</p>
          <p>Your name and email address, when you join the waitlist.</p>
          <p>Your company or the market you work in, if you choose to tell us (optional).</p>
          <p>What you'd expect to pay, if you answer that question.</p>
          <p>Whether you already have an advsr.ai membership login.</p>
          <p>
            Your answers to the tone-of-voice questionnaire, how you want your content to sound and
            your professional background.
          </p>
          <p>
            Only if you opt in: details about your personal life or family that you're happy to have
            referenced, plus anything you tell us is strictly off-limits. This section is optional,
            and anything you mark as off-limits is never used in your content.
          </p>

          <p className="mt-4 font-medium text-advsr-text">b) Information the tool creates</p>
          <p>
            The sample content generated for you, based on your topic and questionnaire answers. We
            keep a copy for quality checks and to see which styles and topics prospects actually ask
            for.
          </p>

          <p className="mt-4 font-medium text-advsr-text">c) Information collected automatically</p>
          <p>
            Your IP address and basic technical/device information (e.g. browser type), used only to
            prevent the tool being abused or spammed and to keep the service running reliably. We
            do not use this to build advertising profiles.
          </p>

          <p className="mt-4 font-medium text-advsr-text">d) What we don't collect</p>
          <p>
            We don't ask for, and don't want, "special category" data, things like health information,
            racial or ethnic origin, religious beliefs, sexual orientation, or biometric data. Please
            don't include this in any free-text answer, including the personal/family questionnaire
            section.
          </p>
        </Section>

        <Section number="4" title="Why we use your information, and our legal basis">
          <p>
            We only use your information for the purposes below, all connected to running this tool
            and understanding demand. We do not sell your data, use it
            for third-party advertising, or share it with data brokers.
          </p>
          <div className="space-y-3">
            {LEGAL_BASES.map((row) => (
              <div key={row.purpose} className="rounded-xl border border-advsr-border bg-advsr-surface p-4">
                <p className="font-medium text-advsr-text">{row.purpose}</p>
                <p className="mt-1 text-advsr-muted">
                  <span className="text-advsr-text">What we use:</span> {row.whatWeUse}
                </p>
                <p className="mt-1 text-advsr-muted">
                  <span className="text-advsr-text">Legal basis:</span> {row.basis}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section number="5" title="Who we share your information with">
          <p>
            We keep the number of people who can see your data as small as possible. We share it only
            with the two service providers ("processors") who help us run the tool, both bound by
            contract to only use your data as we instruct:
          </p>
          <div className="space-y-3">
            {PROCESSORS.map((row) => (
              <div key={row.who} className="rounded-xl border border-advsr-border bg-advsr-surface p-4">
                <p className="font-medium text-advsr-text">
                  {row.who} <span className="font-normal text-advsr-muted">({row.role})</span>
                </p>
                <p className="mt-1 text-advsr-muted">{row.what}</p>
              </div>
            ))}
          </div>
          <p>
            We do not share your information with any other third party, no marketing partners, no
            data brokers, no analytics networks beyond what's described here, unless the law requires
            it (for example, a valid request from a regulator or law enforcement) or you separately
            and explicitly agree to it.
          </p>
        </Section>

        <Section number="6" title="Where your data is processed (international transfers)">
          <p>
            Because Anthropic and Supabase operate internationally, your data may be processed outside
            the UK/EEA, including in the United States. Where this happens, we rely on the safeguards
            required by UK/EU data protection law, such as Standard Contractual Clauses (and the UK's
            International Data Transfer Addendum) in our contracts with these providers, and/or their
            participation in recognised transfer frameworks (for example the EU-U.S. and UK-U.S. Data
            Privacy Framework, where applicable).
          </p>
        </Section>

        <Section number="7" title="How long we keep your information">
          <p>
            We keep waitlist and questionnaire data for as long as we're actively using it to develop
            this tool and inform pricing, and in any event no longer than 12 months after your submission,
            unless:
          </p>
          <p>you ask us to delete it sooner;</p>
          <p>
            you go on to open a full ADVSR account, in which case relevant data may carry over into
            your account with your knowledge; or
          </p>
          <p>we're required to keep it longer to meet a legal obligation.</p>
        </Section>

        <Section number="8" title="How we protect your information">
          <p>Data is stored in a managed, encrypted database (encrypted in transit and at rest).</p>
          <p>
            Access to the database and to Anthropic's API is controlled by secret keys held
            server-side only, never exposed in the browser or made public.
          </p>
          <p>Access is limited to the employees of ADVSR who need it to run and improve the tool.</p>
        </Section>

        <Section number="9" title="Your rights">
          <p>
            Wherever the UK GDPR, EU GDPR, or an equivalent law applies to you, you have the right to:
          </p>
          <p>ask for a copy of the personal data we hold about you (access);</p>
          <p>ask us to correct inaccurate data (rectification);</p>
          <p>ask us to delete your data (erasure);</p>
          <p>ask us to restrict how we use it (restriction);</p>
          <p>ask for your data in a portable format (portability);</p>
          <p>object to processing based on our legitimate interests (objection); and</p>
          <p>withdraw consent at any time, where we rely on consent (e.g. waitlist follow-up emails).</p>
          <p>
            To exercise any of these rights, contact us at hi@advsr.ai. We aim to respond within one
            month. If you're not satisfied with our response, you can complain to the UK Information
            Commissioner's Office (ico.org.uk) or, if you're based in the EU, your local data
            protection authority.
          </p>
          <p>
            As a matter of policy, we aim to offer these same core rights to everyone who uses this
            tool, wherever you're based. Section 12 covers points specific to certain regions.
          </p>
        </Section>

        <Section number="10" title="Cookies and similar technologies">
          <p>
            We do not use cookies, analytics tags, tracking pixels, or similar tracking technology on
            this tool. We do not place anything on your device beyond what your browser needs to load
            the page itself.
          </p>
          <p>
            Necessary technical data, such as your IP address, used for rate-limiting, is processed as
            described in Section 3(c) regardless, because it is necessary to run the service securely,
            and does not involve placing anything on your device.
          </p>
        </Section>

        <Section number="11" title="Children">
          <p>
            This tool is intended for real estate professionals and is not directed at, or intended
            for use by, anyone under 18. We do not knowingly collect data from children.
          </p>
        </Section>

        <Section number="12" title="International users and additional rights">
          <p>
            This tool is available globally. If you're in the EEA, the EU GDPR applies to our
            processing of your data in the same way as the UK GDPR. Wherever local law requires
            additional disclosures, a different legal basis, or gives you further rights, we will
            comply with that law for users in that location. The sections below cover some of the
            frameworks we most commonly see.
          </p>

          <p className="mt-4 font-medium text-advsr-text">a) California and other US states</p>
          <p>
            If you're a California resident, the California Consumer Privacy Act, as amended by the
            CPRA, gives you the right to know what personal information we hold about you, request
            its deletion or correction, and opt out of the sale or sharing of personal information.
            We do not sell personal information or share it for cross-context behavioural
            advertising, so there is nothing to opt out of in practice. We will not discriminate
            against you for exercising any of these rights. Similar rights may apply if you're based
            in other US states with their own privacy laws, such as Virginia, Colorado, Connecticut,
            or Utah. The contact route in Section 9 applies equally here.
          </p>

          <p className="mt-4 font-medium text-advsr-text">b) Other regions</p>
          <p>
            If you're based in Brazil, Canada, Australia, Singapore, South Africa, the UAE, India, or
            another jurisdiction with its own data protection law, for example the LGPD, PIPEDA, the
            Privacy Act 1988, the PDPA, or POPIA, we aim to honour the same core rights set out in
            Section 9 for you as well, to the extent they apply, even where local law does not
            strictly require it.
          </p>
        </Section>

        <Section number="13" title="Changes to this notice">
          <p>
            We may update this notice from time to time as the tool develops. We'll
            post the date of the latest version at the top of this page and, for material changes, let
            waitlist members know by email.
          </p>
        </Section>

        <Section number="14" title="Contact us">
          <p>Questions about this notice or how we handle your data: hi@advsr.ai.</p>
        </Section>
      </div>
    </div>
  );
}
