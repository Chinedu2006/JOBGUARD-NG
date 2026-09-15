import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertTriangle, ArrowDownRight, ArrowRight, BadgeCheck, Check, ClipboardCheck, ExternalLink, Flag, HeartHandshake, Info, Link2, Loader2, Menu, MessageCircle, Search, Shield, ShieldAlert, Upload, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { getGetOpportunitySummaryQueryKey, getHealthCheckQueryKey, getListOpportunitiesQueryKey, useAnalyzeOpportunity, useCreateReport, useGetOpportunitySummary, useHealthCheck, useListOpportunities } from '@workspace/api-client-react';
import type { Analysis, Opportunity } from '@workspace/api-client-react';

const queryClient = new QueryClient();
const categories = ['All', 'Jobs', 'Internships', 'Scholarships', 'Grants', 'Fellowships', 'Recruitment'];
const riskMeta = {
  low: { label: 'LOW RISK', color: '#238b74', bg: '#e2f1eb', icon: BadgeCheck },
  caution: { label: 'PROCEED WITH CAUTION', color: '#b7791f', bg: '#fff0c8', icon: AlertTriangle },
  high: { label: 'HIGH RISK', color: '#d25c40', bg: '#ffe0d7', icon: ShieldAlert },
  'very-high': { label: 'VERY HIGH RISK', color: '#a83d43', bg: '#f7d5d6', icon: ShieldAlert },
};

function Brand({ dark = false }: { dark?: boolean }) {
  return <Link href="/" className={`flex items-center gap-2.5 group ${dark ? 'text-[#f8f1df]' : ''}`} data-testid="link-brand">
    <span className="grid place-items-center h-9 w-9 rounded-[11px] bg-[#ff8063] text-[#143b42] shadow-[3px_3px_0_#143b42] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[1px_1px_0_#143b42]"><Shield size={19} strokeWidth={2.7} /></span>
    <span className="font-serif text-[19px] font-bold tracking-[-.04em]">jobguard<span className="text-[#ff8063]">ng</span></span>
  </Link>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  return <header className="sticky top-0 z-40 border-b border-[#d9d2bf]/70 bg-[#f8f2e4]/90 backdrop-blur-md">
    <div className="mx-auto flex h-[70px] max-w-6xl items-center justify-between px-5 lg:px-8">
      <Brand />
      <nav className="hidden items-center gap-8 md:flex">
        <Link href="/#checker" className={`text-[13px] font-semibold transition-colors hover:text-[#e96349] ${location === '/' ? 'text-[#143b42]' : 'text-[#667a78]'}`} data-testid="link-checker">Check an opportunity</Link>
        <Link href="/opportunities" className={`text-[13px] font-semibold transition-colors hover:text-[#e96349] ${location === '/opportunities' ? 'text-[#143b42]' : 'text-[#667a78]'}`} data-testid="link-directory">Verified directory</Link>
        <Link href="/#how-it-works" className="text-[13px] font-semibold text-[#667a78] transition-colors hover:text-[#e96349]" data-testid="link-how-it-works">How it works</Link>
      </nav>
      <div className="flex items-center gap-3">
        <Link href="/#report" className="hidden rounded-full border border-[#d2c9b5] px-4 py-2 text-[12px] font-bold text-[#345355] transition hover:border-[#ff8063] hover:text-[#dc634b] sm:inline-flex" data-testid="link-report">Report an offer</Link>
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-[#345355] md:hidden" aria-label="Open menu" data-testid="button-open-menu">{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </div>
    {open && <div className="border-t border-[#ded6c5] bg-[#f8f2e4] px-5 pb-4 pt-2 md:hidden"><div className="flex flex-col gap-1">
      <Link onClick={() => setOpen(false)} href="/#checker" className="rounded-lg px-3 py-3 text-sm font-semibold" data-testid="mobile-link-checker">Check an opportunity</Link>
      <Link onClick={() => setOpen(false)} href="/opportunities" className="rounded-lg px-3 py-3 text-sm font-semibold" data-testid="mobile-link-directory">Verified directory</Link>
      <Link onClick={() => setOpen(false)} href="/#how-it-works" className="rounded-lg px-3 py-3 text-sm font-semibold" data-testid="mobile-link-how-it-works">How it works</Link>
    </div></div>}
  </header>;
}

function StatusPill() {
  const { data, isLoading } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60_000 } });
  return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#b6cfca]" data-testid="status-service">
    <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'animate-pulse bg-[#d3a23d]' : data?.status === 'ok' ? 'bg-[#71c7a9]' : 'bg-[#ff8063]'}`} />{isLoading ? 'Checking safety desk' : data?.status === 'ok' ? 'Safety desk online' : 'Safety desk needs a moment'}
  </span>;
}

function HowItWorks() {
  const steps = [
    { n: '01', icon: MessageCircle, title: 'Bring the message', body: 'Paste the text from WhatsApp, email, or a post. A link works too.' },
    { n: '02', icon: Search, title: 'We read the signals', body: 'Jobguard looks for pressure, payment asks, vague details, and missing proof.' },
    { n: '03', icon: HeartHandshake, title: 'You choose calmly', body: 'Get a plain-language risk view and a next step that protects your money and identity.' },
  ];
  return <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
    <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[.18em] text-[#e16850]">No guesswork</p><h2 className="max-w-xl font-serif text-4xl font-bold leading-[1.05] tracking-[-.04em] text-[#143b42] md:text-[52px]">Trust your gut.<br /><span className="text-[#e16850]">Then check it.</span></h2></div><p className="max-w-xs text-sm leading-6 text-[#667a78]">Designed for the moment you pause before replying, paying, or sending your ID.</p></div>
    <div className="grid gap-4 md:grid-cols-3">{steps.map((step, i) => <div key={step.n} className={`animate-rise animate-rise-delay-${i + 1} relative min-h-[255px] overflow-hidden rounded-[22px] border border-[#d9d2bf] bg-[#fdf9ee] p-6 shadow-[0_8px_0_#e4dcc9]`}><div className="flex items-start justify-between"><span className="font-mono text-xs text-[#e16850]">{step.n}</span><step.icon size={23} strokeWidth={1.7} className="text-[#236c6d]" /></div><div className="absolute -bottom-7 -right-4 font-serif text-[125px] font-bold leading-none text-[#f2ebd8]">{i + 1}</div><div className="relative mt-20"><h3 className="font-serif text-[25px] font-bold text-[#143b42]">{step.title}</h3><p className="mt-2 max-w-[240px] text-sm leading-5 text-[#667a78]">{step.body}</p></div></div>)}</div>
  </section>;
}

