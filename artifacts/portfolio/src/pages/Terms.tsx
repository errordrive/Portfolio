import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LAST_UPDATED = "March 26, 2025";
const SITE_URL = "https://nayem.me";
const CONTACT_EMAIL = "nayem@nayem.me";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) return saved;
  }
  return "dark";
}

export default function Terms() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Terms &amp; Conditions | Nayem</title>
        <meta name="description" content="Terms and Conditions for using nayem.me — intellectual property, disclaimers, and user conduct." />
      </Helmet>

      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          ← Back to Home
        </Link>

        <div className="glass border border-border/40 rounded-2xl p-6 sm:p-10">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3">Terms &amp; Conditions</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: <span className="text-primary font-medium">{LAST_UPDATED}</span>
            </p>
          </div>

          <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-black prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-li:text-muted-foreground">

            <p>
              Please read these Terms &amp; Conditions carefully before using nayem.me (
              <a href={SITE_URL} target="_blank" rel="noopener noreferrer">{SITE_URL}</a>).
              By accessing or using this website, you agree to be bound by these terms.
              If you do not agree with any part of these terms, please do not use the site.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By using this website, you confirm that you are at least 13 years old and have the
              legal capacity to enter into these terms. If you are using this site on behalf of an
              organization, you represent that you are authorized to bind that organization.
            </p>

            <h2>2. Intellectual Property</h2>
            <p>
              All content on this website — including but not limited to blog posts, articles,
              code snippets, images, and design elements — is the property of Nayem or its
              respective creators and is protected by applicable intellectual property laws.
            </p>
            <p>You may:</p>
            <ul>
              <li>Share links to this website's content</li>
              <li>Quote short excerpts with proper attribution and a link back to the original post</li>
            </ul>
            <p>You may not:</p>
            <ul>
              <li>Reproduce, republish, or redistribute full articles without written permission</li>
              <li>Use any content for commercial purposes without prior consent</li>
              <li>Remove or alter any copyright, trademark, or attribution notices</li>
            </ul>

            <h2>3. User-Generated Content (Comments)</h2>
            <p>
              When you submit a comment, you grant us a non-exclusive, royalty-free, perpetual
              license to display and use that content on this site. You are solely responsible for
              the content of your comments and warrant that:
            </p>
            <ul>
              <li>Your comment does not infringe on any third-party rights</li>
              <li>Your comment does not contain unlawful, defamatory, or abusive material</li>
              <li>Your comment does not contain spam, malware, or harmful links</li>
            </ul>
            <p>
              We reserve the right to moderate, edit, or remove any comment at our sole discretion
              without notice.
            </p>

            <h2>4. Disclaimer of Warranties</h2>
            <p>
              This website and its content are provided <strong>"as is"</strong> without any
              warranty of any kind, express or implied. We do not warrant that:
            </p>
            <ul>
              <li>The site will be available at all times or free from errors</li>
              <li>The information provided is accurate, complete, or up to date</li>
              <li>Content related to Android reverse engineering, security, or software tools
                is suitable for any particular purpose</li>
            </ul>
            <p>
              Technical content (including code, tools, and RE techniques) is shared for
              educational purposes only. Always verify information before applying it in
              production or security-sensitive contexts.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Nayem and nayem.me shall not be liable
              for any direct, indirect, incidental, consequential, or punitive damages arising
              from your use of, or inability to use, this website or its content.
            </p>
            <p>
              This includes, without limitation, damages for loss of data, lost profits, or
              business interruption — even if we have been advised of the possibility of such
              damages.
            </p>

            <h2>6. Android Reverse Engineering Content</h2>
            <p>
              Articles and content related to Android reverse engineering (RE) on this site are
              intended solely for <strong>educational and research purposes</strong>. Such content
              is meant to help readers understand how software works and improve security awareness.
            </p>
            <p>You must not use any techniques, tools, or information from this site to:</p>
            <ul>
              <li>Access systems or applications without authorization</li>
              <li>Bypass security measures you do not have permission to test</li>
              <li>Violate any applicable laws or the terms of service of any platform or application</li>
            </ul>
            <p>The author accepts no responsibility for any misuse of this information.</p>

            <h2>7. Third-Party Links and Advertisements</h2>
            <p>
              This site may contain links to third-party websites and may display advertisements
              via Google AdSense. We have no control over the content, privacy policies, or
              practices of third-party sites and accept no responsibility for them.
            </p>
            <p>
              Advertisement placement does not constitute endorsement of any advertised product
              or service.
            </p>

            <h2>8. Modifications to These Terms</h2>
            <p>
              We reserve the right to update these Terms &amp; Conditions at any time. Changes
              will be posted on this page with a revised "Last updated" date. Your continued
              use of the site after any changes constitutes acceptance of the new terms.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These terms are governed by applicable laws. Any disputes arising from your use
              of this website shall be resolved in good faith between the parties.
            </p>

            <h2>10. Contact</h2>
            <p>
              If you have questions about these Terms &amp; Conditions, please contact:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Return to nayem.me
          </Link>
          <span className="mx-3 text-muted-foreground/30">·</span>
          <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
