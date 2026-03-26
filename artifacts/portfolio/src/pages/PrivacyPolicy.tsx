import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Code2 } from "lucide-react";

const LAST_UPDATED = "March 26, 2025";
const SITE_NAME = "Nayem — nayem.me";
const CONTACT_EMAIL = "nayem@nayem.me";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Privacy Policy | Nayem</title>
        <meta name="description" content="Privacy Policy for nayem.me — how we collect, use, and protect your information." />
      </Helmet>

      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <div className="flex items-center justify-between mb-10 pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-primary">nayem.me</span>
          </div>
        </div>

        <div className="glass border border-border/40 rounded-2xl p-6 sm:p-10">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: <span className="text-primary font-medium">{LAST_UPDATED}</span>
            </p>
          </div>

          <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-black prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-li:text-muted-foreground">

            <p>
              Welcome to {SITE_NAME}. This Privacy Policy explains how we collect, use, and protect
              your personal information when you visit our website. By using this site, you agree to
              the terms described here.
            </p>

            <h2>1. Information We Collect</h2>
            <h3>Information You Provide</h3>
            <p>
              When you submit a comment or use the contact form, we collect:
            </p>
            <ul>
              <li>Your name (as you provide it)</li>
              <li>Your email address</li>
              <li>The content of your message or comment</li>
            </ul>
            <p>
              Email addresses provided with comments are stored privately and never displayed publicly.
              They are used only for moderation purposes.
            </p>

            <h3>Information Collected Automatically</h3>
            <p>
              When you visit our site, standard web server logs may record:
            </p>
            <ul>
              <li>Your IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time of visit</li>
              <li>Referring URL</li>
            </ul>

            <h2>2. Cookies</h2>
            <p>
              This website uses cookies and similar technologies to:
            </p>
            <ul>
              <li>Remember your theme preference (dark/light mode)</li>
              <li>Enable analytics to understand how visitors use the site</li>
              <li>Display relevant advertisements via Google AdSense</li>
            </ul>
            <p>
              You can disable cookies in your browser settings at any time, though some site
              features may not work correctly without them.
            </p>

            <h2>3. Google AdSense & Advertising</h2>
            <p>
              This site uses <strong>Google AdSense</strong> to display advertisements. Google and
              its partners may use cookies to show ads based on your interests and prior visits to
              this and other websites. Google's use of advertising cookies is governed by the{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Privacy Policy
              </a>.
            </p>
            <p>
              You can opt out of personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
                Google Ads Settings
              </a>{" "}
              or the{" "}
              <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">
                Digital Advertising Alliance opt-out page
              </a>.
            </p>

            <h2>4. Google Analytics</h2>
            <p>
              We may use Google Analytics to analyze traffic patterns and improve the site. Google
              Analytics collects data such as pages viewed and session duration anonymously. You can
              opt out via the{" "}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>

            <h2>5. How We Use Your Information</h2>
            <p>Information collected is used to:</p>
            <ul>
              <li>Moderate and display approved comments</li>
              <li>Respond to contact form submissions</li>
              <li>Improve site performance and user experience</li>
              <li>Detect and prevent spam or abuse</li>
            </ul>
            <p>
              We do not sell, rent, or share your personal information with third parties for
              marketing purposes.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              Comments and contact messages are retained as long as the site operates or until you
              request deletion. You may request removal of your data at any time by contacting us.
            </p>

            <h2>7. Third-Party Links</h2>
            <p>
              This site may contain links to external websites. We are not responsible for the
              privacy practices or content of those sites. Please review their privacy policies
              independently.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              This site is not directed at children under 13. We do not knowingly collect personal
              information from anyone under 13 years of age.
            </p>

            <h2>9. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Object to or restrict our processing of your data</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with a revised "Last updated" date. Continued use of the site after changes
              constitutes acceptance of the updated policy.
            </p>

            <h2>11. Contact</h2>
            <p>
              For privacy-related questions or data requests, please contact:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Return to nayem.me
          </Link>
          <span className="mx-3 text-border">·</span>
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
