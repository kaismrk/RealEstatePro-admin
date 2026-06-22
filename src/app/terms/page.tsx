import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Hovioo",
  description: "The rules and agreement that govern your use of Hovioo.",
};

const EFFECTIVE_DATE = "June 22, 2026";
const CONTACT_EMAIL = "legal@hovioo.com"; // TODO: confirm before going live
const COMPANY_NAME = "Hovioo"; // TODO: replace with registered legal entity once incorporated
const GOVERNING_LAW = "Tunisia";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
          <Image src="/hovioo-logo-violet.png" alt="Hovioo" width={80} height={28} className="h-6 w-auto" />
        </Link>

        <article className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
          <h1 className="font-display text-3xl font-bold text-neutral-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-neutral-500">Effective: {EFFECTIVE_DATE}</p>

          <div className="prose prose-neutral mt-8 max-w-none text-neutral-700">
            <p>
              These Terms of Service ("Terms") form a binding agreement between you and{" "}
              {COMPANY_NAME} regarding your use of the Hovioo real-estate platform (mobile app, web
              app, and related services, collectively the "Service"). By creating an account,
              browsing as a guest, or otherwise using the Service, you agree to these Terms. If you
              do not agree, do not use the Service.
            </p>

            <h2>1. Eligibility</h2>
            <p>
              You must be at least 18 years old and legally able to enter into contracts in your
              jurisdiction to use the Service. By using the Service you represent that you meet
              these requirements.
            </p>

            <h2>2. Your account</h2>
            <ul>
              <li>You must provide accurate registration information and keep it up to date.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>
                You must keep your password confidential. Notify us immediately at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                of any unauthorized access.
              </li>
              <li>
                We may suspend or terminate your account if we reasonably believe you have violated
                these Terms.
              </li>
            </ul>

            <h2>3. Acceptable use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Post or transmit content that is unlawful, fraudulent, deceptive, or infringes others' rights.</li>
              <li>List properties you do not have legal authority to advertise.</li>
              <li>Post duplicate, misleading, or low-quality listings (we may remove them).</li>
              <li>Send unsolicited commercial messages, spam, or harass other users.</li>
              <li>Scrape, automate, or otherwise interact with the Service except via its intended interfaces.</li>
              <li>Reverse engineer, decompile, or attempt to extract our source code.</li>
              <li>Interfere with the Service's security, reliability, or availability.</li>
              <li>Use the Service for any illegal purpose or in violation of any applicable law.</li>
            </ul>

            <h2>4. Listings and user content</h2>
            <ul>
              <li>
                You retain ownership of content you submit (listings, photos, messages). By
                submitting it, you grant {COMPANY_NAME} a worldwide, non-exclusive, royalty-free
                license to host, display, distribute, and process that content solely to operate
                and improve the Service.
              </li>
              <li>
                You are solely responsible for the accuracy and legality of your listings,
                including all property details, prices, and photographs.
              </li>
              <li>
                We may, but are not obligated to, review listings. We may reject, modify, or remove
                any listing that violates these Terms or applicable law, with or without notice.
              </li>
              <li>
                If you flag content as inappropriate, we will review and act within a reasonable
                time.
              </li>
            </ul>

            <h2>5. Paid services (future)</h2>
            <p>
              Some features (boosted listings, agency subscriptions, listing packs beyond the free
              quota) may be paid. Prices, billing terms, and refund policies will be presented at
              the point of purchase. By purchasing a paid service, you agree to the terms shown to
              you at that time.
            </p>

            <h2>6. Real-estate transactions</h2>
            <p>
              Hovioo is a listing platform, not a real-estate agent, broker, lender, or escrow
              service. We do not verify property ownership, sale prices, or transaction details. We
              are not a party to any agreement between buyers, sellers, landlords, tenants, or
              agents. You are solely responsible for your due diligence, contract negotiation, and
              compliance with local real-estate law.
            </p>

            <h2>7. Intellectual property</h2>
            <p>
              The Service (including software, design, branding, and the Hovioo name and logo) is
              owned by {COMPANY_NAME} and protected by intellectual property laws. You receive a
              limited, non-exclusive, non-transferable license to use the Service in accordance
              with these Terms. No other rights are granted.
            </p>

            <h2>8. Privacy</h2>
            <p>
              Our handling of your personal information is governed by the{" "}
              <Link href="/privacy" className="text-primary-600 underline">
                Privacy Policy
              </Link>
              , which is incorporated by reference into these Terms.
            </p>

            <h2>9. Disclaimers</h2>
            <p>
              The Service is provided "as is" and "as available", without warranties of any kind,
              either express or implied, including warranties of merchantability, fitness for a
              particular purpose, non-infringement, accuracy, or uninterrupted availability. We do
              not warrant that any listing is accurate, current, or complete.
            </p>

            <h2>10. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, {COMPANY_NAME} shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or for any loss of
              profits, revenues, data, or goodwill, arising out of or in connection with your use
              of the Service. Our aggregate liability for any claim arising under these Terms shall
              not exceed (i) the amount you paid us in the 12 months preceding the claim or (ii)
              USD 100, whichever is greater.
            </p>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless {COMPANY_NAME}, its officers, directors,
              employees, and agents from any claim, demand, loss, liability, damage, or expense
              (including reasonable legal fees) arising out of (a) your breach of these Terms,
              (b) your violation of any law or third-party right, or (c) any content you submit
              to the Service.
            </p>

            <h2>12. Termination</h2>
            <p>
              You may stop using the Service and delete your account at any time. We may suspend or
              terminate your access to the Service for any reason, including violation of these
              Terms. Sections that by their nature should survive termination will survive
              (intellectual property, disclaimers, limitations of liability, indemnification,
              governing law).
            </p>

            <h2>13. Governing law and disputes</h2>
            <p>
              These Terms are governed by the laws of {GOVERNING_LAW}, without regard to its
              conflict-of-laws principles. Any dispute arising under these Terms shall be resolved
              by the competent courts of Tunis, Tunisia, except that we may seek injunctive relief
              in any jurisdiction where appropriate.
            </p>

            <h2>14. Changes</h2>
            <p>
              We may revise these Terms from time to time. Material changes will be notified via
              email and an in-app banner at least 30 days before they take effect. Continued use of
              the Service after the effective date constitutes acceptance of the revised Terms.
            </p>

            <h2>15. Miscellaneous</h2>
            <ul>
              <li>
                <strong>Entire agreement</strong> — These Terms and the Privacy Policy constitute
                the entire agreement between you and {COMPANY_NAME} regarding the Service.
              </li>
              <li>
                <strong>Severability</strong> — If any provision is held unenforceable, the
                remaining provisions remain in full effect.
              </li>
              <li>
                <strong>No waiver</strong> — Our failure to enforce any provision is not a waiver
                of our right to enforce it later.
              </li>
              <li>
                <strong>Assignment</strong> — You may not assign these Terms without our prior
                written consent. We may assign without restriction.
              </li>
            </ul>

            <h2>16. Contact</h2>
            <p>
              Questions about these Terms can be sent to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </article>

        <p className="mt-6 text-center text-xs text-neutral-500">
          <Link href="/terms" className="underline hover:text-neutral-700">
            Terms of Service
          </Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-neutral-700">
            Privacy Policy
          </Link>
          {" · © "}
          {new Date().getFullYear()} {COMPANY_NAME}
        </p>
      </div>
    </main>
  );
}
