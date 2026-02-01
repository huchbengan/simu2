import React from 'react';
import { Session } from '../types';

interface HistorySidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (session: Session) => void;
  onNewSession: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewSession,
  onDeleteSession
}) => {
  return (
    <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 hidden lg:flex">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white mb-4 tracking-tight flex items-center gap-2">
           <span className="text-blue-500">❖</span> SimuCrowd
        </h1>
        <button
          onClick={onNewSession}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          New Simulation
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sessions.length === 0 && (
          <div className="text-center text-slate-500 py-10 text-sm">
            No history yet. <br/>Start a simulation!
          </div>
        )}
        
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session)}
            className={`group p-3 rounded-xl cursor-pointer transition-all border ${
              currentSessionId === session.id 
                ? 'bg-slate-800 border-slate-700 shadow-md' 
                : 'bg-transparent border-transparent hover:bg-slate-900'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-mono text-slate-500">
                {new Date(session.timestamp).toLocaleDateString()}
              </span>
              <button 
                onClick={(e) => onDeleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1"
                title="Delete Session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 mb-1">
              {session.topicTitle || session.cohortName || 'Untitled Simulation'}
            </h3>
            <div className="flex gap-2 items-center">
              <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                {session.cohortLanguage}
              </span>
              <span className="text-[10px] text-slate-500">
                {session.analyses.length} Reports
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySidebar;