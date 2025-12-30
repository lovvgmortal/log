
import React, { useState } from 'react';
import { PenIcon, UserIcon, ArrowRightIcon, SpinnerIcon, CheckIcon, SparklesIcon, DnaIcon, LayoutIcon } from '../Icons';

type RoutePath = '/home' | '/home/dashboard' | '/home/creating' | '/home/notes' | '/home/pricing';

interface LandingViewProps {
  onNavigate: (path: RoutePath) => void;
  onAuth: (email: string, pass: string, isSignUp: boolean) => Promise<void>;
  authLoading: boolean;
}

// Navbar simplified
export const LandingNavbar = ({ onNavigate }: { onNavigate: (path: RoutePath) => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-black/70 border-b border-white/5 transition-all">
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('/home')}>
      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform">
        <PenIcon className="w-5 h-5 text-black" />
      </div>
      <span className="text-xl font-black text-white tracking-tighter">LOG</span>
    </div>
    <div className="hidden md:flex items-center gap-6 text-sm">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="text-zinc-400 hover:text-white transition-colors font-medium"
      >
        Sign In
      </button>
      <a href="#how-it-works" className="text-zinc-400 hover:text-white transition-colors">How It Works</a>
      <a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a>
      <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a>
      <a href="#faq" className="text-zinc-400 hover:text-white transition-colors">FAQ</a>
    </div>
  </nav>
);

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onAuth, authLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onAuth(email, password, isSignUp);
    }
  };

  return (
    <div className="relative text-center px-4 overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex flex-col justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
            🚀 AI-Powered Script Optimization
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            The Logic of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Virality</span>
          </h1>

          <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Stop guessing. Start engineering. LOG analyzes successful content DNA to rewrite your scripts for <span className="text-white font-semibold">maximum retention</span>.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-12 py-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <div>
              <div className="text-3xl font-bold text-white">10x</div>
              <div className="text-sm text-zinc-500">Faster Writing</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">85%</div>
              <div className="text-sm text-zinc-500">Avg. Retention</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1M+</div>
              <div className="text-sm text-zinc-500">Scripts Analyzed</div>
            </div>
          </div>

          {/* Email Login Form */}
          <div className="max-w-sm mx-auto bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50"
              >
                {authLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-xs text-zinc-500">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-400 font-bold hover:underline"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How It Works</h2>
          <p className="text-zinc-400 text-lg">Transform your content in 3 simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all group">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <DnaIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-purple-400 font-bold mb-2">Step 1</div>
            <h3 className="text-xl font-bold text-white mb-3">Extract DNA</h3>
            <p className="text-zinc-400">Paste viral and flop video URLs. Our AI analyzes pacing, hooks, retention tactics, and audience psychology.</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all group">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <LayoutIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-purple-400 font-bold mb-2">Step 2</div>
            <h3 className="text-xl font-bold text-white mb-3">Generate Blueprint</h3>
            <p className="text-zinc-400">AI creates a section-by-section blueprint optimized for retention, CTR, and algorithm performance.</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all group">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <SparklesIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-purple-400 font-bold mb-2">Step 3</div>
            <h3 className="text-xl font-bold text-white mb-3">Write & Optimize</h3>
            <p className="text-zinc-400">Get a complete script with B-roll suggestions, emotion tags, and predictive viral scoring.</p>
          </div>
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Before vs After</h2>
          <p className="text-zinc-400 text-lg">See the difference LOG makes</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
            <div className="text-red-400 font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">❌</span> Before LOG
            </div>
            <div className="space-y-3 text-left">
              <p className="text-zinc-400">• Generic hooks that don't grab attention</p>
              <p className="text-zinc-400">• Random pacing with no retention strategy</p>
              <p className="text-zinc-400">• No data-driven optimization</p>
              <p className="text-zinc-400">• Guessing what works</p>
              <p className="text-zinc-400">• Low AVD (30-40%)</p>
            </div>
          </div>

          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8">
            <div className="text-green-400 font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span> After LOG
            </div>
            <div className="space-y-3 text-left">
              <p className="text-zinc-300">• <span className="text-green-400 font-semibold">Viral-proven hooks</span> from DNA analysis</p>
              <p className="text-zinc-300">• <span className="text-green-400 font-semibold">Pattern interrupts</span> every 15-20s</p>
              <p className="text-zinc-300">• <span className="text-green-400 font-semibold">Algorithm-optimized</span> structure</p>
              <p className="text-zinc-300">• <span className="text-green-400 font-semibold">Predictive scoring</span> (CTR, AVD, Viral %)</p>
              <p className="text-zinc-300">• High AVD (70-85%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Powerful Features</h2>
          <p className="text-zinc-400 text-lg">Everything you need to create viral content</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "🧬", title: "DNA Extraction", desc: "Reverse-engineer viral patterns" },
            { icon: "🎯", title: "Multi-Modal Analysis", desc: "Audio, visual, editing, metadata" },
            { icon: "🤖", title: "Algorithm Optimizer", desc: "CTR, AVD, engagement signals" },
            { icon: "📊", title: "Predictive Scoring", desc: "Viral probability prediction" },
            { icon: "🎬", title: "B-Roll Suggestions", desc: "Visual direction for editors" },
            { icon: "📈", title: "Performance Tracking", desc: "Analytics dashboard" },
          ].map((feature, i) => (
            <div key={i} className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Simple Pricing</h2>
          <p className="text-zinc-400 text-lg">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="text-4xl font-black text-white mb-6">$0<span className="text-lg text-zinc-500">/mo</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-zinc-400"><CheckIcon className="w-5 h-5 text-green-400 mt-0.5" /> 5 projects/month</li>
              <li className="flex items-start gap-2 text-zinc-400"><CheckIcon className="w-5 h-5 text-green-400 mt-0.5" /> 3 DNA extractions</li>
              <li className="flex items-start gap-2 text-zinc-400"><CheckIcon className="w-5 h-5 text-green-400 mt-0.5" /> Basic scoring</li>
            </ul>
            <button className="w-full py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-white font-semibold">
              Get Started
            </button>
          </div>

          <div className="bg-gradient-to-b from-purple-500/10 to-pink-500/10 border-2 border-purple-500/50 rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-4 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="text-4xl font-black text-white mb-6">$29<span className="text-lg text-zinc-500">/mo</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-zinc-300"><CheckIcon className="w-5 h-5 text-purple-400 mt-0.5" /> Unlimited projects</li>
              <li className="flex items-start gap-2 text-zinc-300"><CheckIcon className="w-5 h-5 text-purple-400 mt-0.5" /> Unlimited DNA extractions</li>
              <li className="flex items-start gap-2 text-zinc-300"><CheckIcon className="w-5 h-5 text-purple-400 mt-0.5" /> Advanced scoring + predictions</li>
              <li className="flex items-start gap-2 text-zinc-300"><CheckIcon className="w-5 h-5 text-purple-400 mt-0.5" /> Export to PDF/DOCX</li>
              <li className="flex items-start gap-2 text-zinc-300"><CheckIcon className="w-5 h-5 text-purple-400 mt-0.5" /> Priority support</li>
            </ul>
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-white font-bold shadow-lg shadow-purple-500/50">
              Start Free Trial
            </button>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-4xl font-black text-white mb-6">Custom</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-zinc-400"><CheckIcon className="w-5 h-5 text-green-400 mt-0.5" /> Everything in Pro</li>
              <li className="flex items-start gap-2 text-zinc-400"><CheckIcon className="w-5 h-5 text-green-400 mt-0.5" /> Team collaboration</li>
              <li className="flex items-start gap-2 text-zinc-400"><CheckIcon className="w-5 h-5 text-green-400 mt-0.5" /> Custom AI models</li>
              <li className="flex items-start gap-2 text-zinc-400"><CheckIcon className="w-5 h-5 text-green-400 mt-0.5" /> API access</li>
            </ul>
            <button className="w-full py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-white font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-24 max-w-3xl mx-auto mb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">FAQ</h2>
          <p className="text-zinc-400 text-lg">Common questions answered</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does DNA extraction work?",
              a: "LOG analyzes viral and flop videos to identify patterns in pacing, hooks, retention tactics, and audience psychology. It creates a reusable template (DNA) that captures these precise rules."
            },
            {
              q: "What platforms does LOG support?",
              a: "Currently YouTube. TikTok and Instagram Reels support coming soon."
            },
            {
              q: "Can I export my scripts?",
              a: "Yes! Pro users can export to PDF, DOCX, and JSON formats."
            },
            {
              q: "How accurate is the viral probability prediction?",
              a: "Our AI analyzes CTR triggers, AVD patterns, and engagement signals to predict viral probability. Accuracy improves as you create more DNAs from your niche."
            },
          ].map((faq, i) => (
            <details key={i} className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 group">
              <summary className="font-bold text-white cursor-pointer list-none flex justify-between items-center">
                {faq.q}
                <span className="text-purple-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-zinc-400 mt-4 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};
