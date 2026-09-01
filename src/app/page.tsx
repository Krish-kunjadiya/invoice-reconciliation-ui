import Link from 'next/link';
import {
  UploadCloud,
  Sparkles,
  SlidersHorizontal,
  FileSpreadsheet,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Repeat,
  FileOutput,
} from 'lucide-react';

const FEATURES = [
  {
    icon: UploadCloud,
    title: 'Drop in your PDFs',
    description: 'Drag and drop as many invoice PDFs as you need — no manual data entry, no re-typing line items.',
  },
  {
    icon: Sparkles,
    title: 'AI extracts every line',
    description: 'Every material, quantity, rate and GST line is pulled out and compared against your own system records.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Your threshold, your rules',
    description: 'Set the tolerance for what counts as a match — anything outside it is flagged Unmatched, instantly.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Export when you’re done',
    description: 'Download the full reconciliation — PDF vs AI vs Difference, GST and all — as a ready-to-share XLSX file.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Upload your invoices',
    description: 'Drag in a batch of PDF invoices, or click to browse. No account, no setup.',
  },
  {
    number: '2',
    title: 'AI reconciles automatically',
    description: 'Your workflow extracts every line, compares it to your system data, and applies your threshold.',
  },
  {
    number: '3',
    title: 'Review, drill in, export',
    description: 'Filter to what needs attention, open any line for the full breakdown, then export the results.',
  },
];

const BENEFITS = [
  {
    icon: Repeat,
    title: 'No manual re-typing',
    description: 'Upload the PDF, get every line extracted — nothing to copy into a spreadsheet by hand.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Consistent matching',
    description: 'The same threshold applies to every line, every time — no missed rounding errors from a rushed review.',
  },
  {
    icon: FileOutput,
    title: 'One export, fully broken out',
    description: 'PDF vs AI vs Difference, side by side, ready to share the moment processing finishes.',
  },
];

const FAQS = [
  {
    q: 'What happens to my PDF files?',
    a: 'Your PDFs are sent straight to your configured processing workflow for extraction. This app doesn’t store them anywhere else.',
  },
  {
    q: 'How does a line get marked Matched or Unmatched?',
    a: 'Your workflow compares the AI-extracted value against the PDF value; anything within your configured threshold is Matched, anything outside it is flagged Unmatched.',
  },
  {
    q: 'Can I export the results?',
    a: 'Yes. Every processed batch can be downloaded as a formatted XLSX file, with PDF, AI, and Difference values broken out side by side.',
  },
  {
    q: 'Does this replace my accounting system?',
    a: 'No — it’s a front door for reconciling PDF invoices against whatever system data your own workflow already has. You still own that data.',
  },
];

function Logo({ dark }: { dark?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-semibold tracking-tight ${dark ? 'text-white' : ''}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
        <FileText className="h-4 w-4" />
      </span>
      Invoice Reconciliation
    </Link>
  );
}

