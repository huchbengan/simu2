
import React from 'react';
import { Session } from '../types';

interface VaultCardProps {
  session: Session;
  onClick: () => void;
  className?: string;
}

const VaultCard: React.FC<VaultCardProps> = ({ session, onClick, className = '' }) => {
  const getKeyMetric = (session: Session) => {
    const lastAnalysis = session.analyses[session.analyses.length - 1];
    if (!lastAnalysis) return { value: '-', label: 'Pending', color: 'text-zinc-500' };

    if (lastAnalysis.type === 'VALIDATION') {
      const avgScore = Math.round(lastAnalysis.results.reduce((a, b) => a + b.score, 0) / lastAnalysis.results.length);
      let color = 'text-red-500';
      if (avgScore >= 70) color = 'text-green-500';
      else if (avgScore >= 40) color = 'text-yellow-500';
      return { value: avgScore, label: 'Score', color };
    } else {
      // Preference: Show Winner %
      const counts = lastAnalysis.results.reduce((acc, r) => {
         if (r.selectedOptionId) acc[r.selectedOptionId] = (acc[r.selectedOptionId] || 0) + 1;
         return acc;
      }, {} as Record<string, number>);
      const winnerId = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
      const winCount = counts[winnerId] || 0;
      const percentage = Math.round((winCount / lastAnalysis.results.length) * 100);
      return { value: `${percentage}%`, label: 'Consensus', color: 'text-orange-500' };
    }
  };

  const metric = getKeyMetric(session);
  const lastAnalysis = session.analyses[session.analyses.length - 1];
  const confidence = lastAnalysis?.confidenceScore || 0;
  // Use session.shortTitle if available, fallback to topicTitle or default
  const displayTitle = session.shortTitle || session.topicTitle || 'Untitled Report';

  return (
    <div 
      onClick={onClick}
      className={`
        relative group flex flex-col h-64 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden 
        bg-zinc-900 border-zinc-800 theme-card theme-border
        hover:border-zinc-600 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]
        ${className}
      `}
    >
      {/* Header: Short Title & Date */}
      <div className="p-4 flex flex-col items-center text-center border-b border-zinc-800/30 theme-border">
         <h3 className="font-semibold text-lg text-white theme-text leading-tight line-clamp-2">
            {displayTitle}
         </h3>
         <span className="text-xs font-normal text-zinc-500 theme-text-muted mt-2">
            {new Date(session.timestamp).toLocaleDateString()}
         </span>
      </div>

      {/* Center: Metric */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
         <div className={`text-5xl font-extrabold tracking-tighter ${metric.color}`}>
            {metric.value}
         </div>
         <div className="text-xs font-normal uppercase tracking-widest text-zinc-600 theme-text-muted mt-2">
            {metric.label}
         </div>
      </div>

      {/* Bottom: Context */}
      <div className="p-4 bg-black/20 border-t border-zinc-800/50 backdrop-blur-sm flex justify-between items-center theme-border">
         <div className="flex flex-col gap-1 overflow-hidden flex-1 mr-2">
            <span className="text-xs font-normal text-zinc-400 theme-text-muted truncate">
               👥 {session.cohortName}
            </span>
            <span className="text-xs font-normal text-zinc-500 theme-text-muted truncate">
               📁 {session.topicTitle?.split(':')[0] || 'Brief'}
            </span>
         </div>
         
         <div className={`text-xs font-normal px-2 py-1 rounded flex-shrink-0 ${confidence > 80 ? 'bg-blue-900/20 text-blue-400 border border-blue-900/30' : 'bg-zinc-800 text-zinc-500 theme-surface theme-text-muted border theme-border'}`}>
            {confidence}% Conf.
         </div>
      </div>
    </div>
  );
};

export default VaultCard;
