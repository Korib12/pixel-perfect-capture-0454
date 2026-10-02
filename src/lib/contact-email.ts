/**
 * Sends contact-form messages to your inbox.
 *
 * Default: FormSubmit (no account needed). The very first message triggers a
 * one-time "Activate form" email to CONTACT_EMAIL — click it once and every
 * message after that is delivered.
 *
 * Prefer Formspree? Create a form at https://formspree.io, copy its ID
 * (the part after /f/ in the endpoint, e.g. "xyzabcd") into FORMSPREE_ID,
 * and messages go through Formspree instead.
 */
export const CONTACT_EMAIL = "koribui7@gmail.com";
export const FORMSPREE_ID = "";

export type ContactMessage = {
  name: string;
  email: string;
  project_type: string;
  message: string;
  saved_projects?: string;
};

export async function sendContactEmail(msg: ContactMessage): Promise<void> {
  const subject = `New enquiry from ${msg.name} — ${msg.project_type}`;

  const url = FORMSPREE_ID
    ? `https://formspree.io/f/${FORMSPREE_ID}`
    : `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

  const body = FORMSPREE_ID
    ? { ...msg, _subject: subject }
    : {
        Name: msg.name,
        Email: msg.email,
        "Project type": msg.project_type,
        Message: msg.message,
        ...(msg.saved_projects ? { "Saved projects": msg.saved_projects } : {}),
        _subject: subject,
        _replyto: msg.email,
        _template: "table",
        _captcha: "false",
      };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Email service responded ${res.status}`);
  const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
  // FormSubmit reports failures with HTTP 200 + success:"false"
  if (data.success === "false" || data.success === false) {
    throw new Error("Email service rejected the message");
  }
}
