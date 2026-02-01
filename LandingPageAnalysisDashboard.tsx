

import React from 'react';
import { AnalysisResult, AS_Persona, UniversalDashboardData, ExperimentType, UniversalChartData } from '../types';
import PersonaGrid from './PersonaGrid';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

interface UniversalAnalysisDashboardProps {
  experimentType: ExperimentType;
  personas: AS_Persona[];
  results: AnalysisResult[];
  structuredInsights?: UniversalDashboardData;
  onSelectPersona: (p: AS_Persona) => void;
}

// --- CHART RENDERER ---
const UniversalChart: React.FC<{ data?: UniversalChartData }> = ({ data }) => {
   if (!data) return <div className="text-zinc-500 text-sm italic">No visual data available.</div>;

   const chartHeight = 250;

   // 1. FUNNEL / BAR
   if (data.type === 'funnel' || data.type === 'bar') {
      return (
         <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data.series} layout={data.type === 'funnel' ? 'vertical' : 'horizontal'} margin={{ left: 0, right: 0 }}>
               {data.type === 'bar' && <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />}
               
               {data.type === 'funnel' ? (
                  <>
                     <XAxis type="number" hide />
                     <YAxis dataKey="label" type="category" width={80} tick={{fill:'#a1a1aa', fontSize: 11}} />
                  </>
               ) : (
                  <>
                     <XAxis dataKey="label" tick={{fill:'#a1a1aa', fontSize: 11}} />
                     <YAxis hide />
                  </>
               )}
               
               <Tooltip cursor={{fill: '#27272a'}} contentStyle={{backgroundColor:'#18181b', borderColor:'#27272a'}} />
               <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={data.type === 'funnel' ? 24 : 40}>
                  {data.series.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ea580c' : '#fb923c'} />
                  ))}
               </Bar>
            </BarChart>
         </ResponsiveContainer>
      );
   }

   // 2. LINE (Elasticity, Trends)
   if (data.type === 'line') {
      return (
         <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data.series} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
               <XAxis dataKey="label" tick={{fill:'#a1a1aa', fontSize: 11}} />
               <YAxis tick={{fill:'#a1a1aa', fontSize: 11}} />
               <Tooltip contentStyle={{backgroundColor:'#18181b', borderColor:'#27272a'}} />
               <Line type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={3} dot={{r:4, fill:'#ea580c'}} activeDot={{r:6}} />
               {data.series[0].value2 !== undefined && (
                  <Line type="monotone" dataKey="value2" stroke="#22c55e" strokeWidth={3} dot={{r:4, fill:'#22c55e'}} />
               )}
            </LineChart>
         </ResponsiveContainer>
      );
   }

   // 3. RADAR (Risk, Dimensions)
   if (data.type === 'radar') {
      return (
         <ResponsiveContainer width="100%" height={chartHeight}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.series}>
               <PolarGrid stroke="#3f3f46" />
               <PolarAngleAxis dataKey="label" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
               <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
               <Radar name="Value" dataKey="value" stroke="#ea580c" fill="#ea580c" fillOpacity={0.6} />
               <Tooltip contentStyle={{backgroundColor:'#18181b', borderColor:'#27272a'}} />
            </RadarChart>
         </ResponsiveContainer>
      );
   }

   // 4. SCATTER (Value vs Urgency, Risk vs Reward)
   if (data.type === 'scatter') {
      return (
         <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
               <XAxis type="number" dataKey="value" name={data.xAxisLabel || "X"} tick={{fill:'#a1a1aa', fontSize: 11}} />
               <YAxis type="number" dataKey="value2" name={data.yAxisLabel || "Y"} tick={{fill:'#a1a1aa', fontSize: 11}} />
               <ZAxis dataKey="label" range={[60, 60]} /> {/* Optional: scale bubbles if we had size data */}
               <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor:'#18181b', borderColor:'#27272a'}} />
               <Scatter name="Data" data={data.series} fill="#ea580c" />
            </ScatterChart>
         </ResponsiveContainer>
      );
   }

   // 5. HEATMAP (Simulated via Bars for now)
   if (data.type === 'heatmap') {
      return (
         <div className="space-y-3 h-[250px] overflow-y-auto pr-2 scrollbar-thin">
            {data.series.map((d, i) => (
               <div key={i} className="flex items-center gap-4">
                  <span className="w-24 text-xs text-zinc-500 text-right truncate" title={d.label}>{d.label}</span>
                  <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                     <div 
                        className={`h-full rounded-full ${d.value > 70 ? 'bg-red-500' : d.value > 40 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                        style={{ width: `${d.value}%`, opacity: 0.8 }}
                     ></div>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono w-8 text-right">{d.value}</span>
               </div>
            ))}
         </div>
      );
   }

   return <div>Unsupported chart type</div>;
};


const UniversalAnalysisDashboard: React.FC<UniversalAnalysisDashboardProps> = ({ 
  experimentType,
  personas, 
  results, 
  structuredInsights, 
  onSelectPersona
}) => {
  // --- VIEW: VALIDATION (Deep Diagnostic) ---
  if (experimentType === 'VALIDATION') {
     return (
       <div className="space-y-12 animate-fade-in">
         
         {/* 1. THE PULSE */}
         <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">1. The Pulse (Health Check)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {(structuredInsights?.pulse || []).map((metric, i) => (
                  <div key={i} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase">{metric.label}</span>
                        <div className={`w-2.5 h-2.5 rounded-full ${
                           metric.status === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                           metric.status === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                           metric.status === 'yellow' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'bg-zinc-700'
                        }`}></div>
                     </div>
                     <div className="text-2xl font-extrabold text-white mb-4">{metric.value}</div>
                     <div className="bg-zinc-950/50 rounded-lg px-3 py-2 border border-zinc-800/50">
                        <div className="text-[10px] text-zinc-500 uppercase">Benchmark</div>
                        <div className="text-xs text-zinc-300 font-medium">{metric.benchmark}</div>
                     </div>
                  </div>
               ))}
               {(!structuredInsights?.pulse || structuredInsights.pulse.length === 0) && (
                  <div className="col-span-4 py-8 text-center bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                     <p className="text-zinc-500 text-sm">Analysis currently unavailable. Please try running the simulation again.</p>
                  </div>
               )}
            </div>
         </div>

         {/* 2. THE FLOW / CHART */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-2 bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-lg">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">
                  2. The Flow &nbsp;
                  <span className="text-xs normal-case text-zinc-600 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                     {structuredInsights?.visualData?.title || 'Data Visualization'}
                  </span>
               </h3>
               {structuredInsights?.visualData ? (
                  <UniversalChart data={structuredInsights.visualData} />
               ) : (
                  <div className="h-[200px] flex items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">Chart generating...</div>
               )}
            </div>
            
            {/* Context Side Panel for Chart */}
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-lg flex flex-col justify-center">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Key Takeaway</h3>
               <p className="text-zinc-300 text-sm leading-relaxed">
                  {structuredInsights?.diagnosis?.[0]?.conclusion || "Data analysis suggests significant patterns in user behavior. Review the diagnostic cards below for details."}
               </p>
            </div>
         </div>

         {/* 3. THE DIAGNOSIS */}
         <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">3. The Diagnosis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {(structuredInsights?.diagnosis && structuredInsights.diagnosis.length > 0) ? (
                  structuredInsights.diagnosis.map((diag, i) => (
                     <div key={i} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 flex flex-col hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                           <span className="bg-zinc-800 text-zinc-400 w-6 h-6 rounded flex items-center justify-center text-xs font-bold">{String.fromCharCode(65+i)}</span>
                           <h4 className="font-bold text-white text-sm">{diag.title}</h4>
                        </div>
                        <div className="space-y-4 text-sm">
                           <div className="pl-3 border-l-2 border-zinc-700">
                              <span className="block text-[10px] text-zinc-500 uppercase">Data Signal</span>
                              <span className="text-zinc-300">{diag.dataPoint}</span>
                           </div>
                           <div className="pl-3 border-l-2 border-blue-500/50">
                              <span className="block text-[10px] text-blue-400 uppercase">Psychology</span>
                              <span className="text-zinc-300">{diag.psychology}</span>
                           </div>
                           <div className="pl-3 border-l-2 border-orange-500/50">
                              <span className="block text-[10px] text-orange-400 uppercase">Conclusion</span>
                              <span className="text-white font-medium">{diag.conclusion}</span>
                           </div>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="col-span-full py-8 text-center bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
                     <p className="text-zinc-500 text-sm">No diagnostic data generated.</p>
                  </div>
               )}
            </div>
         </div>

         {/* 4. THE PRESCRIPTION */}
         <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 p-8 shadow-lg">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">4. The Prescription (Backlog)</h3>
             <div className="grid gap-3">
               {(structuredInsights?.actions || []).map((action, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                     <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        action.priority === 'High' ? 'bg-red-900/30 text-red-400 border border-red-900/50' :
                        action.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' :
                        'bg-blue-900/30 text-blue-400 border border-blue-900/50'
                     }`}>
                        {action.priority}
                     </div>
                     <div>
                        <div className="font-bold text-white text-sm mb-1">{action.label}</div>
                        <p className="text-zinc-400 text-xs leading-relaxed">{action.desc}</p>
                     </div>
                  </div>
               ))}
               {(!structuredInsights?.actions) && <div className="text-zinc-500 italic text-sm">Generating recommended actions...</div>}
             </div>
         </div>

         {/* Footer Grid */}
         <div className="pt-8 border-t border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-6">Participant Details</h3>
            <PersonaGrid personas={personas} results={results} onSelect={onSelectPersona} viewMode="grid" />
         </div>

       </div>
     );
  }

  // --- VIEW: PREFERENCE (Comparative Analysis) ---
  if (experimentType === 'PREFERENCE') {
      return (
         <div className="space-y-12 animate-fade-in">
            
            {/* 1. COMPARATIVE METRICS */}
            <div>
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">1. Head-to-Head (Winner vs Loser)</h3>
               <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
                  <div className="grid grid-cols-5 bg-black/50 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider py-3 px-6">
                     <div className="col-span-2">Metric</div>
                     <div className="text-center text-green-500">Winner</div>
                     <div className="text-center text-red-500">Loser</div>
                     <div className="text-right">Insight</div>
                  </div>
                  {(structuredInsights?.comparativeMetrics || []).map((m, i) => (
                     <div key={i} className="grid grid-cols-5 py-4 px-6 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors items-center">
                        <div className="col-span-2 text-sm font-medium text-white">{m.label}</div>
                        <div className="text-center font-bold text-green-400">{m.winnerValue}</div>
                        <div className="text-center font-bold text-red-400 opacity-60">{m.loserValue}</div>
                        <div className="text-right text-xs text-zinc-400 italic">{m.insight}</div>
                     </div>
                  ))}
                  {(!structuredInsights?.comparativeMetrics) && <div className="p-6 text-center text-zinc-500 italic">Calculating comparison...</div>}
               </div>
            </div>

            {/* 2. VISUAL CONTRAST */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-lg">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">
                     {structuredInsights?.comparativeVisualData?.title || 'Visual Comparison'}
                  </h3>
                  {structuredInsights?.comparativeVisualData ? (
                     <UniversalChart data={structuredInsights.comparativeVisualData} />
                  ) : (
                     <div className="h-[200px] flex items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">Visualizing contrast...</div>
                  )}
               </div>

               <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-lg flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Preference Quadrant</h3>
                  <div className="relative aspect-square border border-zinc-800 bg-zinc-950/50 rounded-xl">
                     {/* Axis Labels */}
                     <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 uppercase">High Intent</span>
                     <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 uppercase">Low Intent</span>
                     <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-zinc-500 uppercase">Low Friction</span>
                     <span className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] text-zinc-500 uppercase">High Friction</span>
                     
                     {/* Grid Lines */}
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-zinc-800/50"></div>
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-px bg-zinc-800/50"></div>
                     </div>

                     {/* Plot Points (Simulated visually for now as we lack scatter coordinates in schema) */}
                     <div className="absolute top-[20%] right-[30%] w-16 h-16 bg-green-500/20 rounded-full border border-green-500 flex items-center justify-center text-xs font-bold text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse">Winner</div>
                     <div className="absolute bottom-[30%] left-[20%] w-12 h-12 bg-red-500/10 rounded-full border border-red-500/50 flex items-center justify-center text-xs text-red-400">Loser</div>
                  </div>
               </div>
            </div>

            {/* 3. DIAGNOSTIC INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                  { label: 'Variable Effect', val: structuredInsights?.comparativeDiagnostics?.variableEffect },
                  { label: 'Cognitive Load', val: structuredInsights?.comparativeDiagnostics?.cognitiveLoad },
                  { label: 'Friction Points', val: structuredInsights?.comparativeDiagnostics?.frictionPoints },
                  { label: 'Stat Confidence', val: structuredInsights?.comparativeDiagnostics?.statisticalConfidence }
               ].map((d, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition-colors">
                     <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">{d.label}</h4>
                     <p className="text-sm text-zinc-300 leading-snug">{d.val || 'Analyzing...'}</p>
                  </div>
               ))}
            </div>

            {/* 4. STRATEGY */}
            <div className="bg-gradient-to-br from-purple-900/20 to-zinc-900 rounded-2xl border border-purple-500/30 p-8 shadow-lg">
               <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-6">4. Strategic Decision</h3>
               <div className="space-y-6">
                  <div>
                     <span className="text-xs text-zinc-500 uppercase block mb-1">Recommendation</span>
                     <div className="text-xl font-bold text-white">{structuredInsights?.strategy?.decision || 'Loading...'}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-black/40 p-4 rounded-lg border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase block mb-2">Fusion Suggestion</span>
                        <p className="text-sm text-zinc-300">{structuredInsights?.strategy?.fusionSuggestion || '...'}</p>
                     </div>
                     <div className="bg-black/40 p-4 rounded-lg border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase block mb-2">Next Hypothesis</span>
                        <p className="text-sm text-zinc-300">{structuredInsights?.strategy?.nextHypothesis || '...'}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Grid */}
            <div className="pt-8 border-t border-zinc-800">
               <h3 className="text-xl font-bold text-white mb-6">Participant Details</h3>
               <PersonaGrid personas={personas} results={results} onSelect={onSelectPersona} viewMode="grid" />
            </div>

         </div>
      );
  }

  return null;
};

export default UniversalAnalysisDashboard;