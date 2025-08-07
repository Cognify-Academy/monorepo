import { Elysia } from "elysia";

export const importancesRouter = new Elysia({ prefix: "/importances" }).get(
  "/",
  async () => importances,
  {
    detail: { tags: ["Importances"] },
  },
);

export const importances = {
  500: {
    code: 500,
    category: "Foundational Knowledge",
    description:
      "The absolute core concepts or data that everything else builds upon.",
  },
  501: {
    code: 501,
    category: "Critical Theories",
    description:
      "Essential theories or frameworks that must be understood thoroughly.",
  },
  502: {
    code: 502,
    category: "Must-Know Facts",
    description:
      "Key facts, formulas, or data points that are non-negotiable for mastery.",
  },
  400: {
    code: 400,
    category: "Key Principles",
    description: "Important ideas or rules that are frequently applied.",
  },
  401: {
    code: 401,
    category: "Practical Applications",
    description:
      "Examples or case studies that illustrate how concepts are used in real life.",
  },
  402: {
    code: 402,
    category: "High-Value Data",
    description: "Data or information that is often referenced or tested.",
  },
  300: {
    code: 300,
    category: "Contextual Information",
    description:
      "Background details that help explain why something is important.",
  },
  301: {
    code: 301,
    category: "Examples & Analogies",
    description: "Illustrative examples or comparisons that aid understanding.",
  },
  302: {
    code: 302,
    category: "Historical Context",
    description:
      "Historical or cultural background that adds depth but isn't critical.",
  },
  200: {
    code: 200,
    category: "Interesting Asides",
    description: "Fun facts, anecdotes, or trivia related to the topic.",
  },
  201: {
    code: 201,
    category: "Optional Examples",
    description:
      "Extra examples or case studies for those who want to dive deeper.",
  },
  202: {
    code: 202,
    category: "Curiosities",
    description: "Non-essential but engaging tidbits for enrichment.",
  },
  100: {
    code: 100,
    category: "Tangential Info",
    description:
      "Information that is loosely related but not necessary for understanding.",
  },
  101: {
    code: 101,
    category: "Obscure Details",
    description: "Rarely used or overly specific details that can be ignored.",
  },
  102: {
    code: 102,
    category: "Off-Topic Asides",
    description:
      "Information that is interesting but unrelated to the core subject.",
  },
};
