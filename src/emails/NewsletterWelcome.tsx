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
  fullName?: string;
}

export default function NewsletterWelcome({ fullName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Tbrain newsletter</Preview>
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
            Welcome{fullName ? `, ${fullName}` : ""}!
          </Heading>
          <Text style={{ color: "#475569", lineHeight: "1.6" }}>
            You&apos;re now subscribed to the Tbrain newsletter. We&apos;ll
            send you updates on new datasets, AI training insights, and company
            news.
          </Text>
          <Section style={{ marginTop: "24px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
            <Text style={{ color: "#94a3b8", fontSize: "12px" }}>
              Tbrain - AI Training Data & Evaluation
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
