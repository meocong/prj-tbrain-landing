import { Metadata } from "next";
import post_bg from "@/assets/images/post_bg.png";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Tbrain collects, uses, and protects personal information for our AI training data services. Last updated September 2026.",
  alternates: { canonical: "/policy" },
  robots: { index: true, follow: false },
};

/**
 * Every cookie and storage item the site sets, audited 2026-09-28 against the
 * code and the live site. A Cookiebot scan lists what it finds; this list is
 * what lets a reader, and a reviewer, match each name to a purpose. Keep it in
 * step with the code — a new key in `localStorage` or a new cookie belongs here
 * in the same change.
 */
const COOKIES: { name: string; type: string; purpose: string; duration: string; category: string }[] = [
  {
    name: "tbrain-cookie-consent",
    type: "Local storage",
    purpose: "Remembers whether you accepted or rejected analytics, so the banner is not shown again.",
    duration: "Until you clear site data",
    category: "Strictly necessary",
  },
  {
    name: "tbrain-theme",
    type: "Local storage",
    purpose: "Remembers light or dark mode, only after you use the theme switch. Stays in your browser; never sent to us.",
    duration: "Until you clear site data",
    category: "Functional (your choice)",
  },
  {
    name: "cf.turnstile.u",
    type: "Local storage",
    purpose: "Cloudflare Turnstile bot protection on the contact and access forms.",
    duration: "Set by Cloudflare",
    category: "Strictly necessary",
  },
  {
    name: "tb_session",
    type: "Cookie (first-party, HttpOnly)",
    purpose: "Keeps you signed in after you enter an access passcode for samples or benchmarks.",
    duration: "7 days",
    category: "Strictly necessary",
  },
  {
    name: "tb_chat_session",
    type: "Cookie (first-party, HttpOnly)",
    purpose: "Links your messages to one conversation, only once you use the chat assistant.",
    duration: "30 days",
    category: "Functional (your choice)",
  },
  {
    name: "tb_utm_v1",
    type: "Session storage",
    purpose: "Records which campaign link brought you here, attached to a form you send. Only with analytics consent.",
    duration: "Until the tab is closed",
    category: "Analytics (consent)",
  },
  {
    name: "_ga, _ga_<ID>",
    type: "Cookie (Google Analytics)",
    purpose: "Counts visits and pages viewed. Only set after you accept analytics; advertising features are off.",
    duration: "Up to 2 years",
    category: "Analytics (consent)",
  },
  {
    name: "sb-*",
    type: "Cookie (first-party)",
    purpose: "Staff sign-in to the internal admin area. Not set for site visitors.",
    duration: "Session",
    category: "Strictly necessary",
  },
];

export default async function Page() {
  return (
    <div>
      <Header />
      <main
        style={{ backgroundImage: `url(${post_bg?.src})` }}
        className="bg-center bg-no-repeat bg-cover">
        <div className="wrap !fixed top-[400px] w-full">
          <div className="one top-0 left-0 h-80 w-80 "></div>
          <div className="two top-0 right-0 h-80 w-80 "></div>
        </div>
        <section
          id="home"
          className="container mx-auto max-w-6xl px-4 pt-24 pb-24 relative"
        >
          <h1
            className="text-4xl font-semibold tracking-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            Privacy Policy for Tbrain LLC
          </h1>
          <p className="italic mt-4 mb-8" style={{ color: "var(--text-muted)" }}>Last Updated: Sep 29, 2026</p>
          <div className="mb-5">
            Tbrain LLC (&quot;Tbrain,&quot; &quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;) is committed to safeguarding your privacy. This
            Privacy Policy outlines how we collect, use, disclose, and protect
            your personal information when you interact with our services.
          </div>
          <div className="mb-5 font-semibold">1. Who We Are</div>
          <div className="mb-5">
            Tbrain LLC is a full-service human resource agency specializing in
            providing high-quality AI trainers. Our team has expertise in
            various technical domains, and are dedicated to improving your AI
            models. We operate from the US and serve clients globally.
          </div>
          <div className="mb-5 font-semibold">2. Scope and Applicability</div>
          <div className="mb-5">
            This Privacy Policy applies to personal information collected
            through our websites, products, services, applications
            (collectively, the &quot;Services&quot;), events, or other
            interactions with us. It does not cover situations where we process
            personal information on behalf of our clients; in such cases, our
            client&apos;s privacy policies will apply.
          </div>
          <div className="mb-5 font-semibold">3. Information We Collect</div>
          <div className="mb-5">
            We may collect the following types of information:
          </div>
          <ul className="mb-5 list-disc pl-10">
            <li>
              <span className="font-semibold">
                Personal Information You Provide
              </span>
              : This includes your name, email address, phone number, job title,
              company information, and any other information you provide
              directly to us.
            </li>
            <li>
              <span className="font-semibold">
                Information Collected Automatically
              </span>
              : When you visit our website, our servers receive your IP address
              and browser information as part of every request. With your
              consent only, analytics cookies also record pages visited and how
              you arrived (see Section 9).
            </li>
            <li>
              <span className="font-semibold">Website Chat Assistant</span>: If
              you use the chat assistant on our website, we store the messages
              you send and receive, together with your IP address and browser
              user agent, so that we can answer you and follow up on your
              enquiry. Your messages are processed by a third-party AI model
              provider acting as our service provider. Please do not enter
              sensitive personal information in the chat.
            </li>
            <li>
              <span className="font-semibold">
                Information from Third Parties
              </span>
              : We may receive information about you from third-party sources,
              such as social media platforms, if you choose to link your
              accounts.
            </li>
          </ul>
          <div className="mb-5 font-semibold">
            4. How We Use Your Information
          </div>
          <div className="mb-5">
            We use your information for purposes including:
          </div>
          <ul className="mb-5 list-disc pl-10">
            <li>Providing, maintaining, and improving our Services</li>
            <li>Responding to your inquiries and providing customer support</li>
            <li>
              Processing transactions and fulfilling contractual obligations
            </li>
            <li>Analyzing usage to enhance user experience</li>
            <li>Ensuring security and preventing fraud</li>
            <li>Complying with legal obligations</li>
          </ul>
          <div className="mb-5 font-semibold">
            5. Sharing and Disclosure of Information
          </div>
          <div className="mb-5">
            We may share your information in the following circumstances:
          </div>
          <ul className="mb-5 list-disc pl-10">
            <li>
              <span className="font-semibold">Service Providers</span>: With
              third-party vendors who assist in providing our Services, under
              strict confidentiality agreements — for example website hosting,
              database and file storage, email delivery, bot protection
              (Cloudflare Turnstile), website analytics (Google Analytics, only
              with your consent), and AI model providers for our chat
              assistant.
            </li>
            <li>
              <span className="font-semibold">Legal Obligations</span>: To
              comply with legal requirements or respond to lawful requests from
              public authorities.
            </li>
            <li>
              <span className="font-semibold">Business Transfers</span>: In
              connection with mergers, acquisitions, or asset sales, your
              information may be transferred to the successor entity.
            </li>
          </ul>
          <div className="mb-5">
            We do not sell your personal information, and we do not share it
            for cross-context behavioral advertising. Our analytics is
            configured with Google advertising features and ad personalization
            turned off.
          </div>
          <div className="mb-5 font-semibold">6. Data Security</div>
          <div className="mb-5">
            We implement industry-standard security measures to protect your
            information. However, no method of transmission over the internet or
            electronic storage is completely secure, and we cannot guarantee
            absolute security.
          </div>
          <div className="mb-5 font-semibold">7. Your Rights and Choices</div>
          <div className="mb-5">
            Depending on your jurisdiction, you may have rights regarding your
            personal information, such as:
          </div>
          <ul className="mb-5 list-disc pl-10">
            <li>Accessing your personal data</li>
            <li>Correcting inaccurate information</li>
            <li>Requesting deletion of your data</li>
            <li>Objecting to or restricting data processing</li>
            <li>Data portability</li>
          </ul>
          <div className="mb-5">
            To exercise these rights, please contact us at info@tbrain.ai
          </div>
          <div className="mb-5 font-semibold">8. Data Retention</div>
          <div className="mb-5">
            We retain your information only as long as necessary to fulfill the
            purposes outlined in this Privacy Policy or as required by law. Once
            no longer needed, we will securely delete or anonymize your data.
          </div>
          {/* CCPA §1798.100(a)(3): the retention period, or the criteria that set
              it, for each category — "as long as necessary" alone does not meet
              it. Criteria, not numbers: a period stated here that the systems do
              not actually enforce would be a misstatement of its own. */}
          <ul className="mb-5 list-disc pl-10">
            <li>
              Contact, access-request and case-study download details: while we
              are in an active business conversation with you, and afterwards
              only as long as needed to follow up or to keep a record of our
              dealings, unless you ask us to delete them sooner.
            </li>
            <li>
              Newsletter details: until you unsubscribe.
            </li>
            <li>
              Chat assistant messages, with their IP address and browser user
              agent: as long as needed to answer and follow up on your enquiry
              and to keep the assistant secure.
            </li>
            <li>
              Analytics data (only with your consent): for the retention period
              set in our Google Analytics account, after which Google deletes it.
            </li>
            <li>
              Records we must keep for legal, tax or contractual reasons: for the
              period the law or the contract requires.
            </li>
          </ul>
          <div className="mb-5 font-semibold">
            9. Cookies and Similar Technologies
          </div>
          <div className="mb-5">
            We use a small number of cookies and browser storage items. Only the
            analytics items require your consent; the rest are needed for the
            site or for a feature you choose to use, and never identify you to a
            third party for advertising.
          </div>
          <div className="mb-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 font-semibold">Purpose</th>
                  <th className="py-2 pr-4 font-semibold">Duration</th>
                  <th className="py-2 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {COOKIES.map((c) => (
                  <tr key={c.name} className="align-top" style={{ borderTop: "1px solid var(--border-default)" }}>
                    <td className="py-2 pr-4 font-mono text-xs">{c.name}</td>
                    <td className="py-2 pr-4">{c.type}</td>
                    <td className="py-2 pr-4">{c.purpose}</td>
                    <td className="py-2 pr-4">{c.duration}</td>
                    <td className="py-2">{c.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mb-5">
            When you first visit, a banner lets you accept or reject analytics.
            Analytics does not run, and sets nothing, until you accept. If your
            browser sends a Global Privacy Control (GPC) signal, we treat it as a
            rejection and do not show the banner unless you open it. You can
            change your choice at any time with &quot;Cookie settings&quot; or
            &quot;Do Not Sell or Share My Personal Information&quot; in the site
            footer; withdrawing consent stops analytics immediately and deletes
            its cookies. You can also clear cookies and site data in your
            browser.
          </div>
          <div className="mb-5 font-semibold">
            10. Your California Privacy Rights
          </div>
          <div className="mb-5">
            If you are a California resident, the California Consumer Privacy
            Act, as amended by the California Privacy Rights Act (together,
            &quot;CCPA&quot;), gives you the rights below. In the past 12
            months we have collected the categories of personal information
            described in Section 3 — identifiers (such as name, email address
            and IP address), professional information (such as job title and
            company), internet activity (such as pages visited, with consent),
            and the content of messages you send us — for the purposes in
            Section 4, from the sources in Section 3, and disclosed them only to
            the service providers in Section 5.
          </div>
          <ul className="mb-5 list-disc pl-10">
            <li>
              <span className="font-semibold">Right to know and access</span>{" "}
              the personal information we have collected about you.
            </li>
            <li>
              <span className="font-semibold">Right to delete</span> personal
              information we collected from you, subject to legal exceptions.
            </li>
            <li>
              <span className="font-semibold">Right to correct</span>{" "}
              inaccurate personal information.
            </li>
            <li>
              <span className="font-semibold">
                Right to opt out of sale or sharing
              </span>
              . We do not sell personal information or share it for
              cross-context behavioral advertising, and we have not done so in
              the past 12 months. You can still turn off analytics at any time
              with &quot;Do Not Sell or Share My Personal Information&quot; in
              the footer, and we honor Global Privacy Control signals.
            </li>
            <li>
              <span className="font-semibold">
                Right to limit use of sensitive personal information
              </span>
              . We do not collect sensitive personal information through our
              website.
            </li>
            <li>
              <span className="font-semibold">Right to non-discrimination</span>{" "}
              for exercising any of these rights.
            </li>
          </ul>
          <div className="mb-5">
            To make a request, email info@tbrain.ai with the subject
            &quot;California Privacy Request&quot;. We will verify your
            request by matching information you provide with information we
            hold, and respond within 45 days. You may use an authorized agent,
            who must provide proof of your permission. We do not knowingly
            collect personal information from anyone under 16. You can also
            send a request through our{" "}
            <a href="/contact" className="underline">
              contact form
            </a>
            .
          </div>
          <div className="mb-5">
            <span className="font-semibold">Residents of other U.S. states.</span>{" "}
            If you live in a state with a consumer privacy law — including
            Virginia, Colorado, Connecticut, Utah, Texas, Oregon, Montana, Iowa,
            Delaware, New Hampshire, New Jersey, Nebraska, Tennessee, Minnesota,
            Maryland, Indiana, Kentucky and Rhode Island — you have similar rights
            to access, correct, delete and obtain a copy of your personal
            information, and to opt out of its sale, targeted advertising and
            profiling. We do none of those three, and we honor Global Privacy
            Control signals as an opt-out. Make a request the same way as above.
            If we decline your request, you may appeal by replying to our
            decision with the subject &quot;Privacy Request Appeal&quot;; we will
            respond within the time your state&apos;s law allows (usually 45 or
            60 days) and, if we deny the appeal, tell you how to contact your
            state Attorney General.
          </div>
<div className="mb-5 font-semibold">
            11. International Data Transfers
          </div>
          <div className="mb-5">
            Your information may be transferred to and processed in countries
            other than your own. We ensure that such transfers comply with
            applicable data protection laws and that your information remains
            protected.
          </div>
          <div className="mb-5 font-semibold">
            12. Changes to This Privacy Policy
          </div>
          <div className="mb-5">
            We may update this Privacy Policy periodically. Changes will be
            posted on this page with an updated &quot;Last Updated&quot; date.
            We encourage you to review this policy regularly.
          </div>
          <div className="mb-5 font-semibold">13. Contact Us</div>
          <div className="mb-5">
            If you have questions or concerns about this Privacy Policy or our
            data practices, please contact us at:
          </div>
          <div className="mb-5 font-semibold">Tbrain LLC</div>
          <div>
            Email: info@tbrain.ai
            <br />
            Address: Florida, USA · Hanoi, Vietnam
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
