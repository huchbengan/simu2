
import React, { useState, useEffect, useRef } from 'react';
import { AS_AudienceCohort, AS_MotherPopulationConfig } from '../types';
import { AS_Nuwa_generatePersonas, AS_Nuwa_recommendConfig } from '../services/geminiService';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface AudienceBuilderProps {
  onComplete: (cohort: AS_AudienceCohort) => void;
  onCancel: () => void;
}

const AudienceBuilder: React.FC<AudienceBuilderProps> = ({ onComplete, onCancel }) => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [populationSize, setPopulationSize] = useState(50);
  
  // Magic Input State
  const [magicText, setMagicText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mother Population Configuration
  const [config, setConfig] = useState<AS_MotherPopulationConfig>({
    id: `cust_${Date.now()}`,
    title: '',
    description: '',
    tags: [],
    genderRatio: 0.5, // 50% Male
    ageRange: [25, 45],
    incomeDist: [
       { label: 'Low (<30k)', weight: 20 },
       { label: 'Medium (30-80k)', weight: 60 },
       { label: 'High (80k+)', weight: 20 }
    ],
    vocationDist: [
       { label: 'Corporate', weight: 40 },
       { label: 'Freelance', weight: 20 },
       { label: 'Service', weight: 20 },
       { label: 'Unemployed', weight: 20 }
    ],
    educationDist: [
       { label: 'High School', weight: 30 },
       { label: 'Bachelor', weight: 50 },
       { label: 'Master+', weight: 20 }
    ],
    traits: ['Pragmatic', 'Value-Driven'],
    decisionMotive: 'Avoid Risk',
    customInstruction: ''
  });

  // --- ACTIONS ---

  const handleMagicFill = async () => {
    if (!magicText.trim()) return;
    setAnalyzing(true);
    try {
      const suggestion = await AS_Nuwa_recommendConfig(magicText);
      setConfig(prev => ({
         ...prev,
         ...suggestion,
         // Ensure existing customInstruction is preserved if not overwritten, or set meaningful description
         description: suggestion.description || prev.description,
         // Merge logic: If API returns partial, fallback to existing.
         genderRatio: suggestion.genderRatio ?? prev.genderRatio,
         ageRange: suggestion.ageRange ?? prev.ageRange,
         incomeDist: suggestion.incomeDist ?? prev.incomeDist,
         vocationDist: suggestion.vocationDist ?? prev.vocationDist,
         educationDist: suggestion.educationDist ?? prev.educationDist,
         traits: suggestion.traits ?? prev.traits,
         decisionMotive: suggestion.decisionMotive ?? prev.decisionMotive,
         title: suggestion.title || prev.title,
         customInstruction: suggestion.customInstruction || prev.customInstruction,
      }));
    } catch (e) {
      alert("Failed to analyze input.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
         setMagicText(prev => (prev ? prev + "\n\n" : "") + `[FILE CONTENT]:\n${text.slice(0, 5000)}`); // Limit char count
      }
    };
    reader.readAsText(file);
  };

  const handleWeightChange = (field: 'incomeDist' | 'vocationDist' | 'educationDist', index: number, newVal: number) => {
     setConfig(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => 
           i === index ? { ...item, weight: newVal } : item
        )
     }));
  };

  const addOption = (field: 'incomeDist' | 'vocationDist' | 'educationDist') => {
     const label = prompt("Enter new category name:");
     if (label) {
        setConfig(prev => ({
           ...prev,
           [field]: [...prev[field], { label, weight: 10 }]
        }));
     }
  };

  const generate = async () => {
     if (!config.title) { alert("Please name your cohort."); return; }
     setLoading(true);
     setProgress(0);
     try {
        const cohort = await AS_Nuwa_generatePersonas(config, populationSize, (p) => setProgress(p));
        onComplete(cohort);
     } catch (e) {
        console.error(e);
        alert("Generation failed. Check console.");
        setLoading(false);
     }
  };

  // --- CHARTS ---
  const COLORS = ['#ea580c', '#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899'];

  const DistributionChart = ({ data }: { data: { label: string, weight: number }[] }) => (
     <div className="h-32 w-32 relative">
        <ResponsiveContainer width="100%" height="100%">
           <PieChart>
              <Pie data={data} dataKey="weight" nameKey="label" cx="50%" cy="50%" innerRadius={25} outerRadius={40}>
                 {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '10px'}} />
           </PieChart>
        </ResponsiveContainer>
     </div>
  );

  // --- RENDER ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={onCancel}></div>
      
      <div className="relative w-full max-w-6xl h-[90vh] bg-black border border-zinc-800 rounded-3xl shadow-2xl flex overflow-hidden animate-scale-in">
        
        {/* LEFT: FORM (Mother Population Definition) */}
        <div className="w-7/12 flex flex-col border-r border-zinc-800 bg-zinc-900/30 overflow-y-auto custom-scrollbar">
           
           {/* HEADER & MAGIC INPUT */}
           <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center text-white font-bold">N</div>
                    <h2 className="text-xl font-bold text-white">Nuwa Engine <span className="text-zinc-500 font-normal">| Population Architect</span></h2>
                 </div>
              </div>

              {/* Magic Input Box */}
              <div className="bg-black/40 border border-zinc-700/50 rounded-xl p-3 mb-6 relative group focus-within:border-orange-500/50 focus-within:bg-black/60 transition-all">
                 <div className="absolute -top-2 left-3 bg-zinc-900 px-2 text-[10px] font-bold text-orange-400 uppercase tracking-widest border border-zinc-800 rounded">
                    Magic Auto-Fill
                 </div>
                 <textarea 
                    value={magicText}
                    onChange={e => setMagicText(e.target.value)}
                    placeholder="Describe your audience (e.g., 'Suburban yoga moms who shop at Whole Foods') or paste a text/persona file here..."
                    className="w-full bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none resize-none h-16 scrollbar-hide"
                 />
                 <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1 uppercase tracking-wide">
                          📎 Upload File
                       </button>
                       <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md,.json,.csv" onChange={handleFileUpload} />
                    </div>
                    <button 
                       onClick={handleMagicFill}
                       disabled={analyzing || !magicText}
                       className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-2 ${analyzing ? 'bg-zinc-800 text-zinc-500' : 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-900/20'}`}
                    >
                       {analyzing ? 'Analyzing...' : '✨ Analyze & Preset'}
                    </button>
                 </div>
              </div>

              <input 
                 type="text" 
                 placeholder="Audience Title" 
                 value={config.title}
                 onChange={e => setConfig({...config, title: e.target.value})}
                 className="w-full bg-transparent text-2xl font-bold text-white placeholder-zinc-700 outline-none"
              />
              <input 
                 type="text" 
                 placeholder="Brief context..." 
                 value={config.description}
                 onChange={e => setConfig({...config, description: e.target.value})}
                 className="w-full bg-transparent text-sm text-zinc-400 placeholder-zinc-700 outline-none mt-1"
              />
           </div>

           <div className="p-8 space-y-8">
              
              {/* 1. DEMOGRAPHICS */}
              <section>
                 <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">1. Demographics</h3>
                 
                 {/* Gender Slider */}
                 <div className="mb-6">
                    <div className="flex justify-between text-sm text-zinc-400 mb-2">
                       <span>Male {(config.genderRatio * 100).toFixed(0)}%</span>
                       <span>Female {((1 - config.genderRatio) * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                       type="range" min="0" max="1" step="0.05" 
                       value={config.genderRatio} 
                       onChange={e => setConfig({...config, genderRatio: parseFloat(e.target.value)})}
                       className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                 </div>

                 {/* Age Range */}
                 <div className="mb-6">
                    <div className="flex justify-between text-sm text-zinc-400 mb-2">
                       <span>Age Range</span>
                       <span className="text-white">{config.ageRange[0]} - {config.ageRange[1]} years old</span>
                    </div>
                    <div className="flex gap-4">
                       <input 
                          type="number" value={config.ageRange[0]} 
                          onChange={e => setConfig({...config, ageRange: [parseInt(e.target.value), config.ageRange[1]]})}
                          className="w-20 bg-zinc-900 border border-zinc-700 rounded p-2 text-center text-white"
                       />
                       <span className="text-zinc-500 self-center">-</span>
                       <input 
                          type="number" value={config.ageRange[1]} 
                          onChange={e => setConfig({...config, ageRange: [config.ageRange[0], parseInt(e.target.value)]})}
                          className="w-20 bg-zinc-900 border border-zinc-700 rounded p-2 text-center text-white"
                       />
                    </div>
                 </div>
              </section>

              {/* 2. SOCIO-ECONOMIC (Weighted Distributions) */}
              <section>
                 <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">2. Socio-Economic Distribution</h3>
                 
                 <div className="grid grid-cols-2 gap-8">
                    {/* Vocations */}
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                       <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-zinc-300">Vocation Mix</span>
                          <button onClick={() => addOption('vocationDist')} className="text-xs text-blue-400 hover:text-blue-300">+ Add</button>
                       </div>
                       <div className="space-y-3">
                          {config.vocationDist.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 w-24 truncate" title={item.label}>{item.label}</span>
                                <input 
                                   type="range" min="0" max="100" value={item.weight} 
                                   onChange={e => handleWeightChange('vocationDist', idx, parseInt(e.target.value))}
                                   className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-blue-500"
                                />
                                <span className="text-xs text-zinc-300 w-8 text-right">{item.weight}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Income */}
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                       <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-zinc-300">Income Levels</span>
                          <button onClick={() => addOption('incomeDist')} className="text-xs text-blue-400 hover:text-blue-300">+ Add</button>
                       </div>
                       <div className="space-y-3">
                          {config.incomeDist.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 w-24 truncate" title={item.label}>{item.label}</span>
                                <input 
                                   type="range" min="0" max="100" value={item.weight} 
                                   onChange={e => handleWeightChange('incomeDist', idx, parseInt(e.target.value))}
                                   className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-green-500"
                                />
                                <span className="text-xs text-zinc-300 w-8 text-right">{item.weight}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </section>

              {/* 3. PSYCHOGRAPHICS */}
              <section>
                 <h3 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-4">3. Psychographics</h3>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs text-zinc-500 mb-1">Core Traits (Comma separated)</label>
                       <input 
                          type="text" 
                          value={config.traits.join(', ')}
                          onChange={e => setConfig({...config, traits: e.target.value.split(',').map(s => s.trim())})}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs text-zinc-500 mb-1">Primary Decision Motive</label>
                       <select 
                          value={config.decisionMotive}
                          onChange={e => setConfig({...config, decisionMotive: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none appearance-none"
                       >
                          <option>Avoid Risk</option>
                          <option>Seek Efficiency</option>
                          <option>Seek Status</option>
                          <option>Maximize Value</option>
                          <option>Impulse / Novelty</option>
                       </select>
                    </div>
                 </div>
              </section>

              {/* 4. FINE TUNING (NEW) */}
              <section>
                 <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4">4. Fine Tuning</h3>
                 
                 <div className="space-y-6">
                     {/* Population Size */}
                     <div>
                        <div className="flex justify-between text-sm text-zinc-400 mb-2">
                            <span>Population Size</span>
                            <span className="text-white font-bold">{populationSize} People</span>
                        </div>
                        <input 
                           type="range" min="10" max="100" step="10"
                           value={populationSize}
                           onChange={e => setPopulationSize(parseInt(e.target.value))}
                           className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1">
                           Higher populations (50-100) provide better statistical distribution but take longer to generate.
                        </p>
                     </div>

                     {/* Custom Instructions */}
                     <div>
                        <label className="block text-xs text-zinc-500 mb-1">Custom Instruction (Optional)</label>
                        <textarea 
                           value={config.customInstruction || ''}
                           onChange={e => setConfig({...config, customInstruction: e.target.value})}
                           placeholder="e.g. 'Make sure at least 20% are skeptical about AI', 'They should all be tech-savvy', 'Include 5 extreme outliers'..."
                           className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-rose-500 outline-none h-24 resize-none"
                        />
                     </div>
                 </div>
              </section>

           </div>
        </div>

        {/* RIGHT: PREVIEW (Live Simulation) */}
        <div className="w-5/12 bg-zinc-950 p-8 flex flex-col relative overflow-hidden">
           {/* Grid Background */}
           <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           <div className="relative z-10">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Population Preview</h3>
              
              {/* Stats Row */}
              <div className="flex justify-between items-center bg-zinc-900 rounded-xl p-4 border border-zinc-800 mb-6">
                 <div className="text-center">
                    <div className="text-2xl font-bold text-white">{populationSize}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">Sample Size</div>
                 </div>
                 <div className="h-8 w-px bg-zinc-800"></div>
                 <div className="flex items-center gap-4">
                    <DistributionChart data={config.vocationDist} />
                    <DistributionChart data={config.incomeDist} />
                 </div>
              </div>

              {/* Sample Persona Card (Preview of what Nuwa will generate) */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl">SAMPLE</div>
                 
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700"></div>
                    <div>
                       <div className="w-32 h-4 bg-zinc-700 rounded mb-2 animate-pulse"></div>
                       <div className="w-20 h-3 bg-zinc-800 rounded animate-pulse"></div>
                    </div>
                 </div>
                 
                 <div className="space-y-2 mb-4">
                    <div className="w-full h-2 bg-zinc-800 rounded animate-pulse"></div>
                    <div className="w-3/4 h-2 bg-zinc-800 rounded animate-pulse"></div>
                 </div>

                 {/* Nuwa Radar Preview */}
                 <div className="grid grid-cols-4 gap-2 text-center">
                    {['PAT', 'LOG', 'IMP', 'BUD'].map(l => (
                       <div key={l} className="bg-black p-2 rounded border border-zinc-800">
                          <div className="text-[9px] text-zinc-500 font-bold">{l}</div>
                          <div className="h-1 w-full bg-zinc-800 mt-1 rounded-full overflow-hidden">
                             <div className="h-full bg-orange-500 w-1/2"></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="mt-4 text-center text-xs text-zinc-500">
                 Nuwa Engine will generate distinct psychological profiles for each of the {populationSize} skeletons defined by your settings.
              </div>

           </div>

           {/* Footer Action */}
           <div className="mt-auto relative z-10">
              {loading ? (
                 <div className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-center">
                    <div className="text-orange-500 font-bold mb-2">Generating Population...</div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden w-full">
                       <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="text-xs text-zinc-500 mt-2">Enriching Psychology: {progress}%</div>
                 </div>
              ) : (
                 <button 
                    onClick={generate}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all flex items-center justify-center gap-2"
                 >
                    <span>Generate {populationSize} Profiles</span>
                    <span>✨</span>
                 </button>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AudienceBuilder;
