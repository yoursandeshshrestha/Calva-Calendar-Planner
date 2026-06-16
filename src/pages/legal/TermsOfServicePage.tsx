import { LegalPageLayout } from './LegalPageLayout'

export function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="June 17, 2025">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of Calva
        (&quot;the Service&quot;). By creating an account or using Calva, you agree to these Terms.
      </p>

      <section>
        <h2>Eligibility</h2>
        <p>
          You must be at least 13 years old to use Calva. By using the Service, you represent that
          you meet this requirement and have the authority to enter into these Terms.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          You sign in to Calva using your Google account. You are responsible for maintaining the
          security of your Google credentials and for all activity that occurs under your Calva
          account. Notify us promptly if you suspect unauthorized access.
        </p>
      </section>

      <section>
        <h2>Google Calendar access</h2>
        <p>
          Calva requests read-only access to your Google Calendar so we can display your events.
          You may revoke this access at any time through your Google account settings. Some features
          may not work if calendar access is removed.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use Calva for any unlawful purpose or in violation of applicable laws</li>
          <li>Attempt to gain unauthorized access to the Service, other accounts, or our systems</li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
          <li>Reverse engineer, scrape, or misuse the Service except as permitted by law</li>
        </ul>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          Calva and its original content, features, and branding are owned by us and protected by
          applicable intellectual property laws. You retain ownership of your calendar data. We
          receive only the limited rights needed to provide the Service to you.
        </p>
      </section>

      <section>
        <h2>Service availability</h2>
        <p>
          We strive to keep Calva available and reliable, but we do not guarantee uninterrupted or
          error-free operation. We may modify, suspend, or discontinue any part of the Service at
          any time, with or without notice.
        </p>
      </section>

      <section>
        <h2>Disclaimer of warranties</h2>
        <p>
          Calva is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any
          kind, whether express or implied, including implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Calva and its operators will not be liable for
          any indirect, incidental, special, consequential, or punitive damages, or any loss of
          profits, data, or goodwill arising from your use of the Service.
        </p>
      </section>

      <section>
        <h2>Termination</h2>
        <p>
          You may stop using Calva at any time by signing out and revoking Google access. We may
          suspend or terminate your access if you violate these Terms or if we discontinue the
          Service.
        </p>
      </section>

      <section>
        <h2>Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of Calva after changes become
          effective constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>
          Questions about these Terms? Contact us at{' '}
          <a href="mailto:hello@calva.app" className="font-medium text-[#6835D0] hover:underline">
            hello@calva.app
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  )
}
