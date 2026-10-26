import DOMPurify from "isomorphic-dompurify";

const forbiddenTags = [
  "script",
  "iframe",
  "frame",
  "frameset",
  "object",
  "embed",
  "applet",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "option",
  "optgroup",
  "base",
  "link",
  "meta",
  "svg",
  "math",
  "noscript",
];

let hooksReady = false;

function ensureHooks() {
  if (hooksReady) return;
  hooksReady = true;
  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    const name = data.attrName.toLowerCase();
    const value = data.attrValue.trim();
    if (name.startsWith("on") || name === "srcdoc" || name === "formaction" || name === "action" || name === "srcset") {
      data.keepAttr = false;
      return;
    }
    if (name === "href" && !/^(https?:\/\/|mailto:)/i.test(value)) {
      data.keepAttr = false;
      return;
    }
    if ((name === "src" || name === "poster" || name === "background") && !isSafeSource(value)) {
      data.keepAttr = false;
      return;
    }
    if (name === "style" && /javascript:|expression\s*\(|@import|behavior\s*:|-moz-binding/i.test(value)) {
      data.keepAttr = false;
    }
  });
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName !== "A") return;
    node.setAttribute("rel", "noopener noreferrer");
    node.setAttribute("target", "_blank");
  });
}

function isSafeSource(value: string) {
  return /^https?:\/\//i.test(value) || /^data:image\/(?:png|jpe?g|gif|webp)[;,]/i.test(value);
}

export function sanitizeMailHtml(html: string) {
  ensureHooks();
  const clean = DOMPurify.sanitize(html.slice(0, 100_000), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: forbiddenTags,
    FORBID_ATTR: ["srcdoc", "formaction", "action", "srcset"],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  })
    .replace(/<style[\s\S]*?javascript:[\s\S]*?<\/style>/gi, "")
    .trim();
  const visibleText = clean.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim();
  if (!visibleText && !/<img\b/i.test(clean)) return "";
  return clean;
}
