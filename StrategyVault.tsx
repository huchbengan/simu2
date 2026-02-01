
import React, { useState } from 'react';
import { Session } from '../types';
import VaultCard from './VaultCard';

interface StrategyVaultProps {
  sessions: Session[];
  onSelectSession: (session: Session) => void;
}

type ViewMode = 'TIMELINE' | 'AUDIENCE' | 'BRIEF';

const StrategyVault: React.FC<StrategyVaultProps> = ({ sessions, onSelectSession }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('TIMELINE');

  // --- Grouping Logic ---
  
  const renderGroupedView = (groupBy: 'AUDIENCE' | 'BRIEF') => {
    const groups: Record<string, Session[]> = {};
    
    sessions.forEach(s => {
       const key = groupBy === 'AUDIENCE' 
          ? s.cohortName 
          : (s.topicTitle?.split(':')[0].trim() || "Untitled Brief");
       if (!groups[key]) groups[key] = [];
       groups[key].push(s);
    });

    const sortedKeys = Object.keys(groups).sort();

    return (
       <div className="space-y-12">
          {sortedKeys.map(groupName => (
             <div key={groupName} className="animate-fade-in">
                <div className="flex items-center gap-3 mb-6 px-1">
                   <h3 className="text-lg font-semibold text-white theme-text flex items-center gap-3">
                      {groupBy === 'AUDIENCE' ? '👥' : '📁'} {groupName}
                      <span className="text-xs font-normal text-zinc-500 theme-text-muted bg-zinc-900 theme-surface px-2.5 py-0.5 rounded-full border border-zinc-800 theme-border">
                         {groups[groupName].length} Reports
                      </span>
                   </h3>
                   <div className="h-px bg-zinc-800 theme-border flex-1"></div>
                   <button className="text-xs font-normal text-zinc-500 theme-text-muted hover:text-white transition-colors">View All &rarr;</button>
                </div>
                
                {/* Horizontal Scroll Container */}
                <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4">
                   {groups[groupName].map(session => (
                      <div key={session.id} className="min-w-[280px] w-[280px]">
                         <VaultCard session={session} onClick={() => onSelectSession(session)} />
                      </div>
                   ))}
                   {/* "Add New" placeholder for flow */}
                   <div className="min-w-[100px] flex items-center justify-center">
                      <button className="w-12 h-12 rounded-full bg-zinc-900 theme-surface border border-zinc-800 theme-border flex items-center justify-center text-zinc-600 theme-text-muted hover:text-white theme-text hover:border-zinc-600 transition-all">
                         &rarr;
                      </button>
                   </div>
                </div>
             </div>
          ))}
       </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="animate-fade-in w-full pb-32 relative">
      
      {/* Header & Controls */}
      <div className="sticky top-0 z-30 bg-black/80 theme-bg backdrop-blur-md py-6 mb-8 -mx-4 px-4 lg:-mx-8 lg:px-8 border-b border-zinc-800/50 theme-border">
         <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 max-w-6xl mx-auto w-full">
            <div>
               <h2 className="text-2xl font-bold text-white theme-text flex items-center gap-3">
                  Strategy Vault 
                  <span className="text-xs font-normal text-zinc-500 theme-text-muted bg-zinc-900 theme-surface px-2.5 py-1 rounded border border-zinc-800 theme-border">
                     {sessions.length} Assets
                  </span>
               </h2>
            </div>
            
            {/* Toggle */}
            <div className="bg-zinc-900 theme-surface p-1 rounded-lg border border-zinc-800 theme-border flex shadow-sm">
               <button 
                  onClick={() => setViewMode('TIMELINE')}
                  className={`px-4 py-2 text-xs font-normal rounded-md transition-all flex items-center gap-2 ${viewMode === 'TIMELINE' ? 'bg-zinc-800 theme-card text-white theme-text shadow-sm font-semibold' : 'text-zinc-500 theme-text-muted hover:text-zinc-300'}`}
               >
                  <span>⏱</span> Timeline
               </button>
               <div className="w-px bg-zinc-800 theme-border my-1 mx-1"></div>
               <button 
                  onClick={() => setViewMode('AUDIENCE')}
                  className={`px-4 py-2 text-xs font-normal rounded-md transition-all flex items-center gap-2 ${viewMode === 'AUDIENCE' ? 'bg-zinc-800 theme-card text-white theme-text shadow-sm font-semibold' : 'text-zinc-500 theme-text-muted hover:text-zinc-300'}`}
               >
                  <span>👥</span> Audience
               </button>
               <button 
                  onClick={() => setViewMode('BRIEF')}
                  className={`px-4 py-2 text-xs font-normal rounded-md transition-all flex items-center gap-2 ${viewMode === 'BRIEF' ? 'bg-zinc-800 theme-card text-white theme-text shadow-sm font-semibold' : 'text-zinc-500 theme-text-muted hover:text-zinc-300'}`}
               >
                  <span>📁</span> Master Briefs
               </button>
            </div>
         </div>
      </div>

      {sessions.length === 0 && (
         <div className="text-center py-24 bg-zinc-900/30 theme-surface rounded-3xl border border-dashed border-zinc-800 theme-border max-w-2xl mx-auto mt-12">
            <div className="text-4xl mb-4 opacity-50">📭</div>
            <h3 className="text-xl font-bold text-white theme-text mb-2">Vault is Empty</h3>
            <p className="text-zinc-500 theme-text-muted mb-6 text-sm">Run your first simulation to start building your asset library.</p>
         </div>
      )}

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
         {viewMode === 'TIMELINE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
               {sessions.map(session => (
                  <VaultCard key={session.id} session={session} onClick={() => onSelectSession(session)} />
               ))}
            </div>
         )}

         {viewMode !== 'TIMELINE' && renderGroupedView(viewMode)}
      </div>

    </div>
  );
};

export default StrategyVault;
