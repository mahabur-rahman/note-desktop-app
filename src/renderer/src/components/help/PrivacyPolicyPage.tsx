import { HelpPageLayout } from './HelpPageLayout'

export function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <HelpPageLayout heading="Privacy Policy">
      <h2 className="mb-5 text-4xl font-semibold">Privacy Policy</h2>

      <h3 className="mb-2 text-xl font-semibold">Consent</h3>
      <p className="mb-4 text-sm leading-6">
        By using our website, you hereby consent to our Privacy Policy and agree to its terms.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Information we collect</h3>
      <p className="mb-4 text-sm leading-6">
        When you use Online Notepad, we may collect limited technical information such as browser type, device details,
        and standard diagnostic logs to maintain performance and reliability.
      </p>

      <h3 className="mb-2 text-xl font-semibold">How we use your information</h3>
      <p className="mb-4 text-sm leading-6">
        We use collected information to operate the service, improve editor performance, maintain security, and prevent
        abuse.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Log Files</h3>
      <p className="mb-4 text-sm leading-6">
        Online Notepad follows a standard procedure of using log files. These files may include IP address, browser
        type, ISP, date and time stamp, and referring/exit pages.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Cookies and Web Beacons</h3>
      <p className="mb-4 text-sm leading-6">
        Like many websites, Online Notepad uses cookies to store visitor preferences and optimize user experience.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Third Party Privacy Policies</h3>
      <p className="mb-4 text-sm leading-6">
        Our Privacy Policy does not apply to other advertisers or websites. Please consult respective third-party
        privacy policies for more detailed information.
      </p>

      <h3 className="mb-2 text-xl font-semibold">GDPR Data Protection Rights</h3>
      <p className="mb-4 text-sm leading-6">
        You are entitled to access, rectify, erase, and restrict processing of personal data where applicable by law.
      </p>

      <h3 className="mb-2 text-xl font-semibold">Contact Us</h3>
      <p className="mb-4 text-sm leading-6">
        If you have questions about this Privacy Policy, you can contact us at: onlinenotepad.org@gmail.com
      </p>
    </HelpPageLayout>
  )
}
