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
  fullName: string;
}

export default function ContactConfirmation({ fullName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>We received your message - Tbrain</Preview>
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
            Thank you, {fullName || "there"}!
          </Heading>
          <Text style={{ color: "#475569", lineHeight: "1.6" }}>
            We received your message and will get back to you within 1-2
            business days.
          </Text>
          <Text style={{ color: "#475569", lineHeight: "1.6" }}>
            In the meantime, feel free to explore our data solutions and case
            studies at{" "}
            <a href="https://tbrain.ai" style={{ color: "#6C3CF4" }}>
              tbrain.ai
            </a>
            .
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
