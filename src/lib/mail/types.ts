import type { MailCategory } from "@/lib/mail/classify";

export type MailSummary = {
  uid: string;
  from: string;
  email: string;
  subject: string;
  time: string;
  unread: boolean;
  category: MailCategory;
};
