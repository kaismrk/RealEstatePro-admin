import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Hovioo",
  description: "How Hovioo collects, uses, and protects your personal information.",
};

const EFFECTIVE_DATE = "June 22, 2026";
const CONTACT_EMAIL = "privacy@hovioo.com"; // TODO: confirm before going live
const COMPANY_NAME = "Hovioo"; // TODO: replace with registered legal entity name if/when incorporated

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
          <Image src="/hovioo-logo-violet.png" alt="Hovioo" width={80} height={28} className="h-6 w-auto" />
        </Link>

        <article className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
          <h1 className="font-display text-3xl font-bold text-neutral-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-neutral-500">Effective: {EFFECTIVE_DATE}</p>

          <div className="prose prose-neutral mt-8 max-w-none text-neutral-700">
            <p>
              {COMPANY_NAME} ("we", "us", "our") operates the Hovioo real-estate
              platform (mobile app, web app, and admin tools, collectively the "Service"). This
              Privacy Policy explains what personal information we collect, why we collect it, how
              we use and share it, and the rights you have over it. It applies to all users of the
              Service.
            </p>

            <h2>1. Information we collect</h2>
            <ul>
              <li>
                <strong>Account information</strong> — email address, first name, last name,
                country, hashed password. Collected when you create an account.
              </li>
              <li>
                <strong>Listing content</strong> — property descriptions, addresses, prices,
                photos, amenity flags, and any other content you submit when publishing a listing.
              </li>
              <li>
                <strong>Location data</strong> — approximate (city-level) location for searching
                nearby properties, and precise location (only with your explicit OS-level
                permission) for "near me" search and saved searches.
              </li>
              <li>
                <strong>Messages</strong> — message content you send to other users (e.g. inquiries
                to property owners), and the parties to those messages.
              </li>
              <li>
                <strong>Device and usage data</strong> — IP address, device type, OS version, app
                version, crash reports, error events, and basic interaction analytics (which
                screens you visit, which actions you take). Used to operate and improve the
                Service.
              </li>
              <li>
                <strong>Cookies and similar technologies</strong> — only for session authentication
                (an httpOnly cookie storing your auth token). No advertising or third-party
                tracking cookies.
              </li>
            </ul>

            <h2>2. Why we use your information</h2>
            <ul>
              <li>To create and authenticate your account, and keep you signed in.</li>
              <li>
                To operate the Service — display listings, route messages, save favorites and
                searches, send notifications about properties matching your saved searches.
              </li>
              <li>
                To send transactional email (password reset, listing approval/rejection, message
                notifications, account-related notices).
              </li>
              <li>To detect and prevent abuse, fraud, spam, and security threats.</li>
              <li>To comply with legal obligations and respond to lawful requests.</li>
              <li>To improve the Service via aggregate analytics and crash reports.</li>
            </ul>

            <h2>3. Who we share with</h2>
            <p>
              We do <strong>not</strong> sell your personal information. We share data only with
              service providers strictly needed to operate the Service:
            </p>
            <ul>
              <li>
                <strong>DigitalOcean</strong> (cloud infrastructure, Frankfurt, Germany) — hosts
                our database and servers.
              </li>
              <li>
                <strong>Cloudflare</strong> (DNS) — resolves domain names for our domain.
              </li>
              <li>
                <strong>Resend</strong> (transactional email) — sends emails on our behalf
                (password resets, alerts).
              </li>
              <li>
                <strong>Sentry</strong> (error tracking) — captures application crashes and errors
                to help us fix bugs.
              </li>
              <li>
                <strong>Vercel</strong> (admin panel hosting) — hosts the administrator interface.
              </li>
            </ul>
            <p>
              All processors are bound by data-processing agreements that require them to handle
              your data only on our instructions and to provide reasonable security safeguards.
            </p>

            <h2>4. Data retention</h2>
            <ul>
              <li>
                <strong>Account data</strong> — retained while your account is active. Deleted
                within 30 days of account closure (subject to legal-hold exceptions).
              </li>
              <li>
                <strong>Listings</strong> — retained while published; soft-deleted on removal and
                purged after 90 days.
              </li>
              <li>
                <strong>Messages</strong> — retained for 18 months after the last interaction.
              </li>
              <li>
                <strong>Server logs / crash reports</strong> — retained for 30 days.
              </li>
              <li>
                <strong>Database backups</strong> — retained for up to 7 days.
              </li>
            </ul>

            <h2>5. Your rights</h2>
            <p>You can at any time:</p>
            <ul>
              <li>
                Access, correct, or delete your account information from the in-app Settings →
                Profile screen.
              </li>
              <li>Request a full export of your data by emailing us.</li>
              <li>Request immediate deletion of your account and associated data by emailing us.</li>
              <li>Opt out of non-essential email notifications (Settings → Notifications).</li>
              <li>
                Withdraw OS-level permissions (location, photos, camera) at any time via your
                device settings.
              </li>
            </ul>

            <h2>6. Security</h2>
            <p>
              We use industry-standard safeguards including TLS encryption for all data in transit,
              encryption at rest for our database, hashed and salted passwords (bcrypt), rate
              limiting on authentication endpoints, role-based access controls for administrators,
              and audit logging for sensitive operations. No system is completely secure; we cannot
              guarantee absolute security.
            </p>

            <h2>7. Children's privacy</h2>
            <p>
              The Service is not directed to children under 13. We do not knowingly collect
              personal information from children. If you believe a child has provided us with their
              data, contact us and we will delete it.
            </p>

            <h2>8. International transfers</h2>
            <p>
              Your data is stored in the European Union (DigitalOcean Frankfurt region). Where
              processors operate from other countries (e.g. the United States for Sentry and
              Vercel), we rely on Standard Contractual Clauses and similar safeguards approved by
              the European Commission.
            </p>

            <h2>9. Changes</h2>
            <p>
              We may update this Policy from time to time. Material changes will be notified via
              email and a banner in the app at least 30 days before they take effect. The
              "Effective" date at the top of this page indicates the latest version.
            </p>

            <h2>10. Contact</h2>
            <p>
              For questions about this Policy or to exercise your rights, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <p>
              <strong>Local data-protection authority</strong> — If you are a resident of Tunisia,
              you may file a complaint with the Instance Nationale de Protection des Données
              Personnelles (INPDP, https://www.inpdp.nat.tn). EU residents may contact their local
              supervisory authority.
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
