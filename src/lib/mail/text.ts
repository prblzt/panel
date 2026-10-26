const MAX_BODY = 100_000;

export function toPlainText(input: { text?: string; html?: string | false }) {
  const source = input.text?.trim() ? input.text : typeof input.html === "string" ? input.html : "";
  const withoutTags = source
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return withoutTags
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .trim()
    .slice(0, MAX_BODY);
}

export function cleanHeader(value: string) {
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}
