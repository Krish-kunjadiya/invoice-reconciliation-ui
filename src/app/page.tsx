import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-slate-50/50 to-white selection:bg-blue-200 selection:text-blue-900 text-slate-900 font-sans antialiased">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <Dashboard />
    </div>
  );
}
