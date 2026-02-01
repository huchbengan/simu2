
import React from 'react';
import { AS_Persona, AnalysisResult } from '../types';

interface PersonaGridProps {
  personas: AS_Persona[];
  results?: AnalysisResult[];
  onSelect: (persona: AS_Persona) => void;
  loading?: boolean;
  viewMode: 'grid' | 'list';
}

const PersonaGrid: React.FC<PersonaGridProps> = ({ personas, results, onSelect, loading, viewMode }) => {
  if (loading) {
    return (
      <div className={`gap-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col'}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`${viewMode === 'grid' ? 'h-64' : 'h-24'} bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse`}></div>
        ))}
      </div>
    );
  }

  // --- LIST VIEW (Enhanced for Nuwa) ---
  if (viewMode === 'list') {
    return (
      <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 mb-20 shadow-lg animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-black text-xs font-normal uppercase text-zinc-500 tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">Identity</th>
                <th scope="col" className="px-6 py-4">Demographics</th>
                <th scope="col" className="px-6 py-4 w-1/5">Mindset (OS)</th>
                <th scope="col" className="px-6 py-4">Nuwa Radar</th>
                <th scope="col" className="px-6 py-4 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {personas.map((p) => {
                const result = results?.find(r => r.personaId === p.id);
                return (
                  <tr 
                    key={p.id} 
                    onClick={() => onSelect(p)}
                    className="hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://picsum.photos/seed/${p.id}/40/40`} 
                          alt={p.name}
                          className="w-10 h-10 rounded-full border border-zinc-700 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <div className="font-semibold text-base text-zinc-200 group-hover:text-orange-400 transition-colors">{p.name}</div>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{p.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Demographics */}
                    <td className="px-6 py-4">
                      <div className="text-zinc-300 text-sm font-medium">{p.occupation}</div>
                      <div className="text-xs text-zinc-500">{p.age} • {p.gender} • {p.location}</div>
                      <div className="text-[10px] text-zinc-600 mt-1">{p.incomeLevel}</div>
                    </td>

                    {/* Mindset / OS */}
                    <td className="px-6 py-4">
                       {p.nuwa_mindset && (
                          <div className="mb-1 text-xs font-bold text-zinc-400">"{p.nuwa_mindset}"</div>
                       )}
                       {p.nuwa_innerMonologue ? (
                          <div className="text-xs italic text-zinc-500 line-clamp-2">OS: {p.nuwa_innerMonologue}</div>
                       ) : (
                          <span className="text-zinc-600 text-xs">-</span>
                       )}
                    </td>

                    {/* Nuwa Radar */}
                    <td className="px-6 py-4">
                       {p.nuwa_radar ? (
                          <div className="grid grid-cols-4 gap-2 w-48">
                             {Object.entries(p.nuwa_radar).map(([key, val]) => (
                                <div key={key} className="text-center">
                                   <div className="text-[8px] font-bold text-zinc-600">{key}</div>
                                   <div className={`text-xs font-bold ${(val as number) > 70 ? 'text-orange-400' : 'text-zinc-400'}`}>{val as number}</div>
                                </div>
                             ))}
                          </div>
                       ) : (
                          <span className="text-xs text-zinc-600">Legacy Profile</span>
                       )}
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 text-center font-mono">
                      {result ? (
                        <span className={`font-bold ${
                          result.score >= 70 ? 'text-green-500' : result.score >= 40 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {result.score}
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- GRID VIEW (Default) ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20 animate-fade-in">
      {personas.map((p) => {
        const result = results?.find(r => r.personaId === p.id);
        
        let borderClass = "border-zinc-800";
        if (result) {
          if (result.sentiment === 'Positive') borderClass = "border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
          else if (result.sentiment === 'Negative') borderClass = "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
          else borderClass = "border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
        }

        return (
          <div 
            key={p.id} 
            onClick={() => onSelect(p)}
            className={`bg-zinc-900 rounded-xl p-5 border cursor-pointer hover:bg-zinc-800 transition-all duration-200 ${borderClass} flex flex-col gap-3 relative group hover:-translate-y-1`}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <img 
                src={`https://picsum.photos/seed/${p.id}/64/64`} 
                alt={p.name}
                className="w-12 h-12 rounded-full border-2 border-zinc-700 group-hover:border-orange-500/50 transition-colors"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base text-zinc-100 truncate group-hover:text-orange-400 transition-colors">{p.name}</h3>
                <p className="text-xs text-zinc-400 truncate">{p.age} • {p.occupation}</p>
                {p.nuwa_mindset && (
                   <span className="inline-block mt-1 text-[10px] font-normal bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-800 truncate max-w-full">
                      {p.nuwa_mindset}
                   </span>
                )}
              </div>
              {result && (
                 <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    result.score >= 70 ? 'bg-green-900/30 text-green-400' : result.score >= 40 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
                 }`}>
                    {result.score}
                 </div>
              )}
            </div>

            {/* Radar Mini-Grid */}
            {p.nuwa_radar && (
                <div className="grid grid-cols-4 gap-1 text-center bg-black/40 p-2 rounded-lg border border-zinc-800/50">
                    {Object.entries(p.nuwa_radar).map(([k, v]) => (
                        <div key={k}>
                            <div className="text-[8px] text-zinc-500">{k}</div>
                            <div className={`text-xs font-bold ${(v as number) > 80 ? 'text-orange-400' : 'text-zinc-300'}`}>{v as number}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Analysis Result or Tags */}
            {result ? (
              <div className="mt-auto pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                   <span className={`w-2 h-2 rounded-full ${
                      result.sentiment === 'Positive' ? 'bg-green-500' : result.sentiment === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'
                   }`}></span>
                   <span className="text-xs font-medium text-zinc-300">{result.sentiment}</span>
                </div>
                <p className="text-sm font-normal text-zinc-300 italic line-clamp-2 leading-relaxed">
                  "{result.keyConcernOrPraise}"
                </p>
              </div>
            ) : (
               <div className="mt-auto flex flex-wrap gap-1 pt-2">
                  <span className="text-xs font-normal bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 border border-zinc-700">
                     {p.education}
                  </span>
                  <span className="text-xs font-normal bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 border border-zinc-700">
                     {p.incomeLevel}
                  </span>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PersonaGrid;
