export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-16 font-mono text-pm-muted">
            <h1 className="text-2xl font-semibold text-pm-text mb-8">
                Privacy Policy
            </h1>

            <div className="space-y-6 text-sm leading-relaxed">
                <p>
                    PM Research collects minimal data necessary to operate the
                    platform.
                </p>

                <h2 className="text-pm-text font-medium pt-2">What We Collect</h2>
                <p>
                    Account information (email, auth tokens) provided at
                    sign-up. Basic usage analytics (pages visited, feature
                    usage). No payment data is stored directly&mdash;payment
                    processing is handled by third-party providers.
                </p>

                <h2 className="text-pm-text font-medium pt-2">How We Use It</h2>
                <p>
                    To authenticate and manage your account. To improve the
                    platform and fix issues. We do not sell your data to third
                    parties.
                </p>

                <h2 className="text-pm-text font-medium pt-2">Third-Party Services</h2>
                <p>
                    We use Supabase for authentication and data storage, and
                    third-party APIs for market data. These services have their
                    own privacy policies.
                </p>

                <h2 className="text-pm-text font-medium pt-2">Cookies</h2>
                <p>
                    We use essential cookies for authentication and session
                    management. No advertising or tracking cookies.
                </p>

                <h2 className="text-pm-text font-medium pt-2">Your Rights</h2>
                <p>
                    You can request deletion of your account and associated data
                    at any time by contacting us.
                </p>

                <h2 className="text-pm-text font-medium pt-2">Changes</h2>
                <p>
                    We may update this policy as needed. Continued use after
                    changes constitutes acceptance.
                </p>
            </div>
        </div>
    );
}
