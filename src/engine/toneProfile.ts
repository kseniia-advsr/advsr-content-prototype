/**
 * The ADVSR Advisor Tone of Voice & Personal Brand Profile.
 *
 * This shared definition drives the form UI (client) and the context builder
 * (server). Responses are stored as a JSON object keyed by field id. The whole
 * profile feeds the hidden Content Architecture Engine as context for
 * everything created for that advisor.
 *
 * Kept as the full 15-section schema (unchanged in shape from the source app
 * except the location section) so it is ready to reuse as-is for Phase 2's
 * persistent per-user profile. The Phase 1 prototype UI only renders a
 * curated subset of these sections to an anonymous visitor — see
 * `PROTOTYPE_SECTION_IDS` in src/components/ToneQuestionnaire.tsx — but
 * whatever subset is filled in is stored as-is in `tone_profile`.
 */

export type FieldType =
  | "multi" // multiple choice, up to `limit` selections
  | "single" // single choice
  | "rating10" // 1-10 scale
  | "location" // searchable country/city multi-select
  | "text"; // free text

export type ToneField = {
  id: string;
  label: string;
  type: FieldType;
  /** For multi: maximum selections (undefined = unlimited). */
  limit?: number;
  /** Options for multi/single. */
  options?: string[];
  /** Placeholder for text fields. */
  placeholder?: string;
  /** Optional helper line. */
  help?: string;
};

export type ChannelRatingField = {
  id: string;
  label: string;
  type: "channels";
  channels: string[];
};

export type ToneSection = {
  id: string;
  title: string;
  fields: (ToneField | ChannelRatingField)[];
};

/** A stored response value for a field. */
export type ToneResponseValue =
  | string // single / text
  | string[] // multi / location
  | number // rating10
  | Record<string, number>; // channel ratings

export type ToneResponses = Record<string, ToneResponseValue>;

export const COMMUNICATION_STYLES = [
  "Professional", "Luxury", "Warm", "Friendly", "Direct", "Analytical",
  "Consultative", "Charismatic", "Educational", "Authoritative", "Aspirational",
  "Energetic", "Calm", "Formal", "Relationship-Led", "Commercial", "Strategic",
  "Storytelling", "Data-Driven", "Persuasive",
];

