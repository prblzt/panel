export const mailCategories = [
  "Finances",
  "Travail",
  "Publicités",
  "Achats",
  "Réseaux sociaux",
  "Personnel",
  "Autres",
] as const;

export type MailCategory = (typeof mailCategories)[number];

export type MailSignals = {
  from: string;
  email: string;
  subject: string;
  text: string;
};

type Rule = {
  category: Exclude<MailCategory, "Autres">;
  domains: string[];
  keywords: string[];
};

const rules: Rule[] = [
  {
    category: "Finances",
    domains: [
      "bankin.com",
      "paypal.com",
      "revolut.com",
      "n26.com",
      "boursorama.com",
      "boursobank.com",
      "fortuneo.fr",
      "bnpparibas.com",
      "credit-agricole.fr",
      "labanquepostale.fr",
      "impots.gouv.fr",
      "ameli.fr",
      "urssaf.fr",
      "assurance-maladie.fr",
    ],
    keywords: ["prelevement", "virement", "releve de compte", "rib", "iban", "impot", "cotisation", "quittance", "solde de votre compte"],
  },
  {
    category: "Travail",
    domains: ["hellowork.com", "indeed.com", "francetravail.fr", "pole-emploi.fr", "apec.fr"],
    keywords: ["candidature", "entretien d'embauche", "bulletin de paie", "fiche de paie", "contrat de travail"],
  },
  {
    category: "Publicités",
    domains: [],
    keywords: ["newsletter", "promotion", "soldes", "desabonnement", "unsubscribe", "offre exclusive", "bon plan"],
  },
  {
    category: "Achats",
    domains: [
      "amazon.fr",
      "amazon.com",
      "fnac.com",
      "cdiscount.com",
      "uber.com",
      "ubereats.com",
      "deliveroo.fr",
      "vinted.fr",
      "leboncoin.fr",
      "showroomprive.com",
      "conforama.fr",
      "zalando.fr",
    ],
    keywords: ["votre commande", "bon de commande", "colis", "suivi de livraison", "numero de suivi"],
  },
  {
    category: "Réseaux sociaux",
    domains: [
      "linkedin.com",
      "facebook.com",
      "facebookmail.com",
      "instagram.com",
      "tiktok.com",
      "snapchat.com",
      "discord.com",
      "reddit.com",
      "twitter.com",
      "x.com",
    ],
    keywords: ["vous a envoye une invitation", "nouvel abonne"],
  },
  {
    category: "Personnel",
    domains: [],
    keywords: ["maman", "papa", "bisous", "en famille", "joyeux anniversaire"],
  },
];

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function domainOf(email: string) {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1) : "";
}

function domainMatches(email: string, domain: string) {
  const host = domainOf(fold(email));
  return host === domain || host.endsWith(`.${domain}`);
}

function senderMatches(email: string, from: string, domain: string) {
  if (domainMatches(email, domain)) return true;
  const label = domain.split(".")[0];
  if (label.length < 4) return false;
  return fold(from).includes(label);
}

export function classifyMail(input: MailSignals): MailCategory {
  const email = fold(input.email);
  const haystack = fold(`${input.from}\n${input.subject}\n${input.text}`);
  const strong = rules.filter((rule) => rule.domains.some((domain) => senderMatches(email, input.from, domain)));
  if (strong.length === 1) return strong[0].category;
  if (strong.length > 1) return "Autres";

  const weak = rules.filter((rule) => rule.keywords.some((keyword) => haystack.includes(fold(keyword))));
  const named = weak.filter((rule) => rule.category !== "Personnel");
  const personal = weak.some((rule) => rule.category === "Personnel");
  if (named.length === 1 && !personal) return named[0].category;
  if (named.length === 0 && personal) return "Personnel";
  return "Autres";
}

export function isMailCategory(value: unknown): value is MailCategory {
  return typeof value === "string" && (mailCategories as readonly string[]).includes(value);
}
