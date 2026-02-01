
import React, { useState, useRef, useMemo } from 'react';
import { MB_MasterBrief, MB_BriefVersion, Session } from '../types';
import { MB_BriefManager } from '../services/MB_BriefManager';
import { api } from '../services/api';

interface TopicLibraryProps {
  topics: MB_MasterBrief[]; 
  onRefresh: () => void;
  onUseTopic?: (topic: MB_MasterBrief) => void; 
  selectionMode?: 'single' | 'multi'; 
  selectedIds?: string[];
  variant?: 'management' | 'selection'; 
}

// --- VISUAL: CARD BACKGROUND ---
const CardBackground: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
   return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(39,39,42,0.4)_0%,rgba(9,9,11,0.8)_100%)]"></div>
         <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#71717a 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
         <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 blur-[80px] animate-[spin_20s_linear_infinite] bg-orange-500/20"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-orange-500/10 blur-[60px] opacity-20 animate-pulse"></div>
         <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>
   );
};

// --- FOLDER STRUCTURE ---
const FOLDER_STRUCTURE = [
  { id: 'Advertising', label: 'Advertising', icon: '📢', subFolders: ['Creative Hook', 'Visual', 'Copy', 'CTA'] },
  { id: 'Internet', label: 'Internet / App', icon: '📱', subFolders: ['Onboarding', 'Feature', 'UX'] },
  { id: 'Ecommerce', label: 'E-commerce', icon: '🛍️', subFolders: ['PDP', 'Pricing', 'Promotion', 'Checkout'] },
  { id: 'Subscription', label: 'Subscription', icon: '💎', subFolders: ['Paywall', 'Pricing', 'Packaging', 'Retention', 'Monetization'] },
  { id: 'Brand', label: 'Brand / Strategy', icon: '🧠', subFolders: ['Positioning', 'Narrative', 'Trust', 'Differentiation', 'Long-term'] }
];

