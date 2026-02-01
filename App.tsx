
import React, { useState, useEffect } from 'react';
import { AppState, Session, User, SimulationConfig, MB_MasterBrief, AS_AudienceCohort, TemplateDefinition, ExperimentType, AS_SimulationSnapshot, AnalysisRecord, PlanLevel, COST_TABLE } from './types';
import { AS_runSimulation } from './services/geminiService';
import { api } from './services/api'; 
import { AS_SimulatorEngine } from './services/AS_SimulatorEngine';

import Dashboard from './components/Dashboard';
import GlobalSidebar from './components/GlobalSidebar';
import LandingPage from './components/LandingPage';
import CohortManager from './components/CohortManager';
import TopicLibrary from './components/TopicLibrary';
import TestSquare from './components/TestSquare';
import ExperimentTemplateLibrary from './components/ExperimentTemplateLibrary';
import StrategyVault from './components/StrategyVault';
import UniversalAnalysisDashboard from './components/LandingPageAnalysisDashboard'; 
import ExperimentConfigurator from './components/ExperimentConfigurator'; 
import PayPalModal from './components/PayPalModal'; 

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('simucrowd_theme') as 'light' | 'dark') || 'dark');
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // --- ISOLATED DATA STATE ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [briefs, setBriefs] = useState<MB_MasterBrief[]>([]);
  const [cohorts, setCohorts] = useState<AS_AudienceCohort[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  
  // --- RUNTIME STATE ---
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState<any | null>(null);
  
  // --- PAYMENT STATE ---
  const [showPaymentModal, setShowPaymentModal] = useState<PlanLevel | null>(null);

  // --- CONFIGURATOR STATE ---
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
     template: null,
     mode: 'VALIDATION',
     cohort: null,
     activeBriefSnapshot: null,
     customInput: ''
  });

  // Load Data on Mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const [sess, brf, coh, art] = await Promise.all([
       api.sessions.list(),
       api.assets.briefs.list(),
       api.assets.cohorts.list(),
       api.community.getArticles()
    ]);
    setSessions(sess);
    setBriefs(brf);
    setCohorts(coh);
    setArticles(art);
    // Sync user credits if logged in
    const freshUser = api.auth.getCurrentUser();
    if (freshUser) setUser(freshUser);
  };

  const handleLogin = async () => {
    try {
       const userData = await api.auth.login('demo@simucrowd.ai');
       setUser(userData);
       setAppState(AppState.DASHBOARD); 
    } catch (e) {
       console.error("Login failed", e);
    }
  };

  const handleUpgrade = (plan: PlanLevel) => {
     setShowPaymentModal(plan);
  };

  const handlePaymentSuccess = (updatedUser: User) => {
     setUser(updatedUser);
     alert(`Success! You are now on the ${updatedUser.plan_level} plan with ${updatedUser.points} credits.`);
  };

  // --- ERROR HANDLER FOR PAYMENTS ---
  const handleApiError = (error: any) => {
     if (error.message === 'INSUFFICIENT_FUNDS') {
        alert("Insufficient Credits. Please upgrade or top up.");
        setShowPaymentModal('PRO'); // Default upsell
     } else if (error.message.includes('PLAN_LIMIT')) {
        alert(error.message);
        setShowPaymentModal('PRO_PLUS'); // Upsell to higher tier
     } else {
        alert("Operation failed: " + error.message);
     }
  };

  const handleRunAnalysis = async (snapshotOverride?: AS_SimulationSnapshot) => {
    if (!simConfig.cohort || !simConfig.template) return;
    if (!user) return;

    // 1. Credit Pre-check (Frontend Optimization)
    if (user.points < COST_TABLE.RUN_SIMULATION) {
       handleApiError(new Error('INSUFFICIENT_FUNDS'));
       return;
    }

    const effectiveSnapshot = snapshotOverride || simConfig.activeBriefSnapshot;
    if (!effectiveSnapshot) {
       alert("No Brief Snapshot selected.");
       return;
    }
    
    // 2. Prepare Session Object
    const newSession: Session = {
      id: `sess_${Date.now()}`,
      timestamp: Date.now(),
      cohortId: simConfig.cohort.id,
      cohortName: simConfig.cohort.as_name,
      cohortLanguage: simConfig.cohort.as_language,
      personas: simConfig.cohort.as_personas,
      analyses: [],
      templateId: simConfig.template.id,
      topicId: effectiveSnapshot.sourceBriefId,
      topicTitle: effectiveSnapshot.frozenTitle
    };

    setAppState(AppState.SIMULATION_RUNNING);
    setLoadingProgress(0);
    
    try {
      // 3. START SESSION (API Deducts Credits Here)
      await api.sessions.create(newSession);
      
      // Update local credit state immediately
      const freshUser = api.auth.getCurrentUser();
      if(freshUser) setUser(freshUser);

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);

      // 4. EXECUTE SIMULATION (Kuafu Engine - Client Side for Demo)
      const { results, confidenceScore, summary, structuredInsights, actionItems } = await AS_runSimulation(
        newSession.personas, 
        simConfig.mode,
        effectiveSnapshot, 
        simConfig.template.id,
        newSession.cohortLanguage,
        (p) => setLoadingProgress(p)
      );
      
      // 5. SAVE RESULTS
      const newRecord: AnalysisRecord = {
        id: `an_${Date.now()}`,
        timestamp: Date.now(),
        type: simConfig.mode,
        directive: effectiveSnapshot.frozenContent,
        options: effectiveSnapshot.options,
        images: effectiveSnapshot.frozenImages,
        results,
        confidenceScore,
        summary,
        shortTitle: effectiveSnapshot.frozenTitle,
        followUps: [],
        structuredInsights,
        actionItems
      };

      const updatedSession = { ...newSession, analyses: [newRecord] };
      await api.sessions.update(updatedSession);
      
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      setCurrentSession(updatedSession);
      setActiveAnalysisId(newRecord.id);
      setAppState(AppState.SIMULATION_RESULTS);

    } catch (error: any) {
      console.error(error);
      if (error.message === 'INSUFFICIENT_FUNDS') {
         handleApiError(error);
      } else {
         alert("Simulation failed.");
      }
      setAppState(AppState.SIMULATION_SETUP);
    }
  };

  const handleConfigUpdate = (updates: Partial<SimulationConfig>) => {
     setSimConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSaveCohort = async (c: AS_AudienceCohort) => {
     try {
        await api.assets.cohorts.save(c);
        refreshData();
     } catch (e: any) {
        handleApiError(e);
     }
  };

  if (appState === AppState.LANDING) {
     return (
        <>
         <LandingPage onLogin={handleLogin} onUpgradeClick={handleUpgrade} />
         {showPaymentModal && (
            <PayPalModal 
               plan={showPaymentModal} 
               onClose={() => setShowPaymentModal(null)} 
               onSuccess={(u) => { 
                  handlePaymentSuccess(u); 
                  handleLogin(); 
               }} 
            />
         )}
        </>
     );
  }

  return (
    <div className="min-h-screen theme-bg theme-text font-sans flex transition-colors duration-300">
      
      {showPaymentModal && (
         <PayPalModal 
            plan={showPaymentModal} 
            onClose={() => setShowPaymentModal(null)} 
            onSuccess={handlePaymentSuccess} 
         />
      )}

      <GlobalSidebar 
         user={user} 
         activeState={appState} 
         onNavigate={setAppState} 
         onLogout={() => { setUser(null); setAppState(AppState.LANDING); }} 
         theme={theme} 
         onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
         isCollapsed={isSidebarCollapsed} 
         onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} p-4 lg:p-8 overflow-y-auto h-screen scroll-smooth`}>
         
         {appState === AppState.MY_USERS && (
            <CohortManager 
               cohorts={cohorts} 
               onRefresh={refreshData}
               onSaveCohort={handleSaveCohort}
               onDeleteCohort={async (id) => { await api.assets.cohorts.delete(id); refreshData(); }}
            />
         )}

         {appState === AppState.TOPIC_LIBRARY && (
            <TopicLibrary
              topics={briefs}
              onRefresh={refreshData}
            />
         )}

         {appState === AppState.SIMULATION_SETUP && (
            <ExperimentConfigurator 
               config={simConfig}
               onUpdateConfig={handleConfigUpdate}
               onLaunch={handleRunAnalysis}
               sessions={sessions}
               cohorts={cohorts}
               topics={briefs as any} 
               onSaveCohort={handleSaveCohort}
               onDeleteCohort={async (id) => { await api.assets.cohorts.delete(id); refreshData(); }}
               onSaveTopic={async (t) => { await api.assets.briefs.save(t); refreshData(); }}
               onDeleteTopic={async (id) => { await api.assets.briefs.delete(id); refreshData(); }}
               onRefresh={refreshData}
            />
         )}

         {appState === AppState.SIMULATION_RESULTS && currentSession && (
             <UniversalAnalysisDashboard 
                experimentType={currentSession.analyses[0].type}
                personas={currentSession.personas}
                results={currentSession.analyses[0].results}
                structuredInsights={currentSession.analyses[0].structuredInsights}
                onSelectPersona={setSelectedPersona}
             />
         )}
         
         {appState === AppState.DASHBOARD && (
            <ExperimentTemplateLibrary 
                onSelectTemplate={(t, m) => {
                   setSimConfig(prev => ({...prev, template: t, mode: m}));
                   setAppState(AppState.SIMULATION_SETUP);
                }}
                sessions={sessions}
            />
         )}

         {appState === AppState.STRATEGY_VAULT && (
             <StrategyVault 
                sessions={sessions}
                onSelectSession={(s) => {
                   setCurrentSession(s);
                   setAppState(AppState.SIMULATION_RESULTS);
                }}
             />
         )}
         
         {appState === AppState.TEST_SQUARE && (
             <TestSquare articles={articles} />
         )}

      </div>
    </div>
  );
};

export default App;