function CtaButton({ variant = 'dark', className = '' }: { variant?: 'dark' | 'light' | 'brand'; className?: string }) {
  const styles = {
    dark: 'bg-primary text-primary-foreground hover:bg-primary/80',
    light: 'bg-white text-black hover:bg-white/90',
    brand: 'bg-brand-600 text-white hover:bg-brand-700',
  } as const;
  return (
    <Link
      href="/upload"
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${styles[variant]} ${className}`}
    >
      <UploadCloud className="h-4 w-4" />
      Upload Invoices
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased scroll-smooth">
      {/* Nav */}
      <div className="bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo dark />
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
          >
            Upload Invoices <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Hero — bold color block */}
      <section className="bg-brand-600 text-white">
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            PDF &rarr; Excel &middot; AI line matching &middot; Your own threshold
          </span>

          <h1 className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Reconcile invoices
            <br />
            in minutes, not hours.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
            Upload your PDF invoices, let AI pull out every line item, and see instantly what matches
            your system records — and what doesn&apos;t.
          </p>

          <div className="mt-8 flex justify-center">
            <CtaButton variant="light" />
          </div>
          <p className="mt-4 text-xs text-white/60">No sign-up needed — just upload and go.</p>
        </div>

        {/* Product mockup, sitting on the color block */}
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <div className="rounded-2xl border border-black/10 bg-white text-left text-black shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b bg-black/[0.03] px-5 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Agent Online
              </span>
            </div>
            <div className="p-5 space-y-2">
              <p className="text-xs font-medium text-black/50 mb-2">Example &middot; Detailed Line Items</p>
              {[
                { inv: 'TINV01144', mat: 'CPVC RED. TEE 1/2" X 1 1/2"', pdf: '₹2,295.00', ai: '₹2,295.00', status: 'matched' },
                { inv: 'TINV01144', mat: 'PVC END CAP 40MM X 6KG', pdf: '₹2,04,700.00', ai: '₹2,04,690.10', status: 'matched' },
                { inv: 'OPF-2026-0691', mat: 'SELFIT PVC NAHANI TRAP', pdf: '₹74,948.00', ai: '₹74,884.36', status: 'unmatched' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-black/[0.03] transition-colors">
                  <div className="min-w-0">
                    <div className="font-medium">{row.inv}</div>
                    <div className="truncate text-xs text-black/50 max-w-[220px]">{row.mat}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs">
                    <span className="rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700">{row.pdf}</span>
                    <span className="rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-700">{row.ai}</span>
                  </div>
                  {row.status === 'matched' ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Matched
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                      Unmatched
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {['No sign-up needed', 'Runs on your own workflow', 'XLSX export', 'Cancel anytime'].map((d) => (
              <span key={d} className="rounded-full bg-white/15 px-3 py-1.5 text-xs text-white">{d}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Match every line — mosaic */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Match every line,<br />every invoice
          </h2>
          <p className="mt-4 text-muted-foreground">
            From the PDF you received to the record already in your system — checked automatically.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaButton variant="brand" />
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-sm md:rotate-[-1.5deg]">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Example batch</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-8 border-emerald-500/20">
                <span className="absolute inset-0 rounded-full border-8 border-emerald-500" style={{ clipPath: 'inset(0 0 0 50%)' }} />
                <span className="text-sm font-bold">22/26</span>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-emerald-600">22 Matched</p>
                <p className="text-muted-foreground">4 need review</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm md:translate-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Line-item breakdown</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Item</span>
                <div className="flex gap-2">
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">PDF</span>
                  <span className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700">AI</span>
                </div>
              </div>
              {[
                { item: 'Brass Elbow', pdf: '1,88,520.00', ai: '1,88,520.00' },
                { item: 'PVC Elbow', pdf: '14,796.00', ai: '14,790.40' },
              ].map((row) => (
                <div key={row.item} className="flex items-center justify-between border-t pt-2 text-xs">
                  <span className="truncate max-w-[80px] font-medium">{row.item}</span>
                  <div className="flex gap-2">
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700">&#8377;{row.pdf}</span>
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700">&#8377;{row.ai}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm md:rotate-[1.5deg]">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</p>
            <div className="mt-4 space-y-2">
              <span className="flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Matched
              </span>
              <span className="flex w-fit items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                Unmatched
              </span>
              <p className="pt-2 text-xs text-muted-foreground">Filter to either in one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Black feature section */}
      <section className="bg-black text-white py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
              How it delivers accurate matches
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-white/60">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <CtaButton variant="light" />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Your 3-step path<br />to a clean batch
          </h2>

          <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative text-left">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+2.5rem)] right-[-2.5rem] h-px bg-border" />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Callout card */}
        <div className="mx-auto mt-20 max-w-2xl px-6">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-center text-white shadow-xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" /> Try it yourself
            </p>
            <h3 className="mt-4 text-2xl font-black uppercase tracking-tight">See it reconcile live</h3>
            <p className="mt-2 text-sm text-white/75">
              No demo booking, no sales call — upload a real PDF and watch it get matched.
            </p>
            <div className="mt-6 flex justify-center">
              <CtaButton variant="light" />
            </div>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="border-t bg-muted/10 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Why it changes the routine</h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 text-left shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <CtaButton variant="brand" />
          </div>
        </div>
      </section>

      {/* FAQ — chat style */}
      <section id="faq" className="bg-black py-24 text-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Questions worth asking
          </h2>

          <div className="mt-14 space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="space-y-2">
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-white/10 px-4 py-2.5 text-sm">
                  {faq.q}
                </div>
                <div className="mr-auto w-fit max-w-[85%] rounded-2xl rounded-tl-sm bg-brand-600 px-4 py-2.5 text-sm">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-600 text-white">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            Stop checking invoices line by line
          </h2>
          <p className="mt-4 text-white/80">
            Upload a batch and see exactly what matches — and what doesn&apos;t.
          </p>
          <div className="mt-8 flex justify-center">
            <CtaButton variant="light" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-white/10 pb-8 text-sm text-white/60 sm:flex-row">
            <Logo dark />
            <div className="flex items-center gap-6">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <p className="pt-8 text-center text-4xl font-black uppercase tracking-tight sm:text-6xl md:text-7xl">
            Invoice Reconciliation
          </p>
          <p className="mt-4 text-center text-xs text-white/40">
            &copy; {new Date().getFullYear()} Invoice Reconciliation
          </p>
        </div>
      </footer>
    </div>
  );
}