function Checker({ onResult, scrollToReport }: { onResult: (analysis: Analysis, input: { text: string; url: string }) => void; scrollToReport: () => void }) {
  const [mode, setMode] = useState<'message' | 'link'>('message');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [attachment, setAttachment] = useState('');
  const [inputError, setInputError] = useState('');
  const analyze = useAnalyzeOpportunity();
  const demoMessages = [
    { label: 'WhatsApp job offer', text: 'Congratulations! You have been selected for the Remote Data Entry position at BrightPath Nigeria. To secure your onboarding slot, send N15,000 for your training materials today. Reply with your BVN and a photo of your ID. Limited slots, act now!', url: '' },
    { label: 'Scholarship link', text: 'Apply for the 2025 Global Excellence Scholarship. Successful applicants must pay a processing fee of ₦5,000 to confirm their place. Send your details to our coordinator on WhatsApp.', url: 'https://example.com/scholarship' },
    { label: 'Legitimate-looking offer', text: 'Kora Labs is accepting applications for its Graduate Product Internship. Apply through the careers page with your CV and portfolio. Shortlisted applicants will be contacted for an interview. Deadline: 30 September 2026. Location: Lagos / Hybrid.', url: 'https://koralabs.ng/careers' },
  ];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setInputError('');
    if (!text.trim() && !url.trim()) {
      setInputError('Paste an opportunity first.');
      return;
    }
    if (url.trim()) {
      try {
        const parsedUrl = new URL(url.trim());
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
      } catch {
        setInputError('Please enter a valid link.');
        return;
      }
    }
    analyze.mutate({ data: { text: text.trim(), url: url.trim() || undefined } }, { onSuccess: result => onResult(result, { text, url }) });
  };
  return <section id="checker" className="relative overflow-hidden bg-[#143b42]"><div className="ambient-grid absolute inset-0 opacity-25" /><div className="absolute -right-28 -top-32 h-[480px] w-[480px] rounded-full border-[56px] border-[#ff8063]/10" /><div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8 lg:py-28">
    <div className="animate-rise text-[#f8f2e4]"><div className="mb-5 flex items-center gap-3"><span className="h-px w-9 bg-[#ff8063]" /><span className="font-mono text-[10px] uppercase tracking-[.22em] text-[#8bc5bb]">Your second opinion</span></div><h1 className="max-w-[570px] font-serif text-[52px] font-bold leading-[.96] tracking-[-.055em] md:text-[76px]">Before you<br /><span className="text-[#ff8063]">say yes.</span></h1><p className="mt-7 max-w-md text-[17px] leading-7 text-[#b6cfca]">A fast, clear read on job, scholarship, grant, and internship offers that land in your inbox.</p><div className="mt-9 flex flex-wrap items-center gap-4"><StatusPill /><span className="text-[#628a86]">|</span><span className="text-xs text-[#a6c4bf]">Free to use · No account needed</span></div></div>
    <div className="animate-rise animate-rise-delay-2 relative"><div className="mb-[-1px] ml-5 inline-flex overflow-hidden rounded-t-[13px] border border-b-0 border-[#3e686b] bg-[#214f54]"><button onClick={() => setMode('message')} className={`flex items-center gap-2 px-4 py-3 text-xs font-bold ${mode === 'message' ? 'bg-[#f8f2e4] text-[#143b42]' : 'text-[#b6cfca]'}`} data-testid="button-tab-message"><MessageCircle size={14} /> Paste message</button><button onClick={() => setMode('link')} className={`flex items-center gap-2 px-4 py-3 text-xs font-bold ${mode === 'link' ? 'bg-[#f8f2e4] text-[#143b42]' : 'text-[#b6cfca]'}`} data-testid="button-tab-link"><Link2 size={14} /> Paste link</button></div>
      <form onSubmit={submit} className="rounded-[20px] rounded-tl-none border border-[#d5cdbb] bg-[#f8f2e4] p-5 shadow-[12px_14px_0_rgba(0,0,0,.13)] sm:p-7">
        {mode === 'message' ? <label className="block"><span className="mb-2 block text-xs font-bold text-[#345355]">Check an Opportunity</span><textarea value={text} onChange={e => { setText(e.target.value); setInputError(''); }} placeholder="Paste the opportunity message here…" className="min-h-[175px] w-full resize-none rounded-xl border border-[#d8cfbd] bg-[#fffdf7] p-4 text-sm leading-6 text-[#143b42] outline-none transition focus:border-[#ff8063] focus:ring-4 focus:ring-[#ff8063]/10" data-testid="input-opportunity-message" /></label> : <label className="block"><span className="mb-2 block text-xs font-bold text-[#345355]">Opportunity link</span><input value={url} onChange={e => { setUrl(e.target.value); setInputError(''); }} placeholder="https://…" className="w-full rounded-xl border border-[#d8cfbd] bg-[#fffdf7] p-4 text-sm text-[#143b42] outline-none transition focus:border-[#ff8063] focus:ring-4 focus:ring-[#ff8063]/10" data-testid="input-opportunity-link" /><span className="mt-4 block text-xs leading-5 text-[#71817c]">Add any text you have too — a link alone can only tell us so much.</span><textarea value={text} onChange={e => { setText(e.target.value); setInputError(''); }} placeholder="Optional: paste the caption or message…" className="mt-4 min-h-[105px] w-full resize-none rounded-xl border border-[#d8cfbd] bg-[#fffdf7] p-4 text-sm leading-6 text-[#143b42] outline-none transition focus:border-[#ff8063] focus:ring-4 focus:ring-[#ff8063]/10" data-testid="input-link-context" /></label>}
        <div className="mt-4 flex flex-col gap-3 border-t border-[#e0d8c7] pt-4 sm:flex-row sm:items-center sm:justify-between"><label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#627874] hover:text-[#e16850]"><Upload size={14} /><span>{attachment || 'Can’t copy? Upload a screenshot'}</span><input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) { setAttachment(file.name); setInputError('We couldn’t read the screenshot clearly. Please paste the text manually.'); } }} data-testid="input-screenshot" /></label><button disabled={analyze.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff8063] px-5 py-3 text-sm font-bold text-[#143b42] shadow-[3px_3px_0_#143b42] transition hover:bg-[#ff967c] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-analyze">{analyze.isPending ? <><Loader2 size={16} className="animate-spin" /> Analyzing opportunity</> : <>Analyze Opportunity <ArrowRight size={16} /></>}</button></div>
        <div className="mt-5 flex flex-wrap gap-2"><span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-[#87938d]">Try a Demo Scam</span>{demoMessages.map(demo => <button type="button" key={demo.label} onClick={() => { setText(demo.text); setUrl(demo.url); setInputError(''); setMode(demo.url ? 'link' : 'message'); }} className="rounded-full border border-[#d6cdbb] px-3 py-1.5 text-[11px] font-semibold text-[#61736f] transition hover:border-[#ff8063] hover:text-[#dc634b]" data-testid={`button-demo-${demo.label.toLowerCase().replaceAll(' ', '-')}`}>{demo.label}</button>)}</div>{(inputError || analyze.isError) && <p className="mt-3 text-xs font-semibold text-[#b34e3d]" data-testid="status-analysis-error">{inputError || 'We couldn’t analyze this opportunity. Try pasting the message instead.'}</p>}
      </form><div className="mt-5 flex items-center justify-between px-2 text-[11px] text-[#86aba5]"><span className="flex items-center gap-1.5"><Shield size={13} /> We don’t store your message</span><button onClick={scrollToReport} className="underline decoration-[#70958f] underline-offset-4 hover:text-[#f8f2e4]" data-testid="button-report-from-checker">Report a suspicious offer</button></div>
    </div>
  </div></section>;
}