export const TONE_SECTIONS: ToneSection[] = [
  {
    id: "communication_style",
    title: "Communication style",
    fields: [
      {
        id: "style",
        label: "How would you describe your communication style?",
        type: "multi",
        limit: 3,
        help: "Select up to 3.",
        options: COMMUNICATION_STYLES,
      },
      {
        id: "formality",
        label: "How formal should your communication be?",
        type: "single",
        options: [
          "Very Formal",
          "Professional Formal",
          "Professional Conversational",
          "Relaxed Professional",
          "Informal",
        ],
      },
      {
        id: "directness",
        label: "How direct are you?",
        type: "single",
        options: ["Extremely Direct", "Direct", "Balanced", "Diplomatic", "Very Diplomatic"],
      },
      {
        id: "personality_level",
        label: "How much personality should come through?",
        type: "single",
        options: [
          "Mostly Business",
          "Professional with Personality",
          "Balanced",
          "Strong Personal Brand",
          "Highly Personal",
        ],
      },
    ],
  },
  {
    id: "client_experience",
    title: "Client experience",
    fields: [
      {
        id: "client_feeling",
        label: "How do you want clients to feel after interacting with you?",
        type: "multi",
        limit: 5,
        help: "Select up to 5.",
        options: [
          "Confident", "Reassured", "Inspired", "Informed", "Excited",
          "Empowered", "Connected", "Respected", "Understood", "Motivated",
          "Safe", "Optimistic", "Valued", "Trusted", "Clear on Next Steps",
        ],
      },
      {
        id: "qualities_always",
        label: "What qualities should always come through?",
        type: "multi",
        limit: 5,
        help: "Select up to 5.",
        options: [
          "Trustworthy", "Intelligent", "Discreet", "Ambitious", "Authentic",
          "Humble", "Sophisticated", "Honest", "Strategic", "Calm",
          "Confident", "Dependable", "Experienced", "Curious", "Innovative",
        ],
      },
      {
        id: "qualities_avoid",
        label: "What qualities should be avoided?",
        type: "multi",
        help: "Select all that apply.",
        options: [
          "Aggressive", "Pushy", "Corporate", "Overly Formal", "Salesy",
          "Flashy", "Technical", "Overly Casual", "Opinionated", "Trendy",
          "Arrogant", "Overly Emotional", "Humorous", "Controversial",
        ],
      },
    ],
  },
  {
    id: "archetype",
    title: "Advisor archetype",
    fields: [
      {
        id: "archetype",
        label: "Which advisor archetype best describes you?",
        type: "single",
        options: [
          "Trusted Adviser", "Market Expert", "Luxury Insider",
          "Strategic Negotiator", "Relationship Builder", "Property Matchmaker",
          "Investment Specialist", "Family Office Adviser", "Connector",
          "Entrepreneur",
        ],
      },
      {
        id: "build_trust",
        label: "How do you naturally build trust?",
        type: "multi",
        limit: 3,
        help: "Select up to 3.",
        options: [
          "Deep Relationships", "Expertise", "Introductions", "Network",
          "Market Knowledge", "Data & Evidence", "Reliability", "Problem Solving",
          "Personal Chemistry", "Strategic Thinking", "Discretion", "Availability",
        ],
      },
      {
        id: "greatest_strength",
        label: "What is your greatest strength?",
        type: "multi",
        limit: 3,
        help: "Select up to 3.",
        options: [
          "Relationship Building", "Networking", "Negotiation", "Marketing",
          "Content Creation", "Market Knowledge", "Investment Expertise",
          "Client Service", "Deal Structuring", "International Connections",
          "Public Speaking", "Personal Brand", "Leadership", "Business Development",
        ],
      },
    ],
  },
  {
    id: "negotiation",
    title: "Negotiation & commercial style",
    fields: [
      {
        id: "negotiation_style",
        label: "Which best describes your negotiation style?",
        type: "single",
        options: [
          "Challenger", "Diplomat", "Strategist", "Relationship Protector",
          "Competitive Closer", "Data-Led Negotiator", "Consensus Builder",
        ],
      },
      {
        id: "commercial_level",
        label: "How commercial are you?",
        type: "single",
        options: [
          "Adviser First", "Mostly Adviser", "Balanced", "Mostly Commercial",
          "Highly Commercial",
        ],
      },
      {
        id: "opportunity_presentation",
        label: "How should opportunities be presented?",
        type: "single",
        options: ["Conservative", "Balanced", "Optimistic", "Ambitious", "Aggressive"],
      },
    ],
  },
  {
    id: "expertise",
    title: "Expertise & authority",
    fields: [
      {
        id: "known_for",
        label: "What do you want to be known for?",
        type: "multi",
        limit: 5,
        help: "Select up to 5.",
        options: [
          "Prime Residential", "Super Prime", "Country Houses",
          "New Developments", "Investment", "Wealth Strategy", "Family Offices",
          "International Buyers", "Architecture", "Interior Design",
          "Market Analysis", "Entrepreneurship", "Luxury Lifestyle", "Relocation",
          "Hospitality", "Global Property", "Off-Market Transactions", "UHNW Advisory",
        ],
      },
      {
        id: "location",
        label: "Which markets do you want to be known for?",
        type: "location",
        help: "Search and select the countries and cities you cover.",
      },
      {
        id: "content_focus",
        label: "What should your content focus on?",
        type: "multi",
        limit: 5,
        help: "Select up to 5.",
        options: [
          "Market Knowledge", "Property Advice", "Negotiation Expertise",
          "Investment Strategy", "Personal Experiences", "Local Knowledge",
          "Architecture & Design", "Family Wealth", "Entrepreneurship",
          "Wealth Preservation", "Global Property", "Networking",
          "Industry Commentary", "Luxury Lifestyle", "Business Growth",
        ],
      },
    ],
  },
  {
    id: "visibility",
    title: "Visibility & personal brand",
    fields: [
      {
        id: "platforms",
        label: "Which platforms do you want help creating content for?",
        type: "multi",
        help: "Select all you post on. We will only generate deliverables for these, to save you time.",
        options: ["LinkedIn", "Instagram", "Facebook", "TikTok", "YouTube", "X"],
      },
      {
        id: "visibility",
        label: "How visible do you want to be?",
        type: "single",
        options: [
          "Very Private", "Selectively Visible", "Industry Visible",
          "Thought Leader", "Public Figure",
        ],
      },
      {
        id: "content_comfort",
        label: "What type of content are you comfortable posting?",
        type: "multi",
        help: "Select all that apply.",
        options: [
          "Property Listings", "Market Updates", "Personal Stories",
          "Family Content", "Business Journey", "Opinions", "Interviews",
          "Behind The Scenes", "Client Success Stories", "Luxury Lifestyle",
          "Video Content", "Written Articles", "Podcasts", "Public Speaking Clips",
        ],
      },
      {
        id: "risk_appetite",
        label: "Content risk appetite",
        type: "single",
        options: [
          "Extremely Conservative", "Conservative", "Balanced", "Bold", "Provocative",
        ],
      },
    ],
  },
  {
    id: "channels",
    title: "Communication channels",
    fields: [
      {
        id: "channel_personality",
        label: "Where should your personality come through most?",
        type: "channels",
        channels: [
          "Email", "WhatsApp", "LinkedIn", "Instagram", "Video",
          "Public Speaking", "Presentations", "Property Descriptions",
          "Client Reports", "Proposals",
        ],
      },
    ],
  },
  {
    id: "positioning",
    title: "Brand positioning",
    fields: [
      {
        id: "brand_affinities",
        label: "Which brands feel closest to your style?",
        type: "multi",
        limit: 3,
        help: "Select up to 3.",
        options: [
          "Rolex", "Aman", "Four Seasons", "Apple", "Bentley", "Ferrari",
          "Goldman Sachs", "Morgan Stanley", "Ritz-Carlton", "Soho House",
          "Hermès", "Ralph Lauren", "Nike", "Virgin", "Netflix",
          "Brunello Cucinelli", "Private Members Club", "Family Office",
        ],
      },
      {
        id: "brand_words",
        label: "Which words best describe your brand?",
        type: "multi",
        limit: 10,
        help: "Select up to 10.",
        options: [
          "Trusted", "Connected", "Global", "Luxury", "Intelligent",
          "Insightful", "Discreet", "Strategic", "Experienced", "Entrepreneurial",
          "Modern", "Established", "Influential", "Relationship-Led",
          "Results-Driven", "Independent", "Sophisticated", "Innovative",
          "Respected", "Well Connected",
        ],
      },
    ],
  },
  {
    id: "language",
    title: "Language preferences",
    fields: [
      { id: "term_advisor", label: "Advisor / Adviser", type: "single", options: ["Advisor", "Adviser"] },
      { id: "term_property", label: "How to refer to a property", type: "single", options: ["Property", "Home", "Residence", "Asset"] },
      { id: "term_client", label: "Client / Customer", type: "single", options: ["Client", "Customer"] },
      { id: "term_opportunity", label: "Opportunity / Acquisition", type: "single", options: ["Opportunity", "Acquisition"] },
      { id: "term_sale", label: "Sale / Transaction", type: "single", options: ["Sale", "Transaction"] },
      { id: "term_buyer", label: "Buyer / Purchaser", type: "single", options: ["Buyer", "Purchaser"] },
      { id: "term_vendor", label: "Vendor / Seller", type: "single", options: ["Vendor", "Seller"] },
      { id: "term_market", label: "Market Commentary / Market Intelligence", type: "single", options: ["Market Commentary", "Market Intelligence"] },
      { id: "term_network", label: "Network / Community", type: "single", options: ["Network", "Community"] },
      { id: "len_email", label: "Preferred email length", type: "single", options: ["Short", "Medium", "Detailed"] },
      { id: "len_social", label: "Preferred social post length", type: "single", options: ["Short", "Medium", "Long"] },
      { id: "len_market", label: "Preferred market commentary length", type: "single", options: ["Short", "Medium", "Long"] },
      { id: "len_property", label: "Preferred property description length", type: "single", options: ["Concise", "Balanced", "Detailed"] },
    ],
  },
  {
    id: "guardrails",
    title: "Communication guardrails",
    fields: [
      {
        id: "never",
        label: "Never:",
        type: "multi",
        help: "Select all that apply.",
        options: [
          "Discuss Politics", "Discuss Religion", "Use Humour", "Use Sarcasm",
          "Use Emojis", "Discuss Competitors", "Discuss Personal Life",
          "Discuss Wealth Publicly", "Discuss Clients Publicly",
          "Make Market Predictions", "Use Strong Opinions", "Be Controversial",
          "Mention Family", "Use Slang",
        ],
      },
    ],
  },
  {
    id: "ai_support",
    title: "AI support",
    fields: [
      {
        id: "ai_help",
        label: "What would you like AI to help you with most?",
        type: "multi",
        limit: 5,
        help: "Select up to 5.",
        options: [
          "Writing", "Content Creation", "Public Speaking", "Prospecting",
          "Market Research", "Follow Up", "Presentations", "Proposal Writing",
          "Data Analysis", "Time Management", "Social Media", "Client Reporting",
          "Property Descriptions", "Video Scripts", "Personal Branding",
        ],
      },
    ],
  },
  {
    id: "ideal_client",
    title: "Ideal client profile",
    fields: [
      {
        id: "ideal_clients",
        label: "Who do you most enjoy working with?",
        type: "multi",
        help: "Select all that apply.",
        options: [
          "UHNW Individuals", "Entrepreneurs", "Family Offices", "CEOs",
          "Founders", "Investors", "International Buyers", "Developers",
          "Sports Personalities", "Celebrities", "Private Banks", "Institutions",
          "Family Businesses", "Wealth Managers", "Overseas Families",
        ],
      },
    ],
  },
  {
    id: "personal",
    title: "Personal & family",
    fields: [
      {
        id: "share_personal",
        label: "Are you happy to talk about your personal life or family in content?",
        type: "single",
        options: [
          "Yes, openly",
          "Yes, but selectively",
          "Rarely",
          "No, keep it strictly professional",
        ],
      },
      {
        id: "personal_ok",
        label: "If yes, what is fair to reference?",
        type: "text",
        help: "Only completed if you opted in above. Used gently and only when relevant.",
        placeholder: "e.g. I am a father of two, I am a keen sailor, I support a local charity, I relocated from Sydney to London.",
      },
      {
        id: "personal_offlimits",
        label: "What is strictly off limits?",
        type: "text",
        placeholder: "e.g. Never mention my children by name, never reference my home address or specific locations.",
      },
      {
        id: "personal_interests",
        label: "Personal interests or passions we can weave in",
        type: "text",
        placeholder: "e.g. Architecture, art collecting, endurance sport, mentoring founders.",
      },
    ],
  },
  {
    id: "trust_profile",
    title: "Trust profile",
    fields: [
      { id: "trust", label: "Trust — I consistently do what I say.", type: "rating10" },
      { id: "likeability", label: "Likeability — People enjoy interacting with me.", type: "rating10" },
      { id: "respect", label: "Respect — People see me as an expert.", type: "rating10" },
      { id: "discretion", label: "Discretion — People trust me with sensitive information.", type: "rating10" },
      { id: "reliability", label: "Reliability — People know I will follow through.", type: "rating10" },
    ],
  },
  {
    id: "examples",
    title: "Real world examples",
    fields: [
      {
        id: "example_email",
        label: "Your best email",
        type: "text",
        placeholder: "Paste a recent email you are proud of, so the engine can learn your style.",
      },
      {
        id: "example_whatsapp",
        label: "Your best WhatsApp message",
        type: "text",
        placeholder: "Paste a WhatsApp message in your natural voice.",
      },
      {
        id: "example_linkedin",
        label: "Your best LinkedIn post",
        type: "text",
        placeholder: "Paste a LinkedIn post that sounds like you.",
      },
      {
        id: "example_proposal",
        label: "Your best proposal",
        type: "text",
        placeholder: "Paste an excerpt from a proposal.",
      },
      {
        id: "example_market",
        label: "Your best market commentary",
        type: "text",
        placeholder: "Paste a piece of market commentary.",
      },
      {
        id: "example_property",
        label: "Your best property description",
        type: "text",
        placeholder: "Paste a property description.",
      },
      {
        id: "example_presentation",
        label: "Your best presentation copy",
        type: "text",
        placeholder: "Paste copy from a presentation.",
      },
    ],
  },
  {
    id: "free_context",
    title: "Anything else",
    fields: [
      {
        id: "display_name",
        label: "Name / sign off",
        type: "text",
        placeholder: "e.g. Jordan Blake",
      },
      {
        id: "extra_context",
        label: "Further context for the engine",
        type: "text",
        placeholder: "Anything else the engine should always keep in mind when writing as you.",
      },
    ],
  },
];

/** Flat list of all fields, useful for validation and context building. */
export function allToneFields(): (ToneField | ChannelRatingField)[] {
  return TONE_SECTIONS.flatMap((s) => s.fields);
}
