
import React, { useState, useEffect, useMemo } from 'react';
import { TemplateDefinition, ExperimentType, Session } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import VaultCard from './VaultCard';

interface ExperimentTemplateLibraryProps {
  onSelectTemplate: (template: TemplateDefinition, mode: ExperimentType) => void;
  sessions?: Session[]; // For "Recent Insights" shelf
  onSelectSession?: (session: Session) => void;
  theme?: 'light' | 'dark';
}

// --- CONFIGURATION ---

const QUICK_FILTERS = [
  { id: 'roi', label: 'Optimize ROI', icon: '📈', tags: ['ROI', 'Conversion'] },
  { id: 'launch', label: 'New Launch', icon: '🚀', tags: ['Launch', 'Risk'] },
  { id: 'retention', label: 'Retention', icon: '🪣', tags: ['Retention', 'Churn'] },
  { id: 'content', label: 'Creative', icon: '✍️', tags: ['Creative', 'Video'] },
  { id: 'brand', label: 'Brand', icon: '🧠', tags: ['Brand'] },
];

const TEMPLATE_STATUS_MESSAGES: Record<string, string[]> = {
  // Video
  vid_hook: ["DETECTING: Pacing anomalies in first 3s...", "CALIBRATING: Thumb-stop probability for Gen-Z..."],
  vid_storyboard: ["MAPPING: Narrative flow vs. attention span...", "SCANNING: Identifying boredom spikes in Act II..."],
  vid_attention: ["PREDICTING: Focal points & eye-tracking heatmap...", "ANALYZING: Visual clutter vs. product prominence..."],
  vid_emotional: ["MEASURING: End-sequence emotional surge...", "SIMULATING: Share-trigger vs. Buy-intent ratio..."],
  vid_native: ["COMPARING: Ad-style vs. Native-style engagement...", "CALCULATING: Algorithm affinity score..."],
  
  // Ads
  ads_copy: ["CALCULATING: Semantic hook strength (CTR Proxy)...", "TESTING: Cognitive friction across 5 copy variants..."],
  ads_landing: ["AUDITING: Trust signals & friction on LP...", "PREDICTING: Bounce risk at Hero Section..."],
  ads_fatigue: ["ESTIMATING: Effective lifespan of creative assets...", "PROJECTING: Performance decay over 14-day spend..."],
  ads_audience_fit: ["MATCHING: Value prop to 5 distinct personas...", "SIMULATING: Click probability by segment..."],
  ads_scalability: ["STRESS-TESTING: CPA efficiency at 5x spend...", "MODELING: Market saturation points..."],

  // Product
  prod_ui_ab: ["COMPARING: User flow efficiency (Path A vs B)...", "DETECTING: UI friction in checkout micro-interactions..."],
  prod_feature_val: ["ASSESSING: Adoption rate among power users...", "SIMULATING: Value perception vs. learning curve..."],
  prod_paywall: ["TESTING: Paywall friction vs. price elasticity...", "ANALYZING: Conversion lift on Annual vs. Monthly..."], 
  prod_friction: ["MEASURING: Time-to-task completion...", "IDENTIFYING: Cognitive load spikes..."],
  prod_onboarding: ["TRACING: Drop-off points in step 1-3...", "CALCULATING: Time-to-Aha moment..."],

  // Ecommerce
  ecom_pdp: ["SCANNING: Purchase intent gaps in product specs...", "AUDITING: Social proof credibility score..."],
  ecom_price: ["FINDING: Optimal price point for maximum margin...", "MAPPING: Demand elasticity vs. bundle incentives..."],
  ecom_unboxing: ["PREDICTING: Post-purchase dopamine peak...", "MEASURING: 'Instagrammability' of packaging..."],
  ecom_repeat: ["ANALYZING: Second-purchase triggers...", "MODELING: LTV impact of post-purchase email..."],
  ecom_bundle: ["COMPARING: Perceived value of bundle vs single...", "CALCULATING: AOV lift potential..."],

  // Strategy
  strat_cat_new: ["MEASURING: Market cognitive load for new concept...", "SCANNING: Adoption barriers in target segment..."],
  strat_stance: ["STRESS-TESTING: Backlash risk on core argument...", "MAPPING: Polarization across diverse personas..."],
  strat_model: ["AUDITING: Revenue logic & scalability check...", "DETECTING: Blind spots in monetization strategy..."],
  strat_gtm: ["SIMULATING: First 90-day market entry friction...", "IDENTIFYING: Potential failure points in execution..."],
  strat_moat: ["ANALYZING: Competitive defensibility factors...", "PROJECTING: Long-term retention moat..."],
  
  // Brand
  brand_trust: ["MEASURING: Trust signals across demographics...", "DETECTING: Credibility gaps in messaging..."],
  brand_diff: ["COMPARING: Brand voice vs competitors...", "CALCULATING: Uniqueness index..."],
  brand_fatigue: ["ANALYZING: Brand sentiment decay...", "PREDICTING: Refresh requirement timeline..."]
};

const TEMPLATE_CATEGORIES = [
  {
    id: 'video_hub',
    title: 'Video & Creative',
    subtitle: 'Optimize Hooks, Retention, and Viral Potential for TikTok, Reels & YT Shorts.',
    color: 'text-rose-500',
    borderColor: 'border-rose-500',
    glowColor: 'bg-rose-500/20',
    groups: [
      {
        name: 'Hooks & Narrative',
        icon: '🎣',
        items: [
          { 
            id: 'vid_hook', 
            title: '3-Second Hook Audit', 
            modes: ['VALIDATION', 'PREFERENCE'], 
            description: 'Measures first-3s attention and immediate intent signal.',
            icon: '🛑',
            placeholder: 'Paste your hook scripts or describe the opening scene. Will they scroll past?',
            inputs: ['Script Openers', 'Visual Description'],
            outputs: ['Thumb-stop Rate', 'Drop-off Risk'],
            tags: ['Video', 'Creative', 'Viral'],
            isPopular: true,
            timeEstimate: '~2 min',
          },
          { 
            id: 'vid_storyboard', 
            title: 'Storyboard Stress Test', 
            modes: ['VALIDATION'], 
            description: 'Simulates narrative flow to surface pacing breaks and boredom.',
            icon: '📉',
            placeholder: 'Paste your full video script/outline. We check for emotional dead zones.',
            inputs: ['Script/Outline'],
            outputs: ['Retention Curve', 'Boredom Spikes'],
            tags: ['Video', 'Retention'],
            timeEstimate: '~3 min'
          }
        ]
      },
      {
        name: 'Visuals & Platform',
        icon: '👁️',
        items: [
          { 
            id: 'vid_attention', 
            title: 'Visual Attention Predictor', 
            modes: ['PREFERENCE', 'VALIDATION'], 
            description: 'Predicts frame-level visual focus and competing elements.',
            icon: '🔥',
            placeholder: 'Upload thumbnail or keyframe. Are they looking at the product or the background?',
            inputs: ['Thumbnail/Frame'],
            outputs: ['Focal Point Score', 'Clutter Index'],
            tags: ['Video', 'Creative', 'ROI'],
            timeEstimate: '~2 min'
          },
          { 
            id: 'vid_emotional', 
            title: 'Emotional Resonance & CTA', 
            modes: ['VALIDATION', 'PREFERENCE'], 
            description: 'Measures end-sequence emotional impact on conversion.',
            icon: '❤️',
            placeholder: 'Describe the ending and CTA. Does the music match the "Buy" intent?',
            inputs: ['CTA Script', 'Music Vibe'],
            outputs: ['Viral Potential', 'Conversion Intent'],
            tags: ['Video', 'Viral', 'Conversion'],
            timeEstimate: '~2 min'
          },
          { 
            id: 'vid_native', 
            title: 'Platform Native Fit Test', 
            modes: ['VALIDATION'], 
            description: 'Predicts organic reach multiplier based on platform vibes (TikTok/Reels).',
            icon: '🤳',
            placeholder: 'Describe the video style (e.g. lo-fi, caption style). Is it "Ad-like" or "Native"?',
            inputs: ['Style Desc', 'Platform'],
            outputs: ['Native Score', 'Reach Multiplier'],
            tags: ['Video', 'Viral'],
            timeEstimate: '~2 min'
          }
        ]
      }
    ]
  },
  {
    id: 'ads_growth',
    title: 'Ads & Acquisition',
    subtitle: 'Scale spend efficiently with data-backed creative and funnel decisions.',
    color: 'text-orange-500',
    borderColor: 'border-orange-500',
    glowColor: 'bg-orange-500/20',
    groups: [
      {
        name: 'Creative Optimization',
        icon: '📢',
        items: [
          { 
            id: 'ads_copy', 
            title: 'Ad Copy Simulation', 
            modes: ['VALIDATION', 'PREFERENCE'], 
            description: 'Simulates copy variations to estimate CTR lift.',
            icon: '✍️',
            placeholder: 'Paste ad copy variants. Which one drives more clicks?',
            inputs: ['Copy Text', 'Headlines'],
            outputs: ['CTR Proxy', 'Persona Ranking'],
            tags: ['ROI', 'Creative'],
            isPopular: true,
            timeEstimate: '~1 min'
          },
          { 
            id: 'ads_fatigue', 
            title: 'Creative Fatigue Predictor', 
            modes: ['VALIDATION'], 
            description: 'Estimates remaining effective lifetime of a creative.',
            icon: '⏳',
            placeholder: 'Describe the creative concept. Is it novel enough to last?',
            inputs: ['Ad Concept'],
            outputs: ['Fatigue Half-life', 'Refresh Plan'],
            tags: ['Creative', 'ROI'],
            timeEstimate: '~2 min'
          },
          { 
            id: 'ads_audience_fit', 
            title: 'Audience Angle Fit', 
            modes: ['VALIDATION'], 
            description: 'Compares creative performance across specific personas.',
            icon: '🎯',
            placeholder: 'Paste the ad angle. Which persona segment resonates most?',
            inputs: ['Ad Angle'],
            outputs: ['Persona ROI Rank', 'Segment CTR'],
            tags: ['ROI', 'Launch'],
            timeEstimate: '~2 min'
          }
        ]
      },
      {
        name: 'Funnel & Scale',
        icon: '🚀',
        items: [
          { 
            id: 'ads_landing', 
            title: 'Landing Page Conversion', 
            modes: ['VALIDATION', 'PREFERENCE'], 
            description: 'Audits trust signals and friction on LPs.',
            icon: '🧲',
            placeholder: 'Analyze this landing page structure. Where is the friction?',
            inputs: ['URL/Screenshot'],
            outputs: ['Trust Score', 'Drop-off Points'],
            tags: ['ROI', 'Conversion'],
            isPopular: true,
            timeEstimate: '~2 min'
          },
          { 
            id: 'ads_scalability', 
            title: 'Acquisition Scalability Test', 
            modes: ['VALIDATION'], 
            description: 'Stress-tests if current funnel can hold up under high spend.',
            icon: '📈',
            placeholder: 'We plan to 5x spend. Will CAC hold?',
            inputs: ['Funnel Stats'],
            outputs: ['Safe Scale Ceiling', 'CAC Elasticity'],
            tags: ['ROI', 'Risk'],
            timeEstimate: '~3 min'
          }
        ]
      }
    ]
  },
  {
    id: 'product_retention',
    title: 'Product & Retention',
    subtitle: 'Turn acquisition into LTV. Fix onboarding leaks and validate features.',
    color: 'text-blue-500',
    borderColor: 'border-blue-500',
    glowColor: 'bg-blue-500/20',
    groups: [
      {
        name: 'Core Experience',
        icon: '📱',
        items: [
          { 
            id: 'prod_ui_ab', 
            title: 'Product UI A/B', 
            modes: ['PREFERENCE', 'VALIDATION'], 
            description: 'Compares UI flows on conversion/ease metrics.',
            icon: '⚖️',
            placeholder: 'Compare Flow A vs Flow B. Which is easier?',
            inputs: ['UI Mockups'],
            outputs: ['Usability Score', 'Conversion Delta'],
            tags: ['Product', 'Conversion'],
            timeEstimate: '~2 min'
          },
          { 
            id: 'prod_feature_val', 
            title: 'New Feature Value', 
            modes: ['VALIDATION', 'PREFERENCE'], 
            description: 'Validates if a feature drives engagement lift.',
            icon: '✨',
            placeholder: 'Will this feature actually be used?',
            inputs: ['Feature Spec'],
            outputs: ['Adoption Rate', 'LTV Impact'],
            tags: ['Launch', 'Product'],
            timeEstimate: '~2 min'
          },
          { 
            id: 'prod_friction', 
            title: 'User Flow Friction Audit', 
            modes: ['VALIDATION'], 
            description: 'Quantifies cognitive load and task time.',
            icon: '🐌',
            placeholder: 'Analyze this user journey. Is it too complex?',
            inputs: ['Flow Description'],
            outputs: ['Friction Index', 'Time-to-Task'],
            tags: ['Product', 'Retention'],
            timeEstimate: '~3 min'
          }
        ]
      },
      {
        name: 'Retention & LTV',
        icon: '🔄',
        items: [
          { 
            id: 'prod_onboarding', 
            title: 'Onboarding Drop-off', 
            modes: ['VALIDATION'], 
            description: 'Identifies exact steps causing abandonment.',
            icon: '📉',
            placeholder: 'Review these 5 onboarding screens. Where do they quit?',
            inputs: ['Onboarding Flow'],
            outputs: ['Drop-off Step', 'Day-1 Lift'],
            tags: ['Retention', 'Conversion'],
            timeEstimate: '~2 min'
          },
          { 
            id: 'ret_habit', 
            title: 'Habit Formation Simulation', 
            modes: ['VALIDATION'], 
            description: 'Models trigger-reward loops for habit building.',
            icon: '🔁',
            placeholder: 'Does this app have a strong hook model?',
            inputs: ['Core Loop'],
            outputs: ['Habit Index', 'Retention Uplift'],
            tags: ['Retention'],
            timeEstimate: '~3 min'
          },
          { 
            id: 'ret_ltv', 
            title: 'LTV Potential Estimation', 
            modes: ['VALIDATION'], 
            description: 'Projects long-term value based on current mechanics.',
            icon: '💰',
            placeholder: 'Estimate the 6-month LTV of this user base.',
            inputs: ['Monetization Model'],
            outputs: ['Projected LTV', 'Break-even CAC'],
            tags: ['ROI', 'Pricing'],
            timeEstimate: '~3 min'
          },
          { 
            id: 'ret_churn', 
            title: 'Churn Risk Predictor', 
            modes: ['VALIDATION'], 
            description: 'Predicts root causes for at-risk users.',
            icon: '⚠️',
            placeholder: 'Why are users leaving after month 1?',
            inputs: ['User Signals'],
            outputs: ['Churn Prob', 'Fix ROI'],
            tags: ['Retention', 'Churn'],
            timeEstimate: '~3 min'
          }
        ]
      }
    ]
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    subtitle: 'Optimize PDPs, pricing, and unboxing for maximum AOV and repeat rates.',
    color: 'text-green-500',
    borderColor: 'border-green-500',
    glowColor: 'bg-green-500/20',
    groups: [
      {
        name: 'Conversion & AOV',
        icon: '🛍️',
        items: [
          { 
            id: 'ecom_pdp', 
            title: 'PDP Conversion (DTC)', 
            modes: ['VALIDATION', 'PREFERENCE'], 
            description: 'Diagnoses product page trust and intent drivers.',
            icon: '📄',
            placeholder: 'Audit this product page. Is the "Add to Cart" compelling?',
            inputs: ['PDP Content'],
            outputs: ['Purchase Intent', 'Trust Gaps'],
            tags: ['Conversion', 'ROI'],
            isPopular: true,
            timeEstimate: '~2 min'
          },
          { 
            id: 'ecom_price', 
            title: 'Price Sensitivity (PSM)', 
            modes: ['VALIDATION', 'PREFERENCE'], 
            description: 'Estimates demand elasticity and optimal pricing.',
            icon: '🏷️',
            placeholder: 'Is $50 too expensive for this item?',
            inputs: ['Price', 'Product'],
            outputs: ['Elasticity', 'Optimal Price'],
            tags: ['Pricing', 'ROI'],
            timeEstimate: '~3 min'
          },
          { 
            id: 'ecom_bundle', 
            title: 'Bundle Value Perception', 
            modes: ['PREFERENCE', 'VALIDATION'], 
            description: 'Tests perceived value of bundles vs single SKU.',
            icon: '📦',
            placeholder: 'Does this 3-pack feel like a deal?',
            inputs: ['Bundle Offer'],
            outputs: ['AOV Lift', 'Conversion'],
            tags: ['Pricing', 'ROI'],
            timeEstimate: '~2 min'
          }
        ]
      },
      {
        name: 'Post-Purchase',
        icon: '🎁',
        items: [
          { 
            id: 'ecom_unboxing', 
            title: 'Unboxing & Social Proof', 
            modes: ['VALIDATION'], 
            description: 'Measures shareability of the unboxing experience.',
            icon: '✨',
            placeholder: 'Will they post this packaging on Instagram?',
            inputs: ['Packaging Visuals'],
            outputs: ['Share Rate', 'UGC Lift'],
            tags: ['Brand', 'Viral'],
            timeEstimate: '~2 min'
          },
          { 
            id: 'ecom_repeat', 
            title: 'Repeat Purchase Driver', 
            modes: ['VALIDATION'], 
            description: 'Identifies what drives the second order.',
            icon: '🔄',
            placeholder: 'What makes them buy again?',
            inputs: ['Lifecycle Emails'],
            outputs: ['Repurchase Rate', 'LTV Lift'],
            tags: ['Retention', 'LTV'],
            timeEstimate: '~3 min'
          }
        ]
      }
    ]
  },
  {
    id: 'strategy_brand',
    title: 'Strategy & Brand',
    subtitle: 'High-level simulations for positioning, market fit, and long-term brand health.',
    color: 'text-purple-500',
    borderColor: 'border-purple-500',
    glowColor: 'bg-purple-500/20',
    groups: [
      {
        name: 'Strategic Pivot',
        icon: '🏛️',
        items: [
          { 
            id: 'strat_cat_new', 
            title: 'New Category Acceptance', 
            modes: ['VALIDATION'], 
            description: 'Validates willingness to adopt a novel category.',
            icon: '🛸',
            placeholder: 'Is the world ready for "Sleep Banking"?',
            inputs: ['Concept'],
            outputs: ['Acceptance Score', 'GTM Channel'],
            tags: ['Launch', 'Risk'],
            timeEstimate: '~4 min'
          },
          { 
            id: 'strat_model', 
            title: 'Model Feasibility', 
            modes: ['VALIDATION'], 
            description: 'Audits unit economics and business plausibility.',
            icon: '🏗️',
            placeholder: 'Check this business model for holes.',
            inputs: ['Biz Plan'],
            outputs: ['Feasibility Rating', 'Risks'],
            tags: ['Risk', 'Pricing'],
            timeEstimate: '~5 min'
          },
          { 
            id: 'strat_moat', 
            title: 'Scale vs Moat Analysis', 
            modes: ['VALIDATION'], 
            description: 'Evaluates defensibility vs rapid scaling.',
            icon: '🏰',
            placeholder: 'Should we scale fast or build a moat?',
            inputs: ['Strategy Doc'],
            outputs: ['Moat Index', 'Scale Plan'],
            tags: ['Risk', 'Launch'],
            timeEstimate: '~4 min'
          },
          { 
            id: 'strat_gtm', 
            title: 'GTM Risk Assessment', 
            modes: ['VALIDATION'], 
            description: 'Checklist for market entry risks.',
            icon: '⚠️',
            placeholder: 'What will kill our launch?',
            inputs: ['GTM Plan'],
            outputs: ['GTM Readiness', 'Risk Map'],
            tags: ['Launch', 'Risk'],
            timeEstimate: '~5 min'
          }
        ]
      },
      {
        name: 'Brand & Perception',
        icon: '🧠',
        items: [
          { 
            id: 'brand_trust', 
            title: 'Brand Trust Baseline', 
            modes: ['VALIDATION'], 
            description: 'Predicts early funnel leakage due to trust gaps.',
            icon: '🤝',
            placeholder: 'Do we look trustworthy?',
            inputs: ['Brand Assets'],
            outputs: ['Trust Score', 'CAC Impact'],
            tags: ['Brand', 'Conversion'],
            timeEstimate: '~3 min'
          },
          { 
            id: 'brand_diff', 
            title: 'Differentiation Clarity', 
            modes: ['PREFERENCE', 'VALIDATION'], 
            description: 'Tests if uniqueness is articulate.',
            icon: '🦄',
            placeholder: 'Are we distinct from competitors?',
            inputs: ['Messaging'],
            outputs: ['Clarity Score', 'Conversion Delta'],
            tags: ['Brand', 'Creative'],
            timeEstimate: '~3 min'
          },
          { 
            id: 'brand_fatigue', 
            title: 'Brand vs Creative Fatigue', 
            modes: ['VALIDATION'], 
            description: 'Is it the ad or the brand that is tired?',
            icon: '📉',
            placeholder: 'Performance is dropping. Why?',
            inputs: ['Performance Data'],
            outputs: ['Fatigue Source', 'Recovery Plan'],
            tags: ['Brand', 'ROI'],
            timeEstimate: '~3 min'
          }
        ]
      }
    ]
  }
];

const ExperimentTemplateLibrary: React.FC<ExperimentTemplateLibraryProps> = ({ onSelectTemplate, sessions, onSelectSession, theme }) => {
  const [activeTab, setActiveTab] = useState<'video_hub' | 'ads_growth' | 'product_retention' | 'ecommerce' | 'strategy_brand'>('video_hub');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedHybridId, setSelectedHybridId] = useState<string | null>(null);
  const [viewExampleTemplate, setViewExampleTemplate] = useState<any | null>(null);

  const handleCardClick = (item: any) => {
    if (item.modes.length === 1) {
      onSelectTemplate(item as TemplateDefinition, item.modes[0]);
    } else {
      setSelectedHybridId(item.id);
    }
  };

  const handleQuickFilter = (filterId: string) => {
    if (activeFilter === filterId) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterId);
    }
  };

  const getFilteredTemplates = () => {
    if (!activeFilter) return null;
    const filterTags = QUICK_FILTERS.find(f => f.id === activeFilter)?.tags || [];
    
    // Flatten all categories
    const allGroups = TEMPLATE_CATEGORIES.flatMap(c => c.groups);
    const allItems = allGroups.flatMap(g => g.items);
    
    return allItems.filter(item => 
      item.tags?.some(t => filterTags.includes(t))
    );
  };

  const filteredItems = getFilteredTemplates();
  const recentSessions = sessions?.slice(0, 5) || [];

  return (
    <div className="animate-fade-in w-full pb-20 relative">
      
      {/* --- SIDE DRAWER FOR EXAMPLE --- */}
      {viewExampleTemplate && (
         <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
               className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
               onClick={() => setViewExampleTemplate(null)}
            ></div>
            
            {/* Drawer */}
            <div className="relative w-full max-w-md bg-zinc-900 theme-card border-l border-zinc-800 theme-border shadow-2xl h-full overflow-y-auto animate-slide-in-right flex flex-col">
               {/* Header */}
               <div className="p-6 border-b border-zinc-800 theme-border flex justify-between items-start">
                  <div>
                     <h3 className="text-xl font-bold text-white theme-text mb-1">{viewExampleTemplate.title}</h3>
                     <p className="text-zinc-400 theme-text-muted text-sm">Example Report</p>
                  </div>
                  <button onClick={() => setViewExampleTemplate(null)} className="text-zinc-500 theme-text-muted hover:text-white theme-text text-2xl">&times;</button>
               </div>
               
               {/* Content */}
               <div className="p-6 space-y-8 flex-1">
                  
                  {/* Stage 1: Input */}
                  <div className="relative pl-6 border-l-2 border-zinc-700">
                     <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-800 border-2 border-zinc-600"></div>
                     <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">1. Input Data</h4>
                     <p className="text-zinc-400 text-sm leading-relaxed">
                        {viewExampleTemplate.exampleData?.inputSummary || "User uploaded concepts for analysis."}
                     </p>
                  </div>

                  {/* Stage 2: Simulation */}
                  <div className="relative pl-6 border-l-2 border-orange-500/30">
                     <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-900 border-2 border-orange-500 animate-pulse"></div>
                     <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-2">2. AI Simulation</h4>
                     <div className="bg-orange-900/10 p-3 rounded-lg border border-orange-900/30 inline-block">
                        <span className="text-2xl font-bold text-white">{viewExampleTemplate.exampleData?.simulationCount || "5,000"}+</span>
                        <span className="text-sm text-orange-300 ml-2">Simulated Personas</span>
                     </div>
                  </div>

                  {/* Stage 3: Result */}
                  <div className="relative pl-6 border-l-2 border-green-500/30">
                     <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-900 border-2 border-green-500"></div>
                     <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">3. Key Intelligence</h4>
                     
                     <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 mb-4 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                           {viewExampleTemplate.exampleData?.chartType === 'pie' ? (
                              <PieChart>
                                 <Pie 
                                    data={viewExampleTemplate.exampleData?.mockChartData || [{name:'A', value:1}]} 
                                    dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" 
                                 >
                                    {(viewExampleTemplate.exampleData?.mockChartData || []).map((entry: any, index: number) => (
                                       <Cell key={`cell-${index}`} fill={entry.color || ['#22c55e', '#ef4444', '#eab308'][index % 3]} />
                                    ))}
                                 </Pie>
                                 <Tooltip contentStyle={{backgroundColor:'#18181b', borderColor:'#27272a'}} />
                              </PieChart>
                           ) : (
                              <BarChart data={viewExampleTemplate.exampleData?.mockChartData || [{label:'A', value:50}, {label:'B', value:80}]}>
                                 <XAxis dataKey="label" tick={{fill:'#71717a', fontSize: 10}} />
                                 <Tooltip cursor={{fill: '#27272a'}} contentStyle={{backgroundColor:'#18181b', borderColor:'#27272a'}} />
                                 <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                              </BarChart>
                           )}
                        </ResponsiveContainer>
                     </div>
                     <p className="text-white text-sm font-medium italic border-l-4 border-green-500 pl-4 py-1">
                        "{viewExampleTemplate.exampleData?.resultSummary || "Clear winner identified with high confidence."}"
                     </p>
                  </div>

               </div>

               {/* Footer Action */}
               <div className="p-6 border-t border-zinc-800 theme-border bg-black/20">
                  <button 
                     onClick={() => {
                        setViewExampleTemplate(null);
                        handleCardClick(viewExampleTemplate);
                     }}
                     className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-900/40 transition-all transform hover:-translate-y-1"
                  >
                     Start This Experiment
                     <div className="text-xs font-normal opacity-80 mt-1">Cost: 1 Credit</div>
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* 1. Priority Filters */}
      <div className="mb-8">
         <p className="text-xs font-normal text-zinc-500 theme-text-muted uppercase tracking-widest mb-4 text-center">What is your priority today?</p>
         <div className="flex flex-wrap justify-center gap-3">
            {QUICK_FILTERS.map(filter => (
               <button
                  key={filter.id}
                  onClick={() => handleQuickFilter(filter.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-normal border transition-all flex items-center gap-2 ${
                     activeFilter === filter.id
                     ? 'bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)] transform scale-105'
                     : 'bg-zinc-900 theme-surface border-zinc-800 theme-border text-zinc-400 theme-text-muted hover:border-zinc-600 hover:text-white hover:theme-text'
                  }`}
               >
                  <span className="text-base">{filter.icon}</span>
                  {filter.label}
               </button>
            ))}
         </div>
      </div>

      {/* 2. RECENT INSIGHTS SHELF (Returning Users Only) */}
      {!activeFilter && recentSessions.length > 0 && (
         <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 px-4 lg:px-0">
               <h3 className="text-lg font-semibold text-zinc-300 theme-text">Recent Insights</h3>
               <div className="h-px flex-1 bg-zinc-800 theme-border"></div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-6 px-4 lg:px-0 scrollbar-hide">
               {recentSessions.map(session => (
                  <div key={session.id} className="min-w-[280px] w-[280px]">
                     <VaultCard session={session} onClick={() => onSelectSession && onSelectSession(session)} />
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* 3. Tabs (Solution Categories) - Hidden if filtered */}
      {!activeFilter && (
         <div className="flex justify-center mb-12 overflow-x-auto px-4 pb-4">
            <div className="bg-zinc-900 theme-surface p-1.5 rounded-2xl border border-zinc-800 theme-border inline-flex relative shadow-xl whitespace-nowrap">
               {TEMPLATE_CATEGORIES.map(cat => (
               <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id as any)}
                  className={`relative z-10 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                     activeTab === cat.id 
                     ? 'text-white theme-text shadow-lg bg-zinc-800 theme-card ring-1 ring-white/10' 
                     : 'text-zinc-500 theme-text-muted hover:text-zinc-300 hover:theme-text'
                  }`}
               >
                  {cat.title}
               </button>
               ))}
            </div>
         </div>
      )}

      {/* 4. Grid Content */}
      <div className="space-y-16">
        
        {/* VIEW A: Filtered Results */}
        {activeFilter && filteredItems && (
           <div className="animate-fade-in">
              <h3 className="text-center text-xl font-bold text-white theme-text mb-8">
                 Templates for <span className="text-orange-500">{QUICK_FILTERS.find(f => f.id === activeFilter)?.label}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                 {filteredItems.map(item => renderCard(item, selectedHybridId, setSelectedHybridId, handleCardClick, onSelectTemplate, setViewExampleTemplate, theme))}
              </div>
              {filteredItems.length === 0 && (
                 <div className="text-center text-zinc-500 theme-text-muted py-10 border border-dashed border-zinc-800 theme-border rounded-xl bg-zinc-900/50 theme-surface">
                    No specific templates found for this filter. Try browsing categories.
                 </div>
              )}
           </div>
        )}

        {/* VIEW B: Categorized Tabs */}
        {!activeFilter && TEMPLATE_CATEGORIES.map(cat => {
          if (cat.id !== activeTab) return null;

          return (
            <div key={cat.id} className="animate-fade-in">
              <div className="text-center mb-12 max-w-2xl mx-auto px-4">
                <p className={`text-base font-semibold uppercase tracking-wider mb-2 ${cat.color}`}>{cat.title}</p>
                <p className="text-zinc-300 theme-text-secondary text-base font-normal">{cat.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 gap-16">
                {cat.groups.map(group => (
                  <div key={group.name} className="relative">
                    <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 theme-border pb-3 px-4 lg:px-0">
                       <div className={`w-10 h-10 rounded-full bg-zinc-900 theme-surface border border-zinc-800 theme-border flex items-center justify-center text-xl relative overflow-hidden flex-shrink-0`}>
                          <div className={`absolute inset-0 ${cat.glowColor} blur-lg opacity-40`}></div>
                          <span className="relative z-10">{group.icon}</span>
                       </div>
                       <h3 className="text-lg font-semibold text-white theme-text flex items-center gap-2">
                          {group.name}
                          <span className="text-xs font-normal text-zinc-600 theme-text-muted ml-2 bg-zinc-900 theme-surface px-2.5 py-0.5 rounded-full border border-zinc-800 theme-border">
                             {group.items.length} Templates
                          </span>
                       </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 lg:px-0">
                      {group.items.map(item => renderCard(item, selectedHybridId, setSelectedHybridId, handleCardClick, onSelectTemplate, setViewExampleTemplate, theme))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS FOR LIVE VISUALS ---

const LiveStatusTicker: React.FC<{ templateId: string }> = ({ templateId }) => {
   const [textIndex, setTextIndex] = useState(0);
   
   const messages = useMemo(() => {
      // Default fallback if ID not found
      return TEMPLATE_STATUS_MESSAGES[templateId] || [
         "⚡ ACTIVE: 50 psychological agents...",
         "🧠 PROCESSING: Decision logic & bias...",
         "📊 UPDATING: Real-time confidence score..."
      ];
   }, [templateId]);

   useEffect(() => {
      const interval = setInterval(() => {
         setTextIndex(prev => (prev + 1) % messages.length);
      }, 4000); // 4 seconds per message
      return () => clearInterval(interval);
   }, [messages]);

   return (
      <div className="flex items-center gap-3 w-full overflow-hidden">
         <div className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
         </div>
         <div className="flex-1 overflow-hidden relative h-4">
            <span 
               key={textIndex} // Force re-render for animation
               className="absolute inset-0 text-[11px] font-mono text-emerald-500/70 animate-fade-in truncate leading-tight select-none tracking-tight"
            >
               {messages[textIndex]}
            </span>
         </div>
      </div>
   );
};

const CardBackground: React.FC<{ type: string, theme?: 'light' | 'dark' }> = ({ type, theme = 'dark' }) => {
   const glowColor = type === 'VIDEO' ? 'bg-rose-500/10' 
                  : type === 'STRATEGY' ? 'bg-purple-500/10'
                  : type === 'ADS' ? 'bg-orange-500/10'
                  : 'bg-blue-500/10';

   if (theme === 'light') {
      // Light Mode: "Clean Lab / Blueprint" Aesthetic
      return (
         <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl bg-white">
            {/* Technical Grid (Blueprint) */}
            <div className="absolute inset-0 opacity-[0.05]" 
                 style={{ 
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                 }}>
            </div>
            
            {/* Top-down "Concave" Lighting (Simulating a slight indentation) */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/5 to-transparent"></div>
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[100%] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_60%)]"></div>

            {/* Subtle color hint at bottom */}
            <div className={`absolute bottom-[-20%] right-[-20%] w-[200px] h-[200px] blur-[80px] opacity-30 ${type === 'VIDEO' ? 'bg-rose-500' : type === 'ADS' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
         </div>
      );
   }

   // Dark Mode: "Matrix / Sci-Fi" Aesthetic
   return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
         {/* Base Radial Gradient (Vignette) */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.4)_0%,rgba(9,9,11,0.8)_100%)]"></div>

         {/* The Matrix Grid (Dots) */}
         <div className="absolute inset-0 opacity-[0.1]" 
              style={{ backgroundImage: 'radial-gradient(#71717a 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
         </div>

         {/* Breathing Gradient */}
         <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-30 blur-[80px] animate-[spin_20s_linear_infinite] ${glowColor}`}></div>
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full ${glowColor} blur-[60px] opacity-20 animate-pulse`}></div>
         
         {/* Noise Overlay */}
         <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
         </div>
      </div>
   );
};

// Helper: Contextual Button Label
const getButtonLabel = (item: any) => {
  if (item.tags?.includes('Video') || item.tags?.includes('Viral')) return 'Run Simulation';
  if (item.tags?.includes('Risk') || item.tags?.includes('Launch')) return 'Strategic Audit';
  return 'Start Experiment';
};

// Helper: Render Card
const renderCard = (
   item: any, 
   selectedHybridId: string | null, 
   setSelectedHybridId: (id: string | null) => void,
   handleCardClick: (item: any) => void,
   onSelectTemplate: (t: TemplateDefinition, m: ExperimentType) => void,
   setViewExampleTemplate: (t: any) => void,
   theme?: 'light' | 'dark'
) => {
   const isHybridActive = selectedHybridId === item.id;
   
   // Determine Type for Visuals
   let visualType = 'STANDARD';
   if (item.tags?.includes('Video') || item.tags?.includes('Creative')) visualType = 'VIDEO';
   else if (item.tags?.includes('Risk') || item.tags?.includes('Strategy')) visualType = 'STRATEGY';
   else if (item.tags?.includes('ROI') || item.tags?.includes('Ads')) visualType = 'ADS';

   return (
      <div 
         key={item.id}
         onClick={() => !isHybridActive && handleCardClick(item)}
         className={`
            group relative h-[260px] flex flex-col bg-zinc-900 theme-card border border-zinc-800 theme-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
            hover:border-zinc-700 hover:shadow-2xl theme-shadow
            ${isHybridActive ? 'ring-2 ring-orange-500/50 z-20 shadow-2xl' : ''}
         `}
      >
         <CardBackground type={visualType} theme={theme} />

         {!isHybridActive ? (
            <>
               <div className="p-6 h-full flex flex-col relative z-10">
                  
                  {/* Header: Icon + Title */}
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300 drop-shadow-md">{item.icon}</div>
                        <h3 className="text-xl font-black text-white theme-text leading-none tracking-tight drop-shadow-sm uppercase">{item.title}</h3> 
                  </div>

                  {/* Content Area */}
                  <div className="relative flex-1 flex flex-col justify-center"> {/* justify-center is key for Body Center */}
                     
                     {/* Default View */}
                     <div className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] opacity-100 translate-y-0 group-hover:opacity-0 group-hover:-translate-y-4 pointer-events-none flex flex-col">
                        
                        {/* Body (Center) */}
                        <div className="flex-1 flex items-center justify-center px-2">
                           <p className="text-base text-zinc-300 theme-text-secondary leading-7 font-medium text-center drop-shadow-sm">
                              {item.description}
                           </p>
                        </div>
                        
                        {/* Footer (Weakened) */}
                        <div className="mt-auto w-full">
                           <div className="pt-4 border-t border-zinc-700/10 w-full flex items-center justify-between gap-2">
                               {/* Left: Ticker */}
                               <div className="flex-1 min-w-0 opacity-60">
                                   <LiveStatusTicker templateId={item.id} />
                               </div>
                               
                               {/* Right: Tags */}
                               <div className="flex gap-1 flex-shrink-0 opacity-80">
                                    {item.modes.includes('VALIDATION') && (
                                       <span className="text-[9px] font-bold tracking-wider uppercase text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/30 backdrop-blur-sm shadow-sm">VAL</span>
                                    )}
                                    {item.modes.includes('PREFERENCE') && (
                                       <span className="text-[9px] font-bold tracking-wider uppercase text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-900/30 backdrop-blur-sm shadow-sm">COMP</span>
                                    )}
                               </div>
                           </div>
                        </div>
                     </div>

                     {/* Hover View: Metadata (Input/Intel) */}
                     <div className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 flex flex-col justify-center">
                        <div className="bg-black/60 backdrop-blur-md theme-surface rounded-xl p-4 border border-zinc-700/50 theme-border space-y-3 shadow-2xl">
                           {/* Input Row */}
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 theme-text-muted tracking-wider">Inputs</span>
                              <span className="text-[11px] font-mono text-zinc-300 theme-text truncate max-w-[120px]" title={item.inputs?.join(', ')}>
                                 {item.inputs?.[0]}...
                              </span>
                           </div>
                           <div className="h-px bg-white/5"></div>
                           {/* Output Row */}
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 theme-text-muted tracking-wider">Intel</span>
                              <span className="text-[11px] font-mono text-emerald-400 truncate max-w-[120px]" title={item.outputs?.join(', ')}>
                                 {item.outputs?.[0]}...
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Bottom Action Button (Slides up) */}
               <button className="absolute bottom-0 left-0 right-0 h-14 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm tracking-wide uppercase shadow-[0_-10px_40px_rgba(0,0,0,0.5)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex items-center justify-center gap-2 z-20">
                  <span>{getButtonLabel(item)}</span>
                  <span className="text-lg">🚀</span>
               </button>
            </>
         ) : (
            <div className="animate-fade-in p-2 h-full flex flex-col justify-center relative z-10 bg-zinc-900/90 backdrop-blur-sm">
               <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedHybridId(null); }}
                  className="absolute top-0 right-0 text-zinc-500 theme-text-muted hover:text-white theme-text text-xl p-2"
               >
                  &times;
               </button>
               <h4 className="text-sm font-semibold text-white theme-text mb-1 text-center">Select Goal</h4>
               <p className="text-xs text-zinc-500 theme-text-muted text-center mb-6">How do you want to run this experiment?</p>
               
               <div className="flex flex-col gap-3 px-4">
                  <button 
                  onClick={(e) => { e.stopPropagation(); onSelectTemplate(item as TemplateDefinition, 'VALIDATION'); }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-black theme-surface border border-zinc-700 theme-border hover:border-blue-500 hover:bg-blue-900/10 transition-all group/btn text-left"
                  >
                     <div className="w-8 h-8 rounded-lg bg-blue-900/20 border border-blue-900/50 flex items-center justify-center text-blue-400 text-sm">✓</div>
                     <div>
                        <div className="text-sm font-semibold text-zinc-200 theme-text group-hover/btn:text-blue-400">Validate Concept</div>
                        <div className="text-[10px] text-zinc-500 theme-text-muted">"Does this work?" (Single Item)</div>
                     </div>
                  </button>
                  <button 
                  onClick={(e) => { e.stopPropagation(); onSelectTemplate(item as TemplateDefinition, 'PREFERENCE'); }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-black theme-surface border border-zinc-700 theme-border hover:border-purple-500 hover:bg-purple-900/10 transition-all group/btn text-left"
                  >
                     <div className="w-8 h-8 rounded-lg bg-purple-900/20 border border-purple-900/50 flex items-center justify-center text-purple-400 text-sm">⚖️</div>
                     <div>
                        <div className="text-sm font-semibold text-zinc-200 theme-text group-hover/btn:text-purple-400">Compare Options</div>
                        <div className="text-[10px] text-zinc-500 theme-text-muted">"Which is better?" (A vs B)</div>
                     </div>
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

export default ExperimentTemplateLibrary;