function ScoreRing({ score, level }: { score: number; level: keyof typeof riskMeta }) {
  const meta = riskMeta[level] ?? riskMeta.caution;
  const Icon = meta.icon;
  const radius = 39; const circumference = 2 * Math.PI * radius; const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  return <div className="flex items-center gap-5"><div className="relative grid h-[112px] w-[112px] place-items-center"><svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r={radius} fill="none" stroke="#e5ddca" strokeWidth="7" /><circle cx="50" cy="50" r={radius} fill="none" stroke={meta.color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="risk-ring" /></svg><div className="text-center"><span className="block font-serif text-[32px] font-bold leading-none text-[#143b42]">{score}</span><span className="font-mono text-[9px] uppercase tracking-wider text-[#71817c]">of 100</span></div></div><div><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: meta.color }}><Icon size={15} /> Risk read</div><h3 className="font-serif text-2xl font-bold leading-none text-[#143b42]">{meta.label}</h3><p className="mt-2 max-w-[180px] text-xs leading-5 text-[#71817c]">{score < 30 ? 'No major warning signs found in this message.' : 'Some things here deserve a closer look before you respond.'}</p></div></div>;
}

function Results({ analysis, onReset, onReport }: { analysis: Analysis; onReset: () => void; onReport: () => void }) {
  const meta = riskMeta[analysis.riskLevel] ?? riskMeta.caution;
  return <section className="border-b border-[#d9d2bf] bg-[#eee7d6] px-5 py-14 lg:px-8" data-testid="section-analysis-results"><div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[.2em] text-[#e16850]">Opportunity Risk Assessment</p><h2 className="font-serif text-4xl font-bold tracking-[-.04em] text-[#143b42]">{meta.label}</h2></div><button onClick={onReset} className="inline-flex items-center gap-2 self-start rounded-full border border-[#cfc5b0] px-4 py-2 text-xs font-bold text-[#345355] hover:border-[#ff8063]" data-testid="button-check-another"><ArrowDownRight size={14} /> Check another</button></div>
    <div className="grid gap-4 lg:grid-cols-[.78fr_1.22fr]"><div className="rounded-[22px] border border-[#d5cbb7] bg-[#fdf9ee] p-6 shadow-[0_8px_0_#dcd2bd]"><ScoreRing score={analysis.riskScore} level={analysis.riskLevel} /><div className="mt-6 rounded-xl p-4" style={{ backgroundColor: meta.bg }}><p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>Recommended action</p><div className="flex gap-2"><Info size={15} style={{ color: meta.color, flexShrink: 0 }} /><p className="text-sm font-semibold leading-5 text-[#345355]">{analysis.recommendation}</p></div></div></div><div className="rounded-[22px] border border-[#d5cbb7] bg-[#fdf9ee] p-6 shadow-[0_8px_0_#dcd2bd]"><div className="mb-5 flex items-center justify-between"><h3 className="font-serif text-[23px] font-bold text-[#143b42]">Why we flagged this</h3><span className="rounded-full bg-[#e8e0ce] px-3 py-1 font-mono text-[10px] text-[#71817c]">{analysis.detectedSignals.length} checks</span></div><div className="space-y-3">{analysis.detectedSignals.map((signal, i) => <div key={`${signal.title}-${i}`} className="flex gap-3 rounded-xl border border-[#e8e0ce] bg-[#fffdf7] p-3.5" data-testid={`signal-${i}`}><span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: signal.severity === 'positive' ? '#238b74' : signal.severity === 'warning' ? '#d3a23d' : '#d25c40' }} /><div><p className="text-sm font-bold text-[#345355]">{signal.title}</p><p className="mt-1 text-xs leading-5 text-[#71817c]">{signal.explanation}</p></div><span className="ml-auto font-mono text-[10px] text-[#9aa49e]">{signal.score > 0 ? `+${signal.score}` : signal.score}</span></div>)}</div></div></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-[1.22fr_.78fr]"><div className="rounded-[22px] border border-[#d5cbb7] bg-[#fdf9ee] p-6"><div className="mb-4 flex items-center gap-2"><ClipboardCheck size={18} className="text-[#236c6d]" /><h3 className="font-serif text-[22px] font-bold text-[#143b42]">What we could extract</h3></div><div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">{Object.entries(analysis.extractedInformation).map(([key, value]) => <div key={key}><p className="font-mono text-[9px] uppercase tracking-wider text-[#8a9992]">{key.replace(/([A-Z])/g, ' $1')}</p><p className="mt-1 truncate text-xs font-semibold text-[#345355]" title={value ?? 'Not found'}>{value || 'Not found'}</p></div>)}</div></div><div className="rounded-[22px] bg-[#236c6d] p-6 text-[#f8f2e4]"><p className="font-mono text-[10px] uppercase tracking-wider text-[#a9d2c7]">Still unsure?</p><h3 className="mt-2 font-serif text-2xl font-bold">A second pair of eyes helps.</h3><p className="mt-2 text-xs leading-5 text-[#c2ded7]">Send us the details. Reports help keep other young Nigerians safer too.</p><button onClick={onReport} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ff8063] px-4 py-2.5 text-xs font-bold text-[#143b42] hover:bg-[#ff967c]" data-testid="button-report-result">Report this offer <Flag size={14} /></button></div></div><p className="mt-5 text-[11px] text-[#7b8983]">This is a safety guide, not a legal or financial verdict. Always verify through an organisation’s official channels.</p>
  </div></section>;
}

function ReportForm() {
  const report = useCreateReport();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ opportunityName: '', organization: '', details: '', url: '', outcome: 'I did not send money or information' });
  const update = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [key]: event.target.value }));
  const submit = (event: FormEvent) => { event.preventDefault(); report.mutate({ data: { ...form, url: form.url || undefined } }, { onSuccess: () => setSent(true) }); };
  if (sent) return <div className="rounded-[22px] border border-[#b8d9cc] bg-[#e2f1eb] p-8 text-center" data-testid="status-report-success"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#238b74] text-[#f8f2e4]"><Check size={25} /></div><h3 className="mt-4 font-serif text-2xl font-bold text-[#143b42]">Thank you for speaking up.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#55706d]">Your report is now with the safety desk. It may help someone else pause before paying.</p><button onClick={() => { setSent(false); setForm({ opportunityName: '', organization: '', details: '', url: '', outcome: 'I did not send money or information' }); }} className="mt-5 text-xs font-bold text-[#236c6d] underline underline-offset-4" data-testid="button-send-another-report">Send another report</button></div>;
  return <form onSubmit={submit} className="rounded-[22px] border border-[#d5cbb7] bg-[#fdf9ee] p-6 shadow-[0_8px_0_#dcd2bd] sm:p-8" data-testid="form-report"><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="field-label">What was the opportunity called?</span><input required value={form.opportunityName} onChange={update('opportunityName')} className="field-input" placeholder="e.g. Remote data entry role" data-testid="input-report-name" /></label><label className="block"><span className="field-label">Organisation name</span><input required value={form.organization} onChange={update('organization')} className="field-input" placeholder="If listed" data-testid="input-report-organization" /></label></div><label className="mt-4 block"><span className="field-label">What happened?</span><textarea required value={form.details} onChange={update('details')} className="field-input min-h-[110px] resize-y" placeholder="Tell us what they asked for and how they contacted you…" data-testid="input-report-details" /></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block"><span className="field-label">Link, if you have one</span><input value={form.url} onChange={update('url')} className="field-input" placeholder="https://…" data-testid="input-report-url" /></label><label className="block"><span className="field-label">Your outcome</span><select value={form.outcome} onChange={update('outcome')} className="field-input" data-testid="select-report-outcome"><option>I did not send money or information</option><option>I sent money</option><option>I shared sensitive information</option><option>I am not sure yet</option></select></label></div><button disabled={report.isPending} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#143b42] px-5 py-3 text-sm font-bold text-[#f8f2e4] transition hover:bg-[#236c6d] disabled:opacity-60" data-testid="button-submit-report">{report.isPending ? <Loader2 size={16} className="animate-spin" /> : <Flag size={15} />} {report.isPending ? 'Sending to the safety desk' : 'Send report privately'}</button>{report.isError && <p className="mt-3 text-xs font-semibold text-[#b34e3d]" data-testid="status-report-error">We couldn’t send that. Please try again.</p>}</form>;
}

