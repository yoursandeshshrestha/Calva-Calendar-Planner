import { LegalPageLayout } from './LegalPageLayout'

export function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="June 17, 2025">
      <p>
        Calva (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy Policy
        explains how we collect, use, and protect information when you use our calendar planning
        service.
      </p>

      <section>
        <h2>Information we collect</h2>
        <p>When you sign in with Google, we may collect:</p>
        <ul>
          <li>Your name, email address, and profile picture from your Google account</li>
          <li>Calendar events from Google Calendar (read-only access) to display your schedule</li>
          <li>Authentication tokens needed to maintain your session and sync calendar data</li>
          <li>Basic usage data, such as when you access the service and which features you use</li>
        </ul>
      </section>

      <section>
        <h2>How we use your information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Authenticate you and provide access to your account</li>
          <li>Display and organize your calendar events in one place</li>
          <li>Maintain and improve the reliability and performance of Calva</li>
          <li>Respond to support requests and communicate important service updates</li>
        </ul>
      </section>

      <section>
        <h2>How we share information</h2>
        <p>
          We do not sell your personal information. We may share data only with service providers
          that help us operate Calva (such as authentication and hosting providers), when required
          by law, or to protect the rights and safety of our users and the public.
        </p>
      </section>

      <section>
        <h2>Data retention</h2>
        <p>
          We retain your account and calendar connection data for as long as your account is
          active. If you delete your account or disconnect Google Calendar, we delete or anonymize
          associated data within a reasonable period, except where retention is required by law.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          We use industry-standard safeguards to protect your information, including encrypted
          connections and secure token storage. No method of transmission or storage is completely
          secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>You can:</p>
        <ul>
          <li>Sign out of Calva at any time from your account menu</li>
          <li>Revoke Calva&apos;s access to your Google account through your Google security settings</li>
          <li>Contact us to request access to, correction of, or deletion of your personal data</li>
        </ul>
      </section>

      <section>
        <h2>Children&apos;s privacy</h2>
        <p>
          Calva is not intended for children under 13. We do not knowingly collect personal
          information from children under 13.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the revised policy on
          this page and update the &quot;Last updated&quot; date above.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at{' '}
          <a href="mailto:hello@calva.app" className="font-medium text-[#6835D0] hover:underline">
            hello@calva.app
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  )
}
