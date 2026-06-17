import { Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
            <Scale className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black uppercase tracking-tight">Terms of Service</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last updated: June 2026</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">1. Acceptance of Terms</h2>
          <p className="text-sm text-slate-300 leading-relaxed">By accessing or using StudyFlow, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">2. Description of Service</h2>
          <p className="text-sm text-slate-300 leading-relaxed">StudyFlow is a study management and focus tool that provides task management, subject tracking, Pomodoro timer, gamification, and ambient sound features. The service is available as a web application with optional premium subscription features.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">3. Account Registration</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>You must provide a valid email address and create a password to register. You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">4. Acceptable Use</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to bypass authentication, payment gates, or security measures</li>
              <li>Interfere with the service's operation or infrastructure</li>
              <li>Scrape, data-mine, or extract data without authorization</li>
              <li>Create multiple accounts to circumvent free tier limitations or bans</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">5. Premium Subscriptions</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>Premium features require an active paid subscription. Subscription terms:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Billing is handled by Polar, our payment processor</li>
              <li>Subscriptions auto-renew unless cancelled before the period end</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>Refunds are handled per Polar's refund policy</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">6. Data Ownership</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>You retain all ownership of your study data (tasks, subjects, stats). We claim no intellectual property rights over your content. You may export or delete your data at any time via Settings.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">7. Service Availability</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>We strive for high availability but do not guarantee uninterrupted service. The service is provided "as is" without warranties of any kind. We are not liable for data loss — you are encouraged to use the data export feature regularly.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">8. Limitation of Liability</h2>
          <p className="text-sm text-slate-300 leading-relaxed">StudyFlow and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service. In no event shall our total liability exceed the amount you have paid us in the past 12 months.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">9. Termination</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>You may terminate your account at any time via Settings (Delete Account). We may suspend or terminate access for violations of these terms. Upon termination, your data will be permanently deleted.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">10. Changes to Terms</h2>
          <p className="text-sm text-slate-300 leading-relaxed">We may modify these terms at any time. Material changes will be notified via the app or email. Continued use after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">11. Contact</h2>
          <p className="text-sm text-slate-300 leading-relaxed">For questions about these terms, contact <span className="text-indigo-400">support@studyflow.space</span>.</p>
        </section>
      </div>
    </div>
  );
}