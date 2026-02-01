import React, { useState, useEffect } from 'react';
import { SimulationConfig, TemplateDefinition, AS_AudienceCohort, MB_MasterBrief, ExperimentType, Session, AS_SimulationSnapshot } from '../types';
import { AS_SimulatorEngine } from '../services/AS_SimulatorEngine';
import ExperimentTemplateLibrary from './ExperimentTemplateLibrary';
import CohortManager from './CohortManager';
import TopicLibrary from './TopicLibrary';

interface ExperimentConfiguratorProps {
  config: SimulationConfig;
  onUpdateConfig: (updates: Partial<SimulationConfig>) => void;
  onLaunch: (snapshot?: AS_SimulationSnapshot) => void;
  // Data for the libraries
  sessions: Session[];
  cohorts: AS_AudienceCohort[];
  topics: MB_MasterBrief[];
  // Handlers for data management within libraries
  onSaveCohort: (c: AS_AudienceCohort) => void;
  onDeleteCohort: (id: string) => void;
  onSaveTopic: (t: MB_MasterBrief) => void;
  onDeleteTopic: (id: string) => void;
  onRefresh: () => void;
}

type Step = 'TEMPLATE' | 'AUDIENCE' | 'CONTENT';

const ExperimentConfigurator: React.FC<ExperimentConfiguratorProps> = ({
  config,
  onUpdateConfig,
  onLaunch,
  sessions,
  cohorts,
  topics,
  onSaveCohort,
  onDeleteCohort,
  onSaveTopic,
  onDeleteTopic,
  onRefresh
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('TEMPLATE');

  // Ensure we start at the right step if data is missing
  useEffect(() => {
    if (!config.template) setCurrentStep('TEMPLATE');
    else if (!config.cohort) setCurrentStep('AUDIENCE');
    else setCurrentStep('CONTENT');
  }, []); 

  // --- ACTIONS ---

  const handleTemplateSelect = (template: TemplateDefinition, mode: ExperimentType) => {
    onUpdateConfig({ template, mode, compareTopics: [] }); // Reset comparison data on new template
    setCurrentStep('AUDIENCE');
  };

  const handleCohortSelect = (cohort: AS_AudienceCohort) => {
    onUpdateConfig({ cohort });
    setCurrentStep('CONTENT');
  };

  // Logic for Step 3: Content Selection
  // If Validation: Single Select -> Launch
  // If Preference: Multi Select -> Add to Tray -> Launch
  const handleTopicSelect = (topic: MB_MasterBrief) => {
    if (config.mode === 'VALIDATION') {
        // Create Snapshot immediately
        const snapshot = AS_SimulatorEngine.createSnapshotFromBrief(topic);
        onUpdateConfig({ activeBriefSnapshot: snapshot });
        
        // Trigger Launch with the snapshot to avoid state race conditions
        setTimeout(() => onLaunch(snapshot), 100); 
    } else {
        // PREFERENCE (Multi-select)
        const currentList = config.compareTopics || [];
        const exists = currentList.find(t => t.id === topic.id);
        let newList = currentList;
        
        if (exists) {
            newList = currentList.filter(t => t.id !== topic.id);
        } else {
            if (currentList.length >= 3) {
                alert("Maximum 3 items for comparison.");
                return;
            }
            newList = [...currentList, topic];
        }
        
        // Update both the list and the active snapshot so the button is ready
        const snapshot = AS_SimulatorEngine.createComparisonSnapshot(newList);
        onUpdateConfig({ 
           compareTopics: newList,
           activeBriefSnapshot: snapshot 
        });
    }
  };

  // --- RENDER HELPERS ---

  const StepIndicator = ({ stepNumber, label, targetStep, isActive, isDone }: { stepNumber: string, label: string, targetStep: Step, isActive: boolean, isDone: boolean }) => (
    <div 
        onClick={() => {
           // Allow navigation if step is marked as done/accessible OR if it's the first step (always accessible to restart)
           if (isDone || targetStep === 'TEMPLATE') {
              setCurrentStep(targetStep);
           }
        }}
        className={`flex items-center gap-2 transition-all ${isActive ? 'opacity-100' : (isDone || targetStep === 'TEMPLATE') ? 'opacity-50 hover:opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
    >
        <div className={`
            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${isActive ? 'bg-white text-black scale-110 shadow-lg' : isDone ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-500'}
        `}>
            {isDone && !isActive ? '✓' : stepNumber}
        </div>
        <div className="flex flex-col">
            <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
            {isDone && !isActive && <span className="text-[9px] text-zinc-400 hidden lg:block max-w-[80px] truncate">
                {targetStep === 'TEMPLATE' ? config.template?.title : targetStep === 'AUDIENCE' ? config.cohort?.as_name : ''}
            </span>}
        </div>
        {stepNumber !== '3' && <div className="w-8 h-px bg-zinc-800 mx-2"></div>}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden relative">
      
      {/* 1. PROGRESS BAR / HEADER */}
      <div className="bg-black/80 backdrop-blur-md border-b border-zinc-800/50 p-4 z-20 flex justify-between items-center shrink-0">
         <div className="flex items-center">
            <StepIndicator 
               stepNumber="1" 
               label="Method" 
               targetStep="TEMPLATE" 
               isActive={currentStep === 'TEMPLATE'} 
               isDone={!!config.template} 
            />
            <StepIndicator 
               stepNumber="2" 
               label="Audience" 
               targetStep="AUDIENCE" 
               isActive={currentStep === 'AUDIENCE'} 
               isDone={!!config.cohort} 
            />
            <StepIndicator 
               stepNumber="3" 
               label="Asset" 
               targetStep="CONTENT" 
               isActive={currentStep === 'CONTENT'} 
               isDone={false} 
            />
         </div>
         
         <div className="flex items-center gap-4">
            {config.mode === 'PREFERENCE' && (
                <div className="text-xs font-bold px-3 py-1 rounded bg-purple-900/20 text-purple-400 border border-purple-900/50">
                    Comparison Mode
                </div>
            )}
            {config.mode === 'VALIDATION' && (
                <div className="text-xs font-bold px-3 py-1 rounded bg-blue-900/20 text-blue-400 border border-blue-900/50">
                    Validation Mode
                </div>
            )}
         </div>
      </div>

      {/* 2. DYNAMIC CONTENT AREA */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-black relative">
         
         {/* STEP 1: TEMPLATE */}
         {currentStep === 'TEMPLATE' && (
            <div className="p-6 max-w-7xl mx-auto animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Select Methodology</h2>
                    <p className="text-zinc-400 text-sm">Choose an experiment model from the Solution Center.</p>
                </div>
                <ExperimentTemplateLibrary 
                    onSelectTemplate={handleTemplateSelect} 
                    sessions={[]}
                />
            </div>
         )}

         {/* STEP 2: AUDIENCE */}
         {currentStep === 'AUDIENCE' && (
            <div className="h-full flex flex-col animate-fade-in">
                <div className="p-6 shrink-0 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Target Audience</h2>
                    <p className="text-zinc-400 text-sm">Who are we simulating today?</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <CohortManager 
                        cohorts={cohorts}
                        onSaveCohort={onSaveCohort}
                        onDeleteCohort={onDeleteCohort}
                        onSelectCohortForSim={handleCohortSelect}
                        onRefresh={onRefresh}
                        variant="selection" // Enable simplified cards
                    />
                </div>
            </div>
         )}

         {/* STEP 3: CONTENT (ASSETS) */}
         {currentStep === 'CONTENT' && (
            <div className="h-full flex flex-col animate-fade-in relative">
                <div className="p-6 shrink-0 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {config.mode === 'VALIDATION' ? 'Select Asset to Validate' : 'Select Assets to Compare'}
                    </h2>
                    <p className="text-zinc-400 text-sm">
                        {config.mode === 'VALIDATION' 
                            ? 'Choose one Master Brief to run against the audience.' 
                            : 'Select up to 3 assets. We will run a head-to-head tournament.'}
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto pb-32">
                    <TopicLibrary 
                        topics={topics}
                        onUseTopic={handleTopicSelect}
                        onRefresh={onRefresh}
                        selectionMode={config.mode === 'VALIDATION' ? 'single' : 'multi'}
                        selectedIds={config.compareTopics?.map(t => t.id) || []}
                        variant="selection" // Enable simplified cards
                    />
                </div>

                {/* --- COMPARISON TRAY (Fixed Bottom) --- */}
                {config.mode === 'PREFERENCE' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-30 animate-slide-in-up">
                        <div className="max-w-6xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Selection Tray</span>
                                <div className="flex gap-2">
                                    {(config.compareTopics || []).map((t, i) => (
                                        <div key={t.id} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 flex items-center gap-2 animate-fade-in">
                                            <div className="w-5 h-5 rounded bg-orange-600 flex items-center justify-center text-[10px] font-bold text-white">{i + 1}</div>
                                            <span className="text-xs text-white font-medium truncate max-w-[120px]">{t.mb_title}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleTopicSelect(t); }}
                                                className="text-zinc-500 hover:text-white"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {(config.compareTopics?.length || 0) < 2 && (
                                        <div className="border border-dashed border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-500 italic">
                                            Select at least 2 items...
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={() => onLaunch()} // onLaunch uses activeBriefSnapshot from updated config
                                disabled={(config.compareTopics?.length || 0) < 2}
                                className={`
                                    px-8 py-3 rounded-xl font-bold text-sm tracking-wide uppercase shadow-lg transition-all flex items-center gap-2
                                    ${(config.compareTopics?.length || 0) >= 2 
                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-orange-500/20 hover:scale-105' 
                                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                                    }
                                `}
                            >
                                <span>Run Simulation</span>
                                <span className="text-lg">🚀</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
         )}

      </div>
    </div>
  );
};

export default ExperimentConfigurator;