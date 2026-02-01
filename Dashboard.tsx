

import React from 'react';
import { AnalysisResult, AS_Persona, ExperimentOption, ExperimentType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardProps {
  type: ExperimentType;
  personas: AS_Persona[];
  results: AnalysisResult[];
  options?: ExperimentOption[];
  confidenceScore?: number;
  onFilterSentiment: (sentiment: string | null) => void;
  activeFilter: string | null;
}

const COLORS = {
  Positive: '#22c55e', // Green 500
  Neutral: '#eab308',  // Yellow 500
  Negative: '#ef4444', // Red 500
};

const Dashboard: React.FC<DashboardProps> = ({ 
  type,
  personas, 
  results, 
  options,
  confidenceScore = 85,
  onFilterSentiment,
  activeFilter 
}) => {
  // 1. Data Prep
  const sentimentCounts = results.reduce((acc, curr) => {
    acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Positive', value: sentimentCounts['Positive'] || 0 },
    { name: 'Neutral', value: sentimentCounts['Neutral'] || 0 },
    { name: 'Negative', value: sentimentCounts['Negative'] || 0 },
  ].filter(d => d.value > 0);

  // Preference Data (Votes)
  const voteData = options ? options.map(opt => {
    const votes = results.filter(r => r.selectedOptionId === opt.id).length;
    return {
      name: opt.title,
      id: opt.id,
      votes: votes,
      percentage: Math.round((votes / results.length) * 100)
    };
  }).sort((a, b) => b.votes - a.votes) : [];

  const winningOption = voteData.length > 0 ? voteData[0] : null;

  // Average Score
  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) || 0;

  return (
    <div className="w-full mb-8 space-y-6">
       
       {/* Top Metrics Bar */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main KPI: Acceptance Score (Validation) OR Winner (Preference) */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-lg flex items-center justify-between relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-xs font-normal text-zinc-500 uppercase tracking-wider">
                  {type === 'VALIDATION' ? 'Acceptance Score' : 'Winning Option'}
                </p>
                {type === 'VALIDATION' ? (
                  <p className={`text-4xl font-extrabold mt-1 ${
                     avgScore >= 70 ? 'text-green-500' : avgScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                  }`}>{avgScore}<span className="text-xl text-zinc-600 font-normal">/100</span></p>
                ) : (
                  <div className="mt-1">
                    <p className="text-xl font-bold text-white truncate max-w-[200px]">{winningOption?.name || 'N/A'}</p>
                    <p className="text-sm text-orange-500 font-medium">{winningOption?.percentage}% of votes</p>
                  </div>
                )}
             </div>
             <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   {type === 'VALIDATION' 
                     ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                     : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                   }
                </svg>
             </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-lg flex items-center justify-between">
             <div>
                <p className="text-xs font-normal text-zinc-500 uppercase tracking-wider">Reliability</p>
                <div className="flex items-baseline gap-2 mt-1">
                   <p className="text-4xl font-extrabold text-blue-500">{confidenceScore}%</p>
                   {confidenceScore > 80 && <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900">High</span>}
                </div>
             </div>
             <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
          </div>

          {/* Quick Filter */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-lg flex flex-col justify-center">
             <p className="text-xs font-normal text-zinc-500 uppercase tracking-wider mb-2">Filter by Sentiment</p>
             <div className="flex gap-2">
                {(['Positive', 'Neutral', 'Negative'] as const).map(sent => (
                   <button
                     key={sent}
                     onClick={() => onFilterSentiment(activeFilter === sent ? null : sent)}
                     className={`flex-1 py-2 rounded-lg text-xs font-normal transition-all border ${
                        activeFilter === sent 
                        ? sent === 'Positive' ? 'bg-green-600 text-white border-green-500' 
                          : sent === 'Negative' ? 'bg-red-600 text-white border-red-500'
                          : 'bg-yellow-600 text-white border-yellow-500'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                     }`}
                   >
                      {sent}
                   </button>
                ))}
             </div>
          </div>
       </div>

       {/* Detailed Charts */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-80">
        
        {/* Left Chart: Sentiment (Validation) OR Votes (Preference) */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-lg">
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">
             {type === 'VALIDATION' ? 'Sentiment Distribution' : 'Option Preference'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'VALIDATION' ? (
               <PieChart>
                  <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data) => onFilterSentiment(activeFilter === data.name ? null : data.name)}
                  className="cursor-pointer"
                  >
                  {pieData.map((entry, index) => (
                     <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name as keyof typeof COLORS]} 
                        stroke={activeFilter === entry.name ? '#fff' : 'none'}
                        strokeWidth={2}
                        opacity={activeFilter && activeFilter !== entry.name ? 0.3 : 1}
                     />
                  ))}
                  </Pie>
                  <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                  itemStyle={{ color: '#f4f4f5' }}
                  />
                  <Legend />
               </PieChart>
            ) : (
               <BarChart data={voteData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fill: '#a1a1aa', fontSize: 10}} />
                  <Tooltip
                     cursor={{fill: '#27272a'}}
                     contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                  />
                  <Bar dataKey="votes" fill="#ea580c" radius={[0, 4, 4, 0]} barSize={30}>
                     {voteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ea580c' : '#52525b'} />
                     ))}
                  </Bar>
               </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Right Chart: Purchase Intent or Secondary Metric */}
        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-lg">
          <h3 className="text-lg font-semibold text-zinc-300 mb-2">Decision Confidence</h3>
          {/* Using intent data as a proxy for decision confidence for now */}
          <div className="h-full flex items-center justify-center">
             <div className="text-center">
                <div className="text-5xl mb-2">🎯</div>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                   {type === 'PREFERENCE' 
                     ? "The 'Winner' reflects the option with the highest alignment to persona needs." 
                     : "High agreement scores indicate low market risk for this concept."}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;