import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface Props {
  fullName: string;
}

const COLORS = {
  text: "#0e1b2e",
  muted: "#78818f",
  border: "#E5E7EB",
};

export function ClientRejection(p: Props) {
  return (
    <Html>
      <Head />
      <Preview>Re: your Terminal Bench access request.</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#FAFAF7", fontFamily: "Inter, Helvetica, Arial, sans-serif", margin: 0, padding: "32px 0" }}>
          <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
            <div style={{ height: 4, background: "linear-gradient(90deg,#d865ff,#0151ff)" }} />
            <Section style={{ padding: "32px" }}>
              <Heading style={{ fontSize: 22, color: COLORS.text, margin: 0, fontFamily: "'Space Grotesk', Inter, sans-serif", fontWeight: 600 }}>
                Thank you for your interest
              </Heading>
              <Text style={{ fontSize: 15, color: COLORS.text, lineHeight: "24px", marginTop: 16 }}>
                Hi {p.fullName}, thank you for reaching out about the Terminal Bench showcase.
              </Text>
              <Text style={{ fontSize: 15, color: COLORS.text, lineHeight: "24px", marginTop: 12 }}>
                At this time we&apos;re unable to grant access — we prioritise enterprise AI-lab
                partners and have limited review bandwidth. If your team is evaluating training
                data or eval infrastructure, please write directly to{" "}
                <a href="mailto:info@tbrain.ai" style={{ color: "#6C3CF4", textDecoration: "underline" }}>
                  info@tbrain.ai
                </a>{" "}
                with more context and we&apos;ll be happy to re-evaluate.
              </Text>
              <Text style={{ fontSize: 15, color: COLORS.text, lineHeight: "24px", marginTop: 12 }}>
                Best,<br />Tam, Tbrain
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ClientRejection;
