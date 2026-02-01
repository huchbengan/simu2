
import React, { useState, useEffect } from 'react';
import { PlanLevel } from '../types';

interface LandingPageProps {
  onLogin: () => void;
  onUpgradeClick?: (plan: PlanLevel) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onUpgradeClick }) => {
  const [activeTab, setActiveTab] = useState<'marketing' | 'product' | 'strategy'>('marketing');
  const [heroStep, setHeroStep] = useState(0);

  // Simple animation loop for the hero visual
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePlanClick = (plan: PlanLevel) => {
     if (onUpgradeClick) {
        onUpgradeClick(plan);
     } else {
        onLogin();
     }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">S</div>
            <span className="font-bold text-xl tracking-tight text-white">SimuCrowd</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block">Log In</button>
            <button 
              onClick={onLogin}
              className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-orange-600/20 rounded-[100%] blur-[120px] -z-10 opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -z-10 opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-orange-400 mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              v2.0 Now Live: Multi-Modal Analysis
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Replace Guesswork with <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
                Synthetic Truth.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-zinc-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Generate 50+ hyper-realistic AI personas in seconds. Validate product features, test ad copy, and predict market trends without waiting weeks for a focus group.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(234,88,12,0.3)] hover:shadow-[0_0_60px_rgba(234,88,12,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <span>Start Simulation</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})} className="w-full sm:w-auto px-8 py-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl font-semibold text-lg transition-all">
                How it works
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Hero Visual (Fake UI Animation) */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none perspective-1000">
             <div className="relative z-10 bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                {/* Window Header */}
                <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                   <div className="ml-auto text-[10px] text-zinc-600 font-mono">SimuCrowd_v2.exe</div>
                </div>
                
                {/* Window Content */}
                <div className="p-6 h-[400px] flex flex-col relative">
                   {/* Step 1: Input */}
                   <div className={`transition-all duration-500 absolute inset-x-6 top-6 ${heroStep === 0 ? 'opacity-100 translate-y-0' : 'opacity-30 blur-sm translate-y-[-10px]'}`}>
                      <div className="text-xs text-orange-500 font-bold mb-2 uppercase tracking-wider">Input Directive</div>
                      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 text-sm text-zinc-300 font-mono">
                         "Analyze our new pricing tier: $19/mo for Pro vs $99/mo for Business. Target audience: US Freelancers."
                      </div>
                   </div>

                   {/* Step 2: Processing */}
                   <div className={`transition-all duration-500 absolute inset-x-6 top-32 ${heroStep === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 scale-95'}`}>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                         <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Generating 50 Personas...</div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                         {Array.from({length: 10}).map((_, i) => (
                            <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" style={{animationDelay: `${i*0.1}s`}}></div>
                         ))}
                      </div>
                   </div>

                   {/* Step 3: Analysis */}
                   <div className={`transition-all duration-500 absolute inset-x-6 top-32 ${heroStep === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[20px]'}`}>
                      <div className="text-xs text-green-500 font-bold mb-2 uppercase tracking-wider">Analysis Complete</div>
                      <div className="flex gap-4">
                         <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 p-4 flex flex-col items-center">
                            <div className="text-3xl font-bold text-white mb-1">72%</div>
                            <div className="text-[10px] text-zinc-500">Sentiment Score</div>
                         </div>
                         <div className="flex-1 bg-zinc-900 rounded-lg border border-zinc-800 p-4 flex flex-col items-center">
                            <div className="text-3xl font-bold text-white mb-1">High</div>
                            <div className="text-[10px] text-zinc-500">Purchase Intent</div>
                         </div>
                      </div>
                   </div>

                   {/* Step 4: Insight */}
                   <div className={`transition-all duration-500 absolute inset-x-6 bottom-6 ${heroStep === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10px]'}`}>
                      <div className="bg-gradient-to-r from-orange-900/40 to-black p-4 rounded-lg border border-orange-500/30">
                         <div className="flex items-start gap-3">
                            <span className="text-xl">💡</span>
                            <div>
                               <div className="text-xs font-bold text-orange-400 mb-1">KEY INSIGHT</div>
                               <p className="text-sm text-zinc-300 leading-snug">
                                  Price sensitivity is high. Users prefer the $19 tier but worry about feature limits. Suggest adding a "Starter" tier at $9.
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Decorative Background Glow for visuals */}
             <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur-2xl opacity-20 -z-10"></div>
          </div>

        </div>
      </section>

      {/* --- LOGO WALL (Social Proof) --- */}
      <section className="py-10 border-y border-white/5 bg-white/5">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-zinc-500 mb-6 uppercase tracking-widest">Trusted by product teams simulating the future</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Placeholder SVGs for Logo Wall - Abstract Tech Logos */}
               {['Acme Corp', 'GlobalTech', 'Nebula', 'FoxRun', 'Waveform'].map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-xl font-bold text-white">
                     <div className="w-6 h-6 bg-zinc-700 rounded-full"></div> {name}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- PROBLEM VS SOLUTION --- */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Focus Groups are Broken.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Stop relying on slow, expensive, and biased human panels for every small decision.</p>
         </div>

         <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-900/5 border border-red-900/20 p-8 rounded-3xl">
               <div className="text-red-500 font-bold mb-6 flex items-center gap-2">
                  <span className="text-2xl">❌</span> The Old Way
               </div>
               <ul className="space-y-4 text-zinc-400">
                  <li className="flex gap-3"><span className="text-red-800">●</span> Takes 2-4 weeks to recruit & run</li>
                  <li className="flex gap-3"><span className="text-red-800">●</span> Costs $5,000+ per study</li>
                  <li className="flex gap-3"><span className="text-red-800">●</span> Small sample size (5-10 people)</li>
                  <li className="flex gap-3"><span className="text-red-800">●</span> Biased by dominant voices</li>
               </ul>
            </div>
            
            <div className="bg-green-900/5 border border-green-500/20 p-8 rounded-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">SimuCrowd Advantage</div>
               <div className="text-green-500 font-bold mb-6 flex items-center gap-2">
                  <span className="text-2xl">✅</span> The SimuCrowd Way
               </div>
               <ul className="space-y-4 text-zinc-300">
                  <li className="flex gap-3 items-center"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Results in <span className="text-white font-bold">seconds</span></li>
                  <li className="flex gap-3 items-center"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Fraction of the cost (<span className="text-white font-bold">Credits based</span>)</li>
                  <li className="flex gap-3 items-center"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 50+ diverse personas simultaneously</li>
                  <li className="flex gap-3 items-center"><svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Unbiased, raw feedback</li>
               </ul>
            </div>
         </div>
      </section>

      {/* --- USE CASES (INTERACTIVE TABS) --- */}
      <section id="use-cases" className="py-24 bg-zinc-950 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-start">
               
               {/* Left: Controls */}
               <div className="w-full lg:w-1/3 sticky top-24">
                  <h2 className="text-4xl font-bold mb-6">Built for every team.</h2>
                  <p className="text-zinc-400 mb-8">Whether you are crafting copy, building products, or pivoting strategy, we have a template.</p>
                  
                  <div className="space-y-2">
                     {[
                        { id: 'marketing', label: 'Marketing & Ads', icon: '📢', desc: 'Copy testing, Landing Pages, Ad Fatigue.' },
                        { id: 'product', label: 'Product & Design', icon: '📱', desc: 'Feature validation, UI A/B testing, Pricing.' },
                        { id: 'strategy', label: 'Strategy & Founders', icon: '🚀', desc: 'Pivot check, Pitch deck validation, GTM.' }
                     ].map((item) => (
                        <button
                           key={item.id}
                           onClick={() => setActiveTab(item.id as any)}
                           className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 group ${
                              activeTab === item.id 
                              ? 'bg-zinc-900 border-orange-500 shadow-lg' 
                              : 'border-transparent hover:bg-zinc-900/50'
                           }`}
                        >
                           <span className={`text-2xl transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                           <div>
                              <div className={`font-bold ${activeTab === item.id ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>{item.label}</div>
                              <div className="text-xs text-zinc-500 mt-1">{item.desc}</div>
                           </div>
                           {activeTab === item.id && <div className="ml-auto text-orange-500">→</div>}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Right: Preview (Bento Grid) */}
               <div className="w-full lg:w-2/3">
                  {/* Marketing Grid */}
                  {activeTab === 'marketing' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-black p-8 rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all group">
                           <div className="bg-orange-600/20 text-orange-500 w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">✍️</div>
                           <h3 className="text-xl font-bold text-white mb-2">Ad Copy Optimizer</h3>
                           <p className="text-zinc-400 text-sm mb-6">Test 3 variations of your Facebook Ad copy against "Gen Z Gamers". See which hook drives the highest simulated CTR.</p>
                           <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                              <div className="bg-green-500 w-[65%]"></div>
                              <div className="bg-yellow-500 w-[20%]"></div>
                              <div className="bg-red-500 w-[15%]"></div>
                           </div>
                           <div className="flex justify-between text-[10px] text-zinc-500 mt-2">
                              <span>Short Copy (Winner)</span>
                              <span>Long Form</span>
                           </div>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                           <div className="text-3xl mb-4">🧲</div>
                           <h3 className="font-bold text-white mb-2">Landing Page Audit</h3>
                           <p className="text-zinc-400 text-xs">Analyze trust signals and fold placement. "Would you bounce?"</p>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                           <div className="text-3xl mb-4">📉</div>
                           <h3 className="font-bold text-white mb-2">Creative Fatigue</h3>
                           <p className="text-zinc-400 text-xs">Predict how fast your visual asset will lose effectiveness.</p>
                        </div>
                     </div>
                  )}

                  {/* Product Grid */}
                  {activeTab === 'product' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                           <div className="text-3xl mb-4">⚖️</div>
                           <h3 className="font-bold text-white mb-2">Feature A/B</h3>
                           <p className="text-zinc-400 text-xs">Navigation A vs Navigation B. Which one reduces cognitive load?</p>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                           <div className="text-3xl mb-4">🏷️</div>
                           <h3 className="font-bold text-white mb-2">Pricing Sensitivity</h3>
                           <p className="text-zinc-400 text-xs">Van Westendorp style analysis to find the optimal price floor.</p>
                        </div>
                        <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-black p-8 rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all">
                           <div className="bg-blue-600/20 text-blue-500 w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4">💎</div>
                           <h3 className="text-xl font-bold text-white mb-2">Subscription Value Check</h3>
                           <p className="text-zinc-400 text-sm mb-4">"Does the Annual Plan feel like a deal or a trap?"</p>
                           <div className="bg-black p-4 rounded-xl border border-zinc-800">
                              <div className="flex gap-2 mb-2">
                                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                 <p className="text-xs text-zinc-300 italic">"I'd buy if it was $10 less." - Persona #42</p>
                              </div>
                              <div className="flex gap-2">
                                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                 <p className="text-xs text-zinc-300 italic">"Instant value for my workflow." - Persona #12</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Strategy Grid */}
                  {activeTab === 'strategy' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-black p-8 rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all">
                           <div className="bg-purple-600/20 text-purple-500 w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4">⚠️</div>
                           <h3 className="text-xl font-bold text-white mb-2">Risk Assessment (Pre-Mortem)</h3>
                           <p className="text-zinc-400 text-sm mb-4">Identify the top 3 reasons why your launch might fail before you write a line of code.</p>
                           <div className="grid grid-cols-3 gap-2">
                              <div className="bg-zinc-800 p-2 rounded text-center">
                                 <div className="text-xs text-zinc-500">Risk 1</div>
                                 <div className="font-bold text-white">Complexity</div>
                              </div>
                              <div className="bg-zinc-800 p-2 rounded text-center">
                                 <div className="text-xs text-zinc-500">Risk 2</div>
                                 <div className="font-bold text-white">Trust</div>
                              </div>
                              <div className="bg-zinc-800 p-2 rounded text-center">
                                 <div className="text-xs text-zinc-500">Risk 3</div>
                                 <div className="font-bold text-white">Cost</div>
                              </div>
                           </div>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                           <div className="text-3xl mb-4">🧠</div>
                           <h3 className="font-bold text-white mb-2">Category Creation</h3>
                           <p className="text-zinc-400 text-xs">Testing entirely new concepts (Blue Ocean). "Is this weird or genius?"</p>
                        </div>
                        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                           <div className="text-3xl mb-4">🗣️</div>
                           <h3 className="font-bold text-white mb-2">Pitch Deck Review</h3>
                           <p className="text-zinc-400 text-xs">Simulate Investor personas to find holes in your narrative.</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-black to-zinc-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Simple Credit Pricing</h2>
              <p className="text-zinc-500 text-lg">Pay only for the insights you generate. No hidden fees.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Pro Plan */}
              <div className="bg-zinc-900/50 backdrop-blur rounded-3xl p-10 border border-zinc-800 flex flex-col hover:border-zinc-600 transition-all">
                 <h3 className="text-xl font-bold mb-2 text-white">Pro</h3>
                 <p className="text-zinc-500 text-sm mb-6">Perfect for solo founders.</p>
                 <div className="text-4xl font-extrabold mb-8 text-white">$99<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                 <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-sm text-zinc-300"><span className="text-green-500">✓</span> 2,000 Credits / Month</li>
                    <li className="flex items-center gap-3 text-sm text-zinc-300"><span className="text-green-500">✓</span> Access to all templates</li>
                    <li className="flex items-center gap-3 text-sm text-zinc-300"><span className="text-green-500">✓</span> 20 Custom Cohorts</li>
                 </ul>
                 <button onClick={() => handlePlanClick('PRO')} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all">Start Free Trial</button>
              </div>

              {/* Business Plan */}
              <div className="bg-black rounded-3xl p-10 border-2 border-orange-600 flex flex-col relative overflow-hidden transform md:scale-105 shadow-2xl shadow-orange-900/20">
                 <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 uppercase rounded-bl-xl">Best Value</div>
                 <h3 className="text-xl font-bold mb-2 text-white">Pro Plus</h3>
                 <p className="text-zinc-500 text-sm mb-6">For product teams moving fast.</p>
                 <div className="text-4xl font-extrabold mb-8 text-white">$199<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                 <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-center gap-3 text-sm text-white"><span className="text-orange-500">✓</span> 6,000 Credits / Month</li>
                    <li className="flex items-center gap-3 text-sm text-white"><span className="text-orange-500">✓</span> Unlimited Custom Cohorts</li>
                    <li className="flex items-center gap-3 text-sm text-white"><span className="text-orange-500">✓</span> Export to CSV/Excel</li>
                    <li className="flex items-center gap-3 text-sm text-white"><span className="text-orange-500">✓</span> Priority Processing</li>
                 </ul>
                 <button onClick={() => handlePlanClick('PRO_PLUS')} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all shadow-lg">Get Pro Plus Plan</button>
              </div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-zinc-900 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold text-white">S</div>
             <span className="font-bold text-zinc-300">SimuCrowd</span>
           </div>
           <div className="flex gap-8 text-sm text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">API</a>
           </div>
           <div className="text-zinc-600 text-xs">
              © 2024 SimuCrowd Inc.
           </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
