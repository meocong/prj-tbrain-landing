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
  email: string;
  company: string;
  role?: string;
  teamSize?: string;
  useCase?: string;
  targetUse?: string[];
  batchName: string;
  approveUrl: string;
  rejectUrl: string;
}

const COLORS = {
  primary: "#6C3CF4",
  text: "#0e1b2e",
  muted: "#78818f",
  border: "#E5E7EB",
};

export function AdminRequestNotification(p: Props) {
  return (
    <Html>
      <Head />
      <Preview>{p.fullName} at {p.company} requested access to {p.batchName}.</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: "#FAFAF7", fontFamily: "Inter, Helvetica, Arial, sans-serif", margin: 0, padding: "32px 0" }}>
          <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
            <div style={{ height: 4, background: "linear-gradient(90deg,#d865ff,#0151ff)" }} />
            <Section style={{ padding: "32px 32px 8px" }}>
              <Text style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.muted, margin: 0 }}>
                / terminal-bench — new request
              </Text>
              <Heading style={{ fontSize: 24, color: COLORS.text, margin: "12px 0 0", fontFamily: "'Space Grotesk', Inter, sans-serif", fontWeight: 600 }}>
                {p.fullName} wants access
              </Heading>
            </Section>

            <Section style={{ padding: "16px 32px 0" }}>
              <Text style={{ fontSize: 15, color: COLORS.text, lineHeight: "24px" }}>
                {p.fullName} at <b>{p.company}</b> requested access to{" "}
                <b>{p.batchName || "Terminal Bench"}</b>.
              </Text>
            </Section>

            <Section style={{ padding: "8px 32px 0" }}>
              <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
                <MetaRow label="Email" value={p.email} mono />
                <MetaRow label="Company" value={p.company} />
                {p.role ? <MetaRow label="Role" value={p.role} /> : null}
                {p.teamSize ? <MetaRow label="Team size" value={p.teamSize} /> : null}
                {p.targetUse && p.targetUse.length > 0 ? (
                  <MetaRow label="Intended use" value={p.targetUse.join(" · ")} />
                ) : null}
              </div>
              {p.useCase ? (
                <Text style={{ marginTop: 16, fontSize: 14, color: COLORS.text, lineHeight: "22px", whiteSpace: "pre-wrap" }}>
                  <b style={{ color: COLORS.muted }}>Use case:</b> {p.useCase}
                </Text>
              ) : null}
            </Section>

            <Section style={{ padding: "24px 32px 8px" }}>
              <table cellPadding={0} cellSpacing={0} style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: 12 }}>
                      <Button
                        href={p.approveUrl}
                        style={{ display: "inline-block", width: "100%", boxSizing: "border-box", textAlign: "center", backgroundColor: COLORS.primary, color: "#ffffff", padding: "16px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none" }}
                      >
                        Approve & send passcode
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <Button
                        href={p.rejectUrl}
                        style={{ display: "inline-block", width: "100%", boxSizing: "border-box", textAlign: "center", backgroundColor: "#ffffff", color: COLORS.text, padding: "16px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", border: `1px solid ${COLORS.border}` }}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Section style={{ padding: "8px 32px 28px" }}>
              <Hr style={{ borderColor: COLORS.border, margin: "12px 0" }} />
              <Text style={{ fontSize: 12, color: COLORS.muted, lineHeight: "18px" }}>
                Approving generates a per-user passcode valid for 30 days and emails it to {p.email}.
                The approval link expires in 7 days.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <table cellPadding={0} cellSpacing={0} style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={{ padding: "6px 0", width: 120, fontSize: 13, color: COLORS.muted }}>{label}</td>
          <td style={{ padding: "6px 0", fontSize: 14, color: COLORS.text, fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined }}>
            {value}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default AdminRequestNotification;
