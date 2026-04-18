import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface Props {
  fullName: string;
  passcode: string;
  batchName: string;
  enterUrl: string;
}

const COLORS = {
  primary: "#6C3CF4",
  primarySoft: "#F3EEFF",
  text: "#0e1b2e",
  muted: "#78818f",
  border: "#E5E7EB",
};

export function ClientPasscodeDelivery(p: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your passcode for the {p.batchName} showcase.</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#FAFAF7", fontFamily: "Inter, Helvetica, Arial, sans-serif", margin: 0, padding: "32px 0" }}>
          <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
            <div style={{ height: 4, background: "linear-gradient(90deg,#d865ff,#0151ff)" }} />

            <Section style={{ padding: "32px 32px 0" }}>
              <Text style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.muted, margin: 0 }}>
                / terminal-bench
              </Text>
              <Heading style={{ fontSize: 26, color: COLORS.text, margin: "12px 0 0", fontFamily: "'Space Grotesk', Inter, sans-serif", fontWeight: 600 }}>
                Your access is ready
              </Heading>
            </Section>

            <Section style={{ padding: "20px 32px 0" }}>
              <Text style={{ fontSize: 15, color: COLORS.text, lineHeight: "24px" }}>
                Hi {p.fullName}, Tam has approved your access to the{" "}
                <b>{p.batchName}</b>. Enter the passcode below to open the showcase.
              </Text>
            </Section>

            <Section style={{ padding: "24px 32px 0" }}>
              <div style={{ backgroundColor: COLORS.primarySoft, border: `1px solid ${COLORS.primary}40`, borderRadius: 14, padding: "28px 20px", textAlign: "center" }}>
                <Text style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.muted, margin: 0 }}>
                  Passcode
                </Text>
                <Text
                  style={{
                    fontSize: 30,
                    fontFamily: "'Space Grotesk', ui-monospace, SFMono-Regular, Menlo, monospace",
                    letterSpacing: "0.12em",
                    color: COLORS.primary,
                    margin: "10px 0 0",
                    fontWeight: 700,
                  }}
                >
                  {p.passcode}
                </Text>
              </div>
            </Section>

            <Section style={{ padding: "24px 32px 0" }}>
              <Button
                href={p.enterUrl}
                style={{ display: "inline-block", width: "100%", boxSizing: "border-box", textAlign: "center", backgroundColor: COLORS.primary, color: "#ffffff", padding: "16px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none" }}
              >
                Open showcase →
              </Button>
            </Section>

            <Section style={{ padding: "20px 32px 28px" }}>
              <Hr style={{ borderColor: COLORS.border, margin: "12px 0" }} />
              <Text style={{ fontSize: 12, color: COLORS.muted, lineHeight: "18px" }}>
                This passcode is tied to your email and expires in 30 days. Every use is logged — please
                don&apos;t share it. Reply directly to this email if anything looks off.
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, margin: "12px 0 0" }}>
                — Tam, Tbrain
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ClientPasscodeDelivery;
