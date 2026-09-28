/** Shared by the contact form (browser) and the /api/contact route (server): one definition of what's valid. */
export const TOPICS = [
  { value: "general", label: "A general question" },
  { value: "artwork", label: "Enquiring about an artwork" },
  { value: "commission", label: "A commission" },
  { value: "wearable", label: "Interest in wearable pieces" },
  { value: "collaboration", label: "Collaboration or partnership" },
  { value: "press", label: "Press or writing about EARTGALLA" },
] as const;
export type TopicValue = (typeof TOPICS)[number]["value"];

export type ContactInput = { name: string; email: string; topic: string; message: string; work?: string; artist?: string };
export type FieldErrors = Partial<Record<"name" | "email" | "topic" | "message", string>>;

export const LIMITS = { name: 100, email: 200, message: 4000, minMessage: 10 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(v: ContactInput): FieldErrors {
  const e: FieldErrors = {};
  const name = v.name.trim();
  if (!name) e.name = "Please tell us your name.";
  else if (name.length > LIMITS.name) e.name = `Please keep your name under ${LIMITS.name} characters.`;
  const email = v.email.trim();
  if (!email) e.email = "Please add an email address so we can reply.";
  else if (!EMAIL.test(email) || email.length > LIMITS.email) e.email = "That email address doesn't look right.";
  if (!TOPICS.some((t) => t.value === v.topic)) e.topic = "Please choose what this is about.";
  const message = v.message.trim();
  if (!message) e.message = "Please write a message.";
  else if (message.length < LIMITS.minMessage) e.message = "A little more detail, please — a sentence or two.";
  else if (message.length > LIMITS.message) e.message = `Please keep your message under ${LIMITS.message} characters.`;
  return e;
}
