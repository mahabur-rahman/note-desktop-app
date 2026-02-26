import { HelpPageLayout } from './HelpPageLayout'

export function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <HelpPageLayout heading="Privacy Policy">
      <section className="rounded-xl border border-[#cfd9eb] bg-white p-5 shadow-[0_16px_30px_rgba(24,39,68,0.08)] md:p-7">
        <h2 className="text-3xl font-semibold text-[#22395c]">Privacy Policy</h2>
        <p className="mt-4 text-sm leading-7 text-[#4b6182]">
          This policy explains how NoteNova Studio handles technical data when you use our
          note-taking services.
        </p>

        <div className="mt-6 space-y-5">
          <article>
            <h3 className="text-lg font-semibold text-[#2a4062]">Consent</h3>
            <p className="mt-2 text-sm leading-7 text-[#4e6283]">
              By using this website, you consent to this Privacy Policy and agree to its terms.
            </p>
          </article>

          <article>
            <h3 className="text-lg font-semibold text-[#2a4062]">Information we collect</h3>
            <p className="mt-2 text-sm leading-7 text-[#4e6283]">
              We may collect limited technical information such as browser type, device metadata,
              and diagnostics to maintain reliability and improve performance.
            </p>
          </article>

          <article>
            <h3 className="text-lg font-semibold text-[#2a4062]">How we use your information</h3>
            <p className="mt-2 text-sm leading-7 text-[#4e6283]">
              Data is used to operate the service, secure the platform, resolve errors, and improve
              product quality.
            </p>
          </article>

          <article>
            <h3 className="text-lg font-semibold text-[#2a4062]">Log files</h3>
            <p className="mt-2 text-sm leading-7 text-[#4e6283]">
              Like most online services, NoteNova Studio may store standard server logs including IP
              address, timestamp, and referring pages.
            </p>
          </article>

          <article>
            <h3 className="text-lg font-semibold text-[#2a4062]">Cookies</h3>
            <p className="mt-2 text-sm leading-7 text-[#4e6283]">
              Cookies may be used to preserve preferences and improve user experience.
            </p>
          </article>

          <article>
            <h3 className="text-lg font-semibold text-[#2a4062]">Third-party policies</h3>
            <p className="mt-2 text-sm leading-7 text-[#4e6283]">
              This policy does not cover external websites or third-party advertisers. Please review
              each provider&apos;s privacy policy directly.
            </p>
          </article>

          <article>
            <h3 className="text-lg font-semibold text-[#2a4062]">GDPR rights</h3>
            <p className="mt-2 text-sm leading-7 text-[#4e6283]">
              Where applicable, users can request access, correction, deletion, or restriction of
              personal data according to GDPR regulations.
            </p>
          </article>
        </div>
      </section>
    </HelpPageLayout>
  )
}
