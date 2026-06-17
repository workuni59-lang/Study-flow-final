import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black uppercase tracking-tight">Privacy Policy</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last updated: June 2026</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">1. Information We Collect</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p><strong className="text-white">Account Information:</strong> When you create an account, we collect your email address, display name, and a password (stored securely via Supabase Auth).</p>
            <p><strong className="text-white">Profile Information:</strong> You may optionally provide a bio and avatar URL.</p>
            <p><strong className="text-white">Study Data:</strong> We store your study subjects, topics, tasks, focus session history, XP, level, streak data, and gamification state to provide the core service.</p>
            <p><strong className="text-white">Payment Data:</strong> We do not store credit card information. All payments are processed by Polar (our payment provider). We store only your subscription status and customer reference ID.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">2. How We Use Your Data</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>We use your data solely to provide and improve the StudyFlow service:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To authenticate you and maintain your session</li>
              <li>To persist your study subjects, tasks, and progress</li>
              <li>To calculate gamification stats (XP, streaks, badges)</li>
              <li>To process premium subscriptions via Polar</li>
              <li>To send verification emails via Resend (for email confirmation)</li>
              <li>To display leaderboard rankings (display name and focus minutes only)</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">3. Data Storage & Security</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p><strong className="text-white">Primary Storage:</strong> Your data is stored in Supabase (PostgreSQL), hosted on AWS. Data is encrypted at rest and in transit.</p>
            <p><strong className="text-white">Local Storage:</strong> We also cache data in your browser's localStorage for offline access and performance. This data is a mirror of your cloud data.</p>
            <p><strong className="text-white">Authentication:</strong> Supabase Auth handles password hashing and session management using industry-standard practices.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">4. Third-Party Services</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p><strong className="text-white">Supabase:</strong> Database, authentication, and storage provider.</p>
            <p><strong className="text-white">Polar:</strong> Payment processing for premium subscriptions. We share your user ID and email with Polar solely for billing purposes.</p>
            <p><strong className="text-white">Resend:</strong> Email delivery for verification codes. We share your email address only for sending the verification email.</p>
            <p><strong className="text-white">Google OAuth:</strong> Optional login via Google. We receive your email and profile name only after your explicit consent.</p>
            <p><strong className="text-white">Cloudflare:</strong> Our API worker is hosted on Cloudflare Workers for global edge deployment.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">5. Data Retention</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>We retain your data for as long as your account is active. If you delete your account, all associated data is permanently deleted within 30 days. Session history older than 90 days is automatically pruned.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">6. Your Rights (GDPR)</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>If you are in the EU/EEA, you have the following rights:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">Access:</strong> Request a copy of your data via the Export feature in Settings</li>
              <li><strong className="text-white">Rectification:</strong> Update your profile information at any time in Settings</li>
              <li><strong className="text-white">Deletion:</strong> Delete your account via the Settings page (Dangerous Area)</li>
              <li><strong className="text-white">Portability:</strong> Export your data in JSON or CSV format from Settings</li>
              <li><strong className="text-white">Objection:</strong> You may object to data processing by deleting your account</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">7. Cookies</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>We use only essential cookies for authentication (Supabase session tokens) and localStorage for app state. No tracking cookies, analytics cookies, or third-party marketing cookies are used.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">8. Changes to This Policy</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>We may update this privacy policy from time to time. Material changes will be notified via the app or email. Continued use after changes constitutes acceptance of the updated policy.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-display font-black uppercase tracking-tight text-indigo-400">9. Contact</h2>
          <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
            <p>For privacy-related inquiries, please contact us at <span className="text-indigo-400">workuni59@gmail.com</span>.</p>
          </div>
        </section>
      </div>
    </div>
  );
}