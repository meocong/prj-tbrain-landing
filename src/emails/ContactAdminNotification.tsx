import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface Props {
  email: string;
  fullName: string;
  company?: string;
  role?: string;
  phone?: string;
  message: string;
}

export default function ContactAdminNotification({
  email,
  fullName,
  company,
  role,
  phone,
  message,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {fullName}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "sans-serif" }}>
        <Container
          style={{
            maxWidth: "560px",
            margin: "40px auto",
            padding: "32px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <Heading style={{ fontSize: "20px", color: "#0f172a" }}>
            New Contact Form Submission
          </Heading>

          <Section
            style={{
              backgroundColor: "#f1f5f9",
              padding: "16px",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          >
            <Text style={{ margin: "4px 0", color: "#334155" }}>
              <strong>Name:</strong> {fullName}
            </Text>
            <Text style={{ margin: "4px 0", color: "#334155" }}>
              <strong>Email:</strong> {email}
            </Text>
            {company && (
              <Text style={{ margin: "4px 0", color: "#334155" }}>
                <strong>Company:</strong> {company}
              </Text>
            )}
            {role && (
              <Text style={{ margin: "4px 0", color: "#334155" }}>
                <strong>Role:</strong> {role}
              </Text>
            )}
            {phone && (
              <Text style={{ margin: "4px 0", color: "#334155" }}>
                <strong>Phone:</strong> {phone}
              </Text>
            )}
          </Section>

          <Section style={{ marginTop: "16px" }}>
            <Text style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
              Message
            </Text>
            <Text
              style={{
                color: "#334155",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {message}
            </Text>
          </Section>

          <Section style={{ marginTop: "24px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
            <Text style={{ color: "#94a3b8", fontSize: "12px" }}>
              Reply directly to this email to respond to the contact.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