function HomePage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const scrollToReport = () => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' });
  return <div className="grain min-h-[100dvh] bg-[#f8f2e4]"><Header /><main><Checker onResult={result => { setAnalysis(result); setTimeout(() => document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); }} scrollToReport={scrollToReport} />{analysis && <div id="analysis-results"><Results analysis={analysis} onReset={() => { setAnalysis(null); document.getElementById('checker')?.scrollIntoView({ behavior: 'smooth' }); }} onReport={scrollToReport} /></div>}<HowItWorks /><section id="report" className="border-t border-[#d9d2bf] bg-[#e7f0e9] px-5 py-20 lg:px-8"><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-start"><div><p className="mb-3 font-mono text-[11px] uppercase tracking-[.18em] text-[#e16850]">Help us protect the next person</p><h2 className="font-serif text-4xl font-bold leading-[1.04] tracking-[-.04em] text-[#143b42] md:text-[50px]">Report a Suspicious<br /><span className="text-[#e16850]">Opportunity</span></h2><p className="mt-5 max-w-sm text-sm leading-6 text-[#55706d]">Share what you know without sharing your name. Reports make our checks sharper and help others recognise the pattern.</p><div className="mt-8 flex items-center gap-3 text-xs font-semibold text-[#55706d]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#c7e1d6]"><Shield size={15} /></span>Your details stay private.</div></div><ReportForm /></div></section></main><footer className="bg-[#143b42] px-5 py-8 text-[#b6cfca] lg:px-8"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 sm:flex-row sm:items-center"><Brand dark /><p className="max-w-sm text-xs leading-5">JOBGUARD is an educational risk-assessment tool. A low-risk result does not guarantee that an opportunity is legitimate. Always verify important opportunities through the organisation’s official website or known official channels.</p><span className="font-mono text-[10px] uppercase tracking-wider text-[#729590]">© {new Date().getFullYear()} Jobguard NG</span></div></footer></div>;
}

function DirectoryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const params = useMemo(() => ({ ...(search ? { search } : {}), ...(category !== 'All' ? { category } : {}) }), [search, category]);
  const list = useListOpportunities(params, { query: { queryKey: getListOpportunitiesQueryKey(params), placeholderData: previous => previous } });
  const summary = useGetOpportunitySummary({ query: { queryKey: getGetOpportunitySummaryQueryKey(), staleTime: 60_000 } });
  const items = list.data ?? [];
  return <div className="grain min-h-[100dvh] bg-[#f8f2e4]"><Header /><main className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[.18em] text-[#e16850]">Verified Opportunities</p><h1 className="max-w-2xl font-serif text-5xl font-bold leading-[.97] tracking-[-.05em] text-[#143b42] md:text-7xl">Opportunities<br /><span className="text-[#e16850]">worth opening.</span></h1><p className="mt-5 max-w-lg text-sm leading-6 text-[#667a78]">A starting point for your search — with opportunities we can point to, not just promises forwarded around.</p></div><div className="flex gap-3"><div className="rounded-2xl border border-[#d9d2bf] bg-[#fdf9ee] px-4 py-3"><p className="font-mono text-[10px] text-[#8a9992]">LISTED</p><p className="mt-1 font-serif text-2xl font-bold text-[#143b42]" data-testid="text-opportunity-total">{summary.data?.total ?? '—'}</p></div><div className="rounded-2xl border border-[#d9d2bf] bg-[#e2f1eb] px-4 py-3"><p className="font-mono text-[10px] text-[#55706d]">CATEGORIES</p><p className="mt-1 font-serif text-2xl font-bold text-[#236c6d]">{summary.data ? Object.keys(summary.data.categories).length : '—'}</p></div></div></div><div className="mt-12 flex flex-col gap-3 rounded-2xl border border-[#d9d2bf] bg-[#eee7d6] p-3 md:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#82918b]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by role, organisation, or place" className="h-12 w-full rounded-xl border border-[#d8cfbd] bg-[#fffdf7] pl-11 pr-4 text-sm text-[#143b42] outline-none focus:border-[#ff8063]" data-testid="input-directory-search" /></label><div className="safe-scrollbar flex gap-2 overflow-x-auto pb-1 md:pb-0">{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${category === item ? 'bg-[#143b42] text-[#f8f2e4]' : 'bg-[#fdf9ee] text-[#667a78] hover:bg-[#ffdfd5]'}`} data-testid={`button-filter-${item.toLowerCase()}`}>{item}</button>)}</div></div>{list.isLoading ? <div className="mt-8 grid gap-4 md:grid-cols-2"><div className="skeleton-card" /><div className="skeleton-card" /><div className="skeleton-card" /></div> : list.isError ? <div className="mt-8 rounded-2xl border border-[#e4b5a8] bg-[#ffe8e0] p-8 text-center"><AlertTriangle className="mx-auto text-[#d25c40]" /><p className="mt-3 text-sm font-semibold text-[#8e4438]" data-testid="status-directory-error">The directory is taking a moment.</p><button onClick={() => list.refetch()} className="mt-4 rounded-full bg-[#d25c40] px-4 py-2 text-xs font-bold text-[#fff7ef]" data-testid="button-retry-directory">Try again</button></div> : items.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#cfc5b0] p-12 text-center"><Search className="mx-auto text-[#82918b]" /><p className="mt-3 font-serif text-2xl font-bold text-[#143b42]">Nothing matches yet.</p><p className="mt-2 text-sm text-[#71817c]">Try a broader search or switch the category.</p></div> : <div className="mt-8 grid gap-4 md:grid-cols-2">{items.map((opportunity: Opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}</div>}</main></div>;
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return <article className="interactive group flex min-h-[255px] flex-col justify-between rounded-[22px] border border-[#d9d2bf] bg-[#fdf9ee] p-6 shadow-[0_7px_0_#e4dcc9]" data-testid={`card-opportunity-${opportunity.id}`}><div><div className="flex items-start justify-between gap-4"><span className="rounded-full bg-[#e2f1eb] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#236c6d]">{opportunity.category}</span>{opportunity.demo ? <span className="rounded-full bg-[#fff0c8] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#a87722]">Demo listing</span> : <BadgeCheck size={19} className="text-[#238b74]" />}</div><h2 className="mt-5 font-serif text-[25px] font-bold leading-tight tracking-[-.025em] text-[#143b42]">{opportunity.title}</h2><p className="mt-2 text-xs font-semibold text-[#55706d]">{opportunity.organization}</p><p className="mt-3 line-clamp-2 text-sm leading-5 text-[#71817c]">{opportunity.description}</p></div><div className="mt-6 flex items-end justify-between border-t border-[#e8e0ce] pt-4"><div><p className="text-[11px] text-[#71817c]">{opportunity.location || 'Nigeria'} · <span className="font-semibold">{opportunity.deadline ? `Closes ${opportunity.deadline}` : 'Rolling'}</span></p><span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-[#9aa49e]">{opportunity.sourceStatus}</span></div><a href={opportunity.url} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-[#143b42] text-[#f8f2e4] transition group-hover:bg-[#ff8063] group-hover:text-[#143b42]" data-testid={`link-opportunity-${opportunity.id}`} aria-label={`Open ${opportunity.title}`}><ExternalLink size={15} /></a></div></article>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={HomePage} /><Route path="/opportunities" component={DirectoryPage} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;