
import React, { useState, useMemo } from 'react';
import { AS_AudienceCohort, AS_CohortArchetype, COST_TABLE } from '../types';
import { AS_SimulatorEngine } from '../services/AS_SimulatorEngine';
import AudienceBuilder from './AudienceBuilder';
import PersonaGrid from './PersonaGrid';

interface CohortManagerProps {
  cohorts: AS_AudienceCohort[];
  onRefresh: () => void;
  onSelectCohortForSim?: (cohort: AS_AudienceCohort) => void; 
  variant?: 'management' | 'selection'; 
  onSaveCohort?: (cohort: AS_AudienceCohort) => void;
  onDeleteCohort?: (id: string) => void;
}

// --- VISUAL ASSETS ---
const CardBackground: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => (
   <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.4)_0%,rgba(9,9,11,0.8)_100%)]"></div>
      <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#71717a 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 blur-[80px] animate-[spin_20s_linear_infinite] bg-blue-500/20"></div>
   </div>
);

// --- COMPONENTS FOR DNA MODAL ---

const DNAArchetypeCard: React.FC<{ archetype: AS_CohortArchetype }> = ({ archetype }) => {
   const [expanded, setExpanded] = useState(false);

   const borderColor = archetype.type === 'HAPPY_PATH' ? 'border-green-500/50' 
                     : archetype.type === 'STRESS_TEST' ? 'border-red-500/50' 
                     : 'border-blue-500/50';
   
   const glowColor = archetype.type === 'HAPPY_PATH' ? 'bg-green-500/10' 
                     : archetype.type === 'STRESS_TEST' ? 'bg-red-500/10' 
                     : 'bg-blue-500/10';

   const label = archetype.type === 'HAPPY_PATH' ? 'Happy Path' 
               : archetype.type === 'STRESS_TEST' ? 'Stress Test' 
               : 'Most Likely';

   return (
      <div 
         onClick={() => setExpanded(!expanded)}
         className={`relative group bg-zinc-900 border ${borderColor} rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl overflow-hidden flex flex-col ${expanded ? 'row-span-2' : ''}`}
      >
         <div className={`absolute inset-0 ${glowColor} opacity-50`}></div>
         
         {/* Header */}
         <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
               <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{label}</div>
               <h4 className="text-xl font-bold text-white leading-none">{archetype.name}</h4>
               <p className="text-sm text-zinc-400">{archetype.role}</p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${borderColor} text-lg`}>
               {archetype.type === 'HAPPY_PATH' ? '🚀' : archetype.type === 'STRESS_TEST' ? '🛡️' : '👥'}
            </div>
         </div>

         {/* Tags */}
         <div className="relative z-10 flex flex-wrap gap-2 mb-4">
            {archetype.tags.map(tag => (
               <span key={tag} className="text-[10px] font-bold bg-black/40 px-2 py-1 rounded text-zinc-300 border border-white/10">
                  {tag}
               </span>
            ))}
         </div>

         {/* Scenario */}
         <div className="relative z-10 mb-4">
            <p className="text-xs text-zinc-300 italic border-l-2 border-white/20 pl-3 leading-relaxed">
               "{archetype.context}"
            </p>
         </div>

         {/* EXPANDED DETAILS */}
         {expanded && (
            <div className="relative z-10 mt-4 border-t border-white/10 pt-4 space-y-4 animate-fade-in">
               
               {/* Behavioral DNA */}
               <div>
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Behavioral DNA</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                     <div className="bg-black/30 p-2 rounded">
                        <span className="text-zinc-500 block mb-1">Ad Resistance</span>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${archetype.adResistance === 'High' ? 'bg-red-500' : archetype.adResistance === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                           <span className="text-white font-bold">{archetype.adResistance}</span>
                        </div>
                     </div>
                     <div className="bg-black/30 p-2 rounded">
                        <span className="text-zinc-500 block mb-1">Cognitive Load</span>
                        <span className="text-white font-bold truncate" title={archetype.cognitiveLoadPreference}>
                           {archetype.cognitiveLoadPreference}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Decision Drivers (Progress Bars) */}
               <div>
                  <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Decision Weights</h5>
                  <div className="space-y-2">
                     {Object.entries(archetype.decisionWeights).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                           <span className="w-12 text-zinc-400 capitalize">{key}</span>
                           <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${val === 'High' ? 'bg-white w-full' : val === 'Medium' ? 'bg-zinc-400 w-2/3' : 'bg-zinc-600 w-1/3'}`}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Drivers & Friction */}
               <div className="grid grid-cols-2 gap-2">
                  <div>
                     <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">⚡ Triggers</h5>
                     <ul className="text-xs text-zinc-300 list-disc list-inside">
                        {archetype.triggers.slice(0,2).map(t => <li key={t} className="truncate">{t}</li>)}
                     </ul>
                  </div>
                  <div>
                     <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">🛑 Friction</h5>
                     <ul className="text-xs text-zinc-300 list-disc list-inside">
                        {archetype.frictions.slice(0,2).map(f => <li key={f} className="truncate">{f}</li>)}
                     </ul>
                  </div>
               </div>

               {/* Prediction */}
               <div className="bg-black/40 p-3 rounded-lg border border-white/5 mt-2">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold text-zinc-500 uppercase">AI Strategy</span>
                     <span className="text-[10px] text-orange-400 font-mono">{archetype.difficultyRating}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-snug">
                     {archetype.aiStrategyTip}
                  </p>
               </div>

            </div>
         )}

         {!expanded && (
            <div className="relative z-10 mt-auto text-center">
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest group-hover:text-white transition-colors">Click to Expand DNA</span>
            </div>
         )}
      </div>
   );
};

const GroupOverviewCard: React.FC<{ cohort: AS_AudienceCohort }> = ({ cohort }) => {
   const overview = cohort.as_groupOverview;
   const total = cohort.as_personas?.length || 50;
   
   return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-black/50 to-transparent pointer-events-none"></div>
         
         <div className="flex flex-col md:flex-row gap-8 relative z-10">
            {/* Stats */}
            <div className="flex-shrink-0 text-center md:text-left min-w-[140px]">
               <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Users</div>
               <div className="text-5xl font-black text-white">{total}</div>
               <div className="text-xs text-zinc-400 mt-1">Calculated from Dataset</div>
            </div>

            {/* Characteristics */}
            <div className="flex-1">
               <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Group Characteristics</div>
               <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {overview?.characteristics || `Predominantly ${cohort.as_category} audience. High engagement potential with specific triggers around ${cohort.as_tags?.join(', ')}.`}
               </p>
               
               {/* Visual Distribution Bar */}
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                     <span>Happy Path ({overview?.distribution.happyPath || 20}%)</span>
                     <span>Most Likely ({overview?.distribution.baseline || 60}%)</span>
                     <span>Stress Test ({overview?.distribution.stressTest || 20}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden flex border border-zinc-800">
                     <div style={{width: `${overview?.distribution.happyPath || 20}%`}} className="bg-green-500/80"></div>
                     <div style={{width: `${overview?.distribution.baseline || 60}%`}} className="bg-blue-500/80"></div>
                     <div style={{width: `${overview?.distribution.stressTest || 20}%`}} className="bg-red-500/80"></div>
                  </div>
                  <div className="text-[10px] text-zinc-500 italic text-right">
                     {overview?.visualHint || "Ad Resistance: Low → High"}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const DNAModal: React.FC<{ cohort: AS_AudienceCohort, onClose: () => void }> = ({ cohort, onClose }) => {
   const [activeTab, setActiveTab] = useState<'DNA' | 'ROSTER'>('DNA');

   // Ensure archetypes exist (fallback if not generated yet)
   const defaultArchetypes: AS_CohortArchetype[] = [
      { id:'1', type:'HAPPY_PATH', name:'Demo User A', role:'Ideal', age:25, tags:['Ready'], context:'Ready to buy.', decisionWeights:{price:'Low', brand:'High', social:'High', function:'Medium'}, adResistance:'Low', adResistanceReason:'', cognitiveLoadPreference:'Low', triggers:['Sale'], frictions:['None'], switchingCost:'Low', difficultyRating:'Easy', difficultyReason:'', decisionPath:'', aiStrategyTip:'Sell hard.' },
      { id:'2', type:'BASELINE', name:'Demo User B', role:'Average', age:30, tags:['Cautious'], context:'Looking around.', decisionWeights:{price:'Medium', brand:'Medium', social:'Medium', function:'High'}, adResistance:'Medium', adResistanceReason:'', cognitiveLoadPreference:'Med', triggers:['Proof'], frictions:['Price'], switchingCost:'Med', difficultyRating:'Moderate', difficultyReason:'', decisionPath:'', aiStrategyTip:'Educate.' },
      { id:'3', type:'STRESS_TEST', name:'Demo User C', role:'Skeptic', age:40, tags:['No'], context:'Hates ads.', decisionWeights:{price:'High', brand:'Low', social:'Low', function:'High'}, adResistance:'High', adResistanceReason:'', cognitiveLoadPreference:'High', triggers:['None'], frictions:['Everything'], switchingCost:'High', difficultyRating:'Hard', difficultyReason:'', decisionPath:'', aiStrategyTip:'Give up.' },
   ];

   const archetypes = (cohort.as_archetypes && cohort.as_archetypes.length > 0) 
      ? cohort.as_archetypes 
      : defaultArchetypes;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
         <div className="relative w-full max-w-6xl bg-black border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white text-xl font-bold">🧬</div>
                  <div>
                     <h2 className="text-xl font-bold text-white">View Cohort DNA</h2>
                     <p className="text-xs text-zinc-400 uppercase tracking-widest">{cohort.as_name}</p>
                  </div>
               </div>
               
               {/* Tab Switcher */}
               <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  <button 
                     onClick={() => setActiveTab('DNA')}
                     className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'DNA' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                     Overview
                  </button>
                  <button 
                     onClick={() => setActiveTab('ROSTER')}
                     className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'ROSTER' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                     Full Roster ({cohort.as_personas.length})
                  </button>
               </div>

               <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                  &times;
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto bg-black">
               {activeTab === 'DNA' ? (
                  <div className="animate-fade-in">
                     <GroupOverviewCard cohort={cohort} />
                     
                     <div className="mb-4 text-sm font-bold text-zinc-500 uppercase tracking-widest">Typical Persona Archetypes</div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* We map specific types to ensure order: Happy -> Baseline -> Stress */}
                        {['HAPPY_PATH', 'BASELINE', 'STRESS_TEST'].map(type => {
                           const arch = archetypes.find(a => a.type === type) || archetypes[0];
                           return <DNAArchetypeCard key={type} archetype={arch as AS_CohortArchetype} />;
                        })}
                     </div>
                  </div>
               ) : (
                  <div className="animate-fade-in">
                      <PersonaGrid 
                         personas={cohort.as_personas} 
                         onSelect={() => {}} // No action needed on select here, just viewing
                         viewMode="list" 
                      />
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

// --- MAIN COMPONENT ---

const CohortManager: React.FC<CohortManagerProps> = ({ 
  cohorts, 
  onRefresh, 
  onSelectCohortForSim,
  variant = 'management',
  onSaveCohort,
  onDeleteCohort
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDNA, setViewingDNA] = useState<AS_AudienceCohort | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  // --- FILTERING ---
  const filteredCohorts = useMemo(() => {
     // STRICTLY "My Lab" logic: Only non-official cohorts
     let scopeCohorts = cohorts.filter(c => !c.as_isOfficial);

     if (searchQuery.trim()) {
        const lowerQ = searchQuery.toLowerCase();
        scopeCohorts = scopeCohorts.filter(c => 
           c.as_name.toLowerCase().includes(lowerQ) || 
           c.as_description.toLowerCase().includes(lowerQ)
        );
     }
     return scopeCohorts;
  }, [cohorts, searchQuery]);

  // --- ACTIONS ---
  const handleDelete = (id: string) => {
     if(confirm("Delete this cohort?")) {
        if (onDeleteCohort) onDeleteCohort(id);
        else AS_SimulatorEngine.deleteCohort(id); // Fallback for direct usage
        onRefresh();
     }
  };

  const handleCreateComplete = (newCohort: AS_AudienceCohort) => {
     if (onSaveCohort) onSaveCohort(newCohort);
     else AS_SimulatorEngine.saveCohort(newCohort);
     onRefresh();
     setIsBuilding(false);
  };

  return (
    <div className="flex h-full w-full animate-fade-in relative">
      
      {viewingDNA && (
         <DNAModal 
            cohort={viewingDNA} 
            onClose={() => setViewingDNA(null)} 
         />
      )}

      {isBuilding && (
         <AudienceBuilder 
            onComplete={handleCreateComplete}
            onCancel={() => setIsBuilding(false)}
         />
      )}

      {/* SIDEBAR */}
      <div className="w-72 border-r border-zinc-800 pr-6 hidden xl:flex flex-col pt-2 h-full sticky top-0 overflow-y-auto scrollbar-hide">
        
        {/* SEARCH */}
        <div className="relative mb-6">
           <span className="absolute left-3 top-2.5 text-zinc-500">🔍</span>
           <input 
              type="text" placeholder="Search..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-blue-500 outline-none transition-colors"
           />
        </div>

        {/* LAB CONTENT ONLY */}
        <div className="space-y-6 animate-fade-in">
            <div className="px-2">
                <button 
                onClick={() => setIsBuilding(true)}
                className="w-full mb-6 flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-white hover:border-orange-500 hover:bg-zinc-900 transition-all group"
                >
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform text-orange-500">+</div>
                <span className="text-xs font-bold uppercase tracking-wide">Create Custom</span>
                <span className="text-[9px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{COST_TABLE.CREATE_COHORT} Credits</span>
                </button>

                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">YOUR COHORTS</div>
                {filteredCohorts.length === 0 && <div className="text-zinc-500 text-xs italic">No custom cohorts.</div>}
                <div className="space-y-1">
                {filteredCohorts.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2 text-sm text-zinc-400 border border-transparent hover:border-zinc-800 rounded-lg hover:bg-zinc-900/50">
                        <span className="truncate max-w-[120px]">{c.as_name}</span>
                    </div>
                ))}
                </div>
            </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-32 h-full">
         <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/95 z-20 py-4 backdrop-blur-sm border-b border-zinc-800/50">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">My Lab</h2>
                <p className="text-zinc-400 text-sm">{filteredCohorts.length} Custom Cohorts</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCohorts.map(cohort => (
               <div 
                  key={cohort.id}
                  onClick={() => onSelectCohortForSim && onSelectCohortForSim(cohort)}
                  className={`
                     group relative h-[280px] flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl
                     ${variant === 'selection' ? 'h-56' : ''}
                  `}
               >
                  <CardBackground />
                  
                  {!onSelectCohortForSim && (
                     <button onClick={(e) => { e.stopPropagation(); handleDelete(cohort.id); }} className="absolute top-4 right-4 z-20 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl">&times;</button>
                  )}

                  <div className="p-6 h-full flex flex-col relative z-10">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shadow-lg">
                           {cohort.as_category?.includes('Beauty') ? '💄' : cohort.as_category?.includes('Home') ? '🏠' : cohort.as_category?.includes('Auto') ? '🚗' : cohort.as_category?.includes('Food') ? '🍔' : cohort.as_category?.includes('Edu') ? '📚' : '👥'}
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-white text-xl leading-tight truncate">{cohort.as_name}</h4>
                           <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-1 truncate">{cohort.as_category || 'General'}</p>
                        </div>
                     </div>
                     <div className="relative flex-1 flex flex-col justify-center px-2">
                        <p className="text-sm text-zinc-300 font-medium leading-relaxed italic border-l-2 border-orange-500/50 pl-4 py-2 line-clamp-4">
                           "{cohort.as_description}"
                        </p>
                     </div>
                     
                     {/* Tags/Traits Footer */}
                     <div className="mt-auto pt-4 flex gap-1 flex-wrap">
                        {cohort.as_tags?.slice(0, 3).map(tag => (
                           <span key={tag} className="text-[9px] font-bold bg-zinc-950 text-zinc-500 px-2 py-1 rounded border border-zinc-800">
                              {tag}
                           </span>
                        ))}
                     </div>
                  </div>

                  {onSelectCohortForSim ? (
                     <button className="absolute bottom-0 left-0 right-0 h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide uppercase shadow-[0_-10px_40px_rgba(0,0,0,0.5)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex items-center justify-center gap-2 z-20">
                        <span>Select Audience</span>
                        <span className="text-lg">✓</span>
                     </button>
                  ) : (
                     <button onClick={(e) => { e.stopPropagation(); setViewingDNA(cohort); }} className="absolute bottom-0 left-0 right-0 h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs tracking-wide uppercase shadow-[0_-10px_40px_rgba(0,0,0,0.5)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex items-center justify-center gap-2 z-20">
                        <span>View DNA</span>
                        <span className="text-lg">🧬</span>
                     </button>
                  )}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default CohortManager;
