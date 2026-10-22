import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/images/logo.svg";
import { ABOUT } from "@/lib/landing/research";
import { Reveal } from "./motion";
import { Container } from "./ui";

export function AboutBand() {
  return (
    <section id="about" aria-labelledby="about-title" style={{ background: "var(--bp-bg)" }}>
      <Container style={{ paddingTop: "clamp(56px, 7vw, 96px)", paddingBottom: "clamp(56px, 7vw, 96px)" }}>
        <Reveal>
          <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Image src={Logo} width={110} height={36} alt="" className="dark:brightness-0 dark:invert" />
              <h2 id="about-title" className="bp-mono mt-5" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>{ABOUT.title}</h2>
            </div>
            <div className="lg:col-span-8">
              <p style={{ fontSize: "clamp(18px, 1.6vw, 22px)", lineHeight: 1.55, letterSpacing: "-0.01em", color: "var(--bp-ink)" }}>{ABOUT.body}</p>
              <Link href={ABOUT.site.href} className="rs-cite bp-mono mt-6 inline-block" style={{ fontSize: 12 }}>
                {ABOUT.site.display}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
