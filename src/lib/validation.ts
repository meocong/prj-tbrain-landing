import { z } from "zod";

// Reusable UTM block — every public form may include these fields when the
// visitor landed from a campaigned URL. All optional because direct/organic
// traffic doesn't set them.
const utmFields = {
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  utm_term: z.string().max(200).optional(),
  utm_content: z.string().max(200).optional(),
  referrer: z.string().max(500).optional(),
};

export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(1, "Name is required").max(200),
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  message: z.string().min(1, "Message is required").max(5000),
  turnstileToken: z.string().min(1, "Verification required"),
  ...utmFields,
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().max(200).optional(),
  // Newsletter is rate-limited at API level; Turnstile is optional here so the
  // low-friction footer form doesn't need to render a widget.
  turnstileToken: z.string().optional(),
  ...utmFields,
});

export const passcodeCreateSchema = z.object({
  clientEmail: z.string().email(),
  batchId: z.string().uuid(),
  expiresInDays: z.number().int().min(1).max(365).default(30),
  maxUses: z.number().int().min(1).max(1000).optional(),
  note: z.string().max(500).optional(),
  sendEmail: z.boolean().default(true),
});

export const cmsPostSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1).max(500),
  excerpt: z.string().max(1000).optional(),
  contentMd: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type PasscodeCreateInput = z.infer<typeof passcodeCreateSchema>;
export type CmsPostInput = z.infer<typeof cmsPostSchema>;
