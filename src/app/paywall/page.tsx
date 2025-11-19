import Link from 'next/link';
import { CheckoutButton } from './checkout-button';

const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? 'price_monthly_placeholder';
const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL ?? 'price_annual_placeholder';

const perks = [
  'Offline-friendly reading with soft typography and generous spacing.',
  'Unlimited saved hadith, notes, and guided reflections.',
  'Priority access to verified Arabic and English sources.',
  'Ask follow-up questions in context without ads or clutter.',
];

const assurance = [
  'Cancel anytime. Your bookmarks stay safe.',
  'Receipts and invoices via email for easy reimbursements.',
  'Honors promo codes and student pricing when available.',
];

export default function PaywallPage() {
  return (
    <main className="flex flex-col gap-10 py-8 md:py-14">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-8 shadow-xl ring-1 ring-white/10 md:p-12">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-5 md:items-center md:gap-10">
          <div className="md:col-span-3 space-y-4 text-white">
            <p className="text-sm font-semibold text-white/70">Calm, Apple-inspired simplicity</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Keep learning with Authentic Hadith Premium.
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              A focused experience with no distractions. Subscribe to unlock synced devices, serene reader themes, and
              a human-like assistant that keeps you grounded in authentic sources.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:w-52">
                <CheckoutButton priceId={monthlyPriceId} label="Start 7-day free trial" />
              </div>
              <div className="w-full sm:w-52">
                <CheckoutButton priceId={annualPriceId} label="Go yearly & save 15%" />
              </div>
              <Link href="/auth" className="text-sm font-medium text-white/80 hover:text-white">
                Already a member?
              </Link>
            </div>
            <p className="text-sm text-white/60">
              Works on web & mobile. We use Stripe for secure checkout with Apple Pay, Google Pay, and cards.
            </p>
          </div>
          <div className="md:col-span-2 flex flex-col gap-4 rounded-2xl bg-white/5 p-6 text-white ring-1 ring-white/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white/80">What you unlock</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">Calm mode</span>
            </div>
            <ul className="space-y-3 text-sm text-white/80">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-white" aria-hidden />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl bg-white/5 p-4 text-sm text-white/80 ring-1 ring-white/10">
              <p className="font-semibold text-white">For teams & chaplaincy</p>
              <p className="mt-2">
                Need multiple seats or offline PDFs? Email support@authentichadith.app and we will craft a Stripe invoice
                that matches your workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
          <p className="text-sm font-semibold text-neutral-500">Monthly</p>
          <h3 className="mt-2 text-3xl font-semibold text-neutral-900">$5.99</h3>
          <p className="text-sm text-neutral-500">per month, billed securely through Stripe</p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-700">
            <li>• Perfect for exploring the assistant and reader tools.</li>
            <li>• One-tap checkout with Apple Pay and Google Pay.</li>
            <li>• Cancel anytime from your profile.</li>
          </ul>
          <div className="mt-6">
            <CheckoutButton priceId={monthlyPriceId} label="Start monthly" />
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-900 p-6 text-white shadow-lg ring-1 ring-neutral-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white/70">Annual</p>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Best value</span>
          </div>
          <h3 className="mt-2 text-3xl font-semibold">$59</h3>
          <p className="text-sm text-white/70">one calm payment for the year</p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>• Two months free compared to monthly.</li>
            <li>• Priority support for community programs.</li>
            <li>• Perfect for iOS & Android web clips.</li>
          </ul>
          <div className="mt-6">
            <CheckoutButton priceId={annualPriceId} label="Upgrade yearly" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-600">Mobile ready</p>
            <h3 className="text-xl font-semibold text-neutral-900">Use the same checkout from iOS, Android, or desktop</h3>
            <p className="text-sm text-neutral-600">
              POST to <code className="rounded bg-neutral-50 px-2 py-1 text-xs text-neutral-800">/api/checkout</code> with
              a Stripe price id to create a session from your mobile app. We return a hosted Stripe URL you can open in a
              webview or the system browser.
            </p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4 text-xs text-neutral-700 ring-1 ring-neutral-200">
            <p className="font-semibold text-neutral-900">Example payload</p>
            <pre className="mt-2 whitespace-pre-wrap">{`
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: '${monthlyPriceId}' })
});
`}</pre>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl bg-neutral-900 p-6 text-white shadow-lg ring-1 ring-neutral-800 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          <p className="text-sm font-semibold text-white/70">Safe by design</p>
          <h3 className="text-2xl font-semibold">Stripe handles the payment. We handle the tranquility.</h3>
          <p className="text-sm text-white/80">
            We never store card numbers. Stripe encrypts every payment and supports Apple Pay, Google Pay, and major
            cards. You can update or cancel from any device.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-white/80">
            {assurance.map((item) => (
              <span key={item} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 p-4 text-sm text-white/80 ring-1 ring-white/10">
          <p className="font-semibold text-white">Questions?</p>
          <p className="mt-2">Email support@authentichadith.app or message us inside the app. We reply quickly.</p>
        </div>
      </section>
    </main>
  );
}
