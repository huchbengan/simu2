
import React from 'react';
import { AppState, User } from '../types';

interface GlobalSidebarProps {
  user: User | null;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const GlobalSidebar: React.FC<GlobalSidebarProps> = ({ 
  user,
  activeState,
  onNavigate,
  onLogout,
  theme,
  onToggleTheme,
  isCollapsed,
  onToggleCollapse
}) => {
  if (!user) return null;

  const NavItem = ({ state, label, icon }: { state: AppState, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => onNavigate(state)}
      title={isCollapsed ? label : undefined}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-2.5 rounded-xl transition-all mb-1 ${
        activeState === state 
          ? 'bg-orange-600/10 text-orange-500 border border-orange-900/50 shadow-[0_0_10px_rgba(234,88,12,0.1)]' 
          : 'text-zinc-400 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-800 border border-transparent'
      }`}
    >
      <span className={`flex-shrink-0 ${activeState === state ? 'text-orange-500' : 'text-zinc-500 group-hover:text-white'}`}>{icon}</span>
      {!isCollapsed && <span className="font-normal text-sm whitespace-nowrap overflow-hidden">{label}</span>}
    </button>
  );

  const SectionHeader = ({ label }: { label: string }) => (
     !isCollapsed ? (
        <div className="text-xs font-normal text-zinc-600 theme-text-muted uppercase px-4 mb-2 mt-6 tracking-widest">{label}</div>
     ) : (
        <div className="h-px bg-zinc-800 mx-3 my-4"></div>
     )
  );

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-black theme-sidebar border-r border-zinc-800 flex flex-col h-screen fixed left-0 top-0 z-40 hidden lg:flex`}>
      {/* Header */}
      <div className={`p-6 border-b border-zinc-800 theme-border flex items-center relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
             <h1 className="text-xl font-bold text-white theme-text tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center text-xs text-white shadow-lg shadow-orange-900/50">S</div>
                <span>SimuCrowd</span>
             </h1>
        )}
        {isCollapsed && (
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-orange-900/50">S</div>
        )}
      </div>
      
      {/* Toggle Button */}
      <button 
        onClick={onToggleCollapse}
        className="absolute -right-3 top-9 bg-zinc-900 border border-zinc-700 text-zinc-400 rounded-full p-1 hover:text-white hover:bg-zinc-700 transition-colors z-50 shadow-md group"
      >
        {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
        )}
      </button>
      
      {/* Navigation */}
      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        
        {/* WORKSPACE SECTION */}
        <SectionHeader label="Workspace" />
        
        <NavItem 
          state={AppState.DASHBOARD} 
          label="Solution Center" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
        />
        
        <NavItem 
          state={AppState.TOPIC_LIBRARY} 
          label="Master Briefs" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
        />

        <NavItem 
          state={AppState.MY_USERS} 
          label="Audience Simulator" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
        />

        {/* ASSETS SECTION */}
        <SectionHeader label="Assets" />

        <NavItem 
          state={AppState.STRATEGY_VAULT} 
          label="Strategy Vault" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
        />

        {/* COMMUNITY SECTION */}
        <SectionHeader label="Community" />

        <NavItem 
          state={AppState.TEST_SQUARE} 
          label="Public Reports" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>}
        />
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-zinc-800 theme-border">
         {!isCollapsed ? (
             <>
                <div className="px-2 mb-3 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 theme-text-muted font-medium">Appearance</span>
                    <button 
                    onClick={onToggleTheme}
                    className="flex items-center gap-1.5 bg-zinc-900 theme-surface px-2 py-1 rounded-md border border-zinc-800 theme-border text-zinc-400 theme-text hover:text-white transition-colors"
                    >
                    {theme === 'dark' ? (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.23l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M12 18.75a6.75 6.75 0 110-13.5 6.75 6.75 0 010 13.5z" /></svg>
                        <span>Light</span>
                        </>
                    ) : (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                        <span>Dark</span>
                        </>
                    )}
                    </button>
                </div>
                <div className="px-2 mb-3 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 theme-text-muted font-medium">Remaining Credits</span>
                    <span className="text-orange-400 font-bold bg-orange-900/20 px-2 py-0.5 rounded-full border border-orange-900/50">{user.points}</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900 theme-surface border border-zinc-800 theme-border">
                <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white theme-text truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 theme-text-muted truncate">{user.email}</p>
                </div>
                <button onClick={onLogout} className="text-zinc-500 theme-text-muted hover:text-white theme-text">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                    </svg>
                </button>
                </div>
            </>
         ) : (
            <div className="flex flex-col items-center gap-4">
                 <button 
                    onClick={onToggleTheme}
                    className="w-8 h-8 flex items-center justify-center bg-zinc-900 theme-surface rounded-md border border-zinc-800 theme-border text-zinc-400 theme-text hover:text-white transition-colors"
                    title="Toggle Theme"
                 >
                    {theme === 'dark' ? (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.23l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M12 18.75a6.75 6.75 0 110-13.5 6.75 6.75 0 010 13.5z" /></svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                    )}
                 </button>
                 <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-zinc-700" title={user.name} />
                 <button onClick={onLogout} className="text-zinc-500 theme-text-muted hover:text-white theme-text" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                    </svg>
                 </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default GlobalSidebar;