const TopicLibrary: React.FC<TopicLibraryProps> = ({ 
   topics, 
   onRefresh, 
   onUseTopic,
   selectionMode,
   selectedIds = [],
   variant = 'management'
}) => {
  const [activeFolder, setActiveFolder] = useState<string>('Advertising');
  const [activeSubFolder, setActiveSubFolder] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [currentBrief, setCurrentBrief] = useState<MB_MasterBrief | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  
  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchFolder = (t.mb_folder || 'Advertising') === activeFolder;
      const matchSub = activeSubFolder ? t.mb_subFolder === activeSubFolder : true;
      return matchFolder && matchSub;
    });
  }, [topics, activeFolder, activeSubFolder]);

  // --- HANDLERS ---

  const handleEdit = (brief: MB_MasterBrief) => {
    setCurrentBrief(brief);
    setEditTitle(brief.mb_title);
    setEditContent(brief.mb_content);
    setEditImages(brief.mb_images || []);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentBrief(null);
    setEditTitle('');
    setEditContent('');
    setEditImages([]);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) { alert("Enter a Brief Name."); return; }
    
    try {
        if (currentBrief) {
            // Update logic (Mock)
            await api.assets.briefs.save({
                ...currentBrief,
                mb_title: editTitle,
                mb_content: editContent,
                mb_images: editImages
            });
        } else {
            // Create New Logic (This will trigger backend limit check)
            const newBrief = MB_BriefManager.create(
                editTitle, 
                editContent, 
                activeFolder, 
                activeSubFolder || FOLDER_STRUCTURE.find(f => f.id === activeFolder)?.subFolders[0] || 'Text',
                editImages
            );
            // We call api.assets.briefs.save to enforce the Limit Check, 
            // but MB_BriefManager.create already saved to LS. 
            // In a real app, manager wouldn't save to LS directly, API would.
            // For this mock, we re-save via API to trigger the error if needed.
            await api.assets.briefs.save(newBrief); 
        }
        setIsEditing(false);
        onRefresh();
    } catch (e: any) {
        if (e.message && e.message.includes("PLAN_LIMIT_REACHED")) {
            alert(e.message + "\nPlease upgrade to create more briefs.");
        } else {
            alert("Failed to save brief.");
        }
    }
  };

  const handleDelete = async (id: string) => {
     if(window.confirm("Delete this Brief?")) {
        await api.assets.briefs.delete(id);
        onRefresh();
     }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if(reader.result) {
            setEditImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- EDIT VIEW ---
  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto py-8 animate-fade-in h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6 text-sm text-zinc-500">
           <button onClick={() => setIsEditing(false)} className="hover:text-white flex items-center gap-1">&larr; Back</button>
           <span>/</span>
           <span className="text-white">{currentBrief ? 'Edit Brief' : 'New Brief'}</span>
        </div>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 flex flex-col shadow-2xl flex-1">
             <div className="mb-4">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Brief Name</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder-zinc-700" placeholder="e.g. Q4 Hook Variation A" />
             </div>
             
             <textarea 
               value={editContent} 
               onChange={e => setEditContent(e.target.value)} 
               className="flex-1 w-full bg-black/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 font-mono leading-relaxed outline-none focus:border-orange-500/50 transition-colors resize-none" 
               placeholder="Type content..." 
             />
             
             {/* Image Upload Section */}
             <div className="mt-4 border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase">Attached Visuals</label>
                   <span className="text-[10px] text-zinc-600">{editImages.length} images</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                   {editImages.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 shrink-0 group rounded-lg overflow-hidden border border-zinc-700">
                         <img src={img} className="w-full h-full object-cover" alt="attachment" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => removeImage(idx)} className="text-red-500 hover:text-red-400 font-bold px-2 py-1">&times;</button>
                         </div>
                      </div>
                   ))}
                   <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="w-24 h-24 shrink-0 border border-dashed border-zinc-700 hover:border-orange-500 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors group bg-zinc-900/50"
                   >
                      <span className="text-2xl text-zinc-600 group-hover:text-orange-500 transition-colors">+</span>
                      <span className="text-[9px] text-zinc-600 group-hover:text-orange-500 uppercase font-bold">Upload</span>
                   </button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div>

             <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-zinc-400 text-sm">Cancel</button>
                <button onClick={handleSave} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg font-bold text-sm">Save Brief</button>
             </div>
        </div>
      </div>
    );
  }

  // --- BROWSE VIEW ---
  return (
    <div className="flex h-full animate-fade-in relative">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-zinc-800 pr-4 hidden lg:flex flex-col pt-2 h-full sticky top-0">
        <div className="mb-2 px-2"><div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 mt-2">Library</div></div>
        <div className="flex-1 overflow-y-auto space-y-6 px-2 scrollbar-hide">
            {FOLDER_STRUCTURE.map(folder => (
                <div key={folder.id}>
                    <button onClick={() => { setActiveFolder(folder.id); setActiveSubFolder(null); }} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 group ${activeFolder === folder.id ? 'text-white bg-zinc-800/50' : 'text-zinc-400 hover:text-zinc-200'}`}>
                    <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{folder.icon}</span>
                    <span className="text-sm font-bold tracking-wide">{folder.label}</span>
                    </button>
                    {activeFolder === folder.id && (
                    <div className="ml-9 border-l border-zinc-800 space-y-1 mt-1 pl-2 animate-slide-in-down">
                        <button onClick={() => setActiveSubFolder(null)} className={`block w-full text-left text-xs py-1.5 px-3 rounded-md transition-colors ${!activeSubFolder ? 'text-orange-400 bg-orange-900/10 font-medium' : 'text-zinc-500 hover:text-zinc-300'}`}>All {folder.label}</button>
                        {folder.subFolders.map(sub => (
                            <button key={sub} onClick={() => setActiveSubFolder(sub)} className={`block w-full text-left text-xs py-1.5 px-3 rounded-md transition-colors ${activeSubFolder === sub ? 'text-orange-400 bg-orange-900/10 font-medium' : 'text-zinc-500 hover:text-zinc-300'}`}>{sub}</button>
                        ))}
                    </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 overflow-y-auto px-6 h-full">
         <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/95 z-20 py-4 backdrop-blur-sm border-b border-zinc-800/50">
            <div>
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {FOLDER_STRUCTURE.find(f=>f.id===activeFolder)?.icon} 
                  {FOLDER_STRUCTURE.find(f=>f.id===activeFolder)?.label}
                  {activeSubFolder && <span className="text-zinc-600 font-light">/ {activeSubFolder}</span>}
               </h2>
               <p className="text-xs text-zinc-500 mt-1">{filteredTopics.length} Briefs Found</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
            
            {/* NEW ASSET BUTTON */}
            <div onClick={handleCreateNew} className="group relative flex flex-col items-center justify-center h-[260px] rounded-2xl border-2 border-dashed border-zinc-800 hover:border-orange-500/50 bg-zinc-900/20 hover:bg-zinc-900/50 transition-all cursor-pointer">
               <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-orange-500 group-hover:bg-orange-500/10 flex items-center justify-center mb-3 transition-all shadow-lg">
                  <span className="text-2xl text-zinc-600 group-hover:text-orange-500 transition-colors font-light">+</span>
               </div>
               <h3 className="text-zinc-500 group-hover:text-white font-bold text-xs transition-colors uppercase tracking-wide">Create New</h3>
            </div>

            {/* ASSET CARDS */}
            {filteredTopics.map(topic => {
               const isSelected = selectedIds.includes(topic.id);
               const hasImages = topic.mb_images && topic.mb_images.length > 0;
               
               return (
                  <div 
                     key={topic.id} 
                     onClick={() => onUseTopic ? onUseTopic(topic) : handleEdit(topic)}
                     className={`
                        group relative h-[260px] flex flex-col bg-zinc-900 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl
                        ${isSelected ? 'border-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.3)]' : 'border-zinc-800 hover:border-zinc-700'}
                        ${variant === 'selection' ? 'h-48' : 'h-[260px]'}
                     `}
                  >
                     <CardBackground />
                     
                     {selectionMode === 'multi' && (
                        <div className={`absolute top-4 right-4 z-20 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black/50 border-zinc-600 text-transparent group-hover:border-zinc-400'}`}>
                           ✓
                        </div>
                     )}

                     {!onUseTopic && (
                        <button 
                           onClick={(e) => { 
                              e.stopPropagation(); 
                              e.preventDefault();
                              handleDelete(topic.id); 
                           }}
                           className="absolute top-3 right-3 z-50 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white bg-black/50 hover:bg-red-600/80 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                           title="Delete Brief"
                        >
                           <span className="text-xl leading-none">&times;</span>
                        </button>
                     )}

                     <div className="p-6 h-full flex flex-col relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="text-3xl grayscale group-hover:grayscale-0 transition-all drop-shadow-md">
                              {FOLDER_STRUCTURE.find(f => f.id === topic.mb_folder)?.icon || '📝'}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                 <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">{topic.mb_subFolder || 'General'}</div>
                                 {hasImages && (
                                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
                                       📷 {topic.mb_images?.length}
                                    </span>
                                 )}
                              </div>
                              <h3 className="text-lg font-black text-white leading-none tracking-tight truncate">{topic.mb_title}</h3>
                           </div>
                        </div>

                        <div className="relative flex-1 flex flex-col justify-center">
                           <p className="text-sm text-zinc-300 font-mono leading-relaxed line-clamp-4 opacity-80 whitespace-pre-wrap">
                              {topic.mb_content.split('**')[2] || topic.mb_content || <span className="italic opacity-50">No content defined...</span>}
                           </p>
                        </div>
                     </div>

                     {onUseTopic ? (
                        <button className="absolute bottom-0 left-0 right-0 h-14 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wide uppercase shadow-[0_-10px_40px_rgba(0,0,0,0.5)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex items-center justify-center gap-2 z-20">
                           <span>{selectionMode === 'multi' ? (isSelected ? 'Remove' : 'Add') : 'Select Brief'}</span>
                           <span className="text-lg">{selectionMode === 'multi' ? (isSelected ? '-' : '+') : '✓'}</span>
                        </button>
                     ) : (
                        <button className="absolute bottom-0 left-0 right-0 h-14 bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-xs tracking-wide uppercase shadow-[0_-10px_40px_rgba(0,0,0,0.5)] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex items-center justify-center gap-2 z-20">
                           <span>Edit Brief</span>
                           <span className="text-lg">✎</span>
                        </button>
                     )}
                  </div>
               );
            })}
         </div>
      </div>
    </div>
  );
};

export default TopicLibrary;
