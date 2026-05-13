import { Metadata } from "next";
import post_bg from "@/assets/images/post_bg.png";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Tbrain collects, uses, and protects personal information for our AI training data services. Last updated November 2024.",
  alternates: { canonical: "/policy" },
  robots: { index: true, follow: false },
};

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
          <p className="italic mt-4 mb-8" style={{ color: "var(--text-muted)" }}>Last Updated: Nov 4, 2024</p>
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
              : We use cookies and similar technologies to collect information
              about your interactions with our Services, such as IP address,
              browser type, operating system, and pages visited.
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
              strict confidentiality agreements.
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
          <div className="mb-5 font-semibold">
            9. Cookies and Tracking Technologies
          </div>
          <div className="mb-5">
            Our Services use cookies and similar technologies to enhance user
            experience and analyze usage. You can manage your cookie preferences
            through your browser settings.
          </div>
          <div className="mb-5 font-semibold">
            10. International Data Transfers
          </div>
          <div className="mb-5">
            Your information may be transferred to and processed in countries
            other than your own. We ensure that such transfers comply with
            applicable data protection laws and that your information remains
            protected.
          </div>
          <div className="mb-5 font-semibold">
            11. Changes to This Privacy Policy
          </div>
          <div className="mb-5">
            We may update this Privacy Policy periodically. Changes will be
            posted on this page with an updated &quot;Last Updated&quot; date.
            We encourage you to review this policy regularly.
          </div>
          <div className="mb-5 font-semibold">12. Contact Us</div>
          <div className="mb-5">
            If you have questions or concerns about this Privacy Policy or our
            data practices, please contact us at:
          </div>
          <div className="mb-5 font-semibold">Tbrain LLC</div>
          <div>
            Email: info@tbrain.ai
            <br />
            Address: 1209 N Orange St, Wilmington, DE 19801 USA
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
