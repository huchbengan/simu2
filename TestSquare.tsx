import React, { useState } from 'react';
import { Article } from '../types';

interface TestSquareProps {
  articles: Article[];
}

const TestSquare: React.FC<TestSquareProps> = ({ articles }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        <button 
          onClick={() => setSelectedArticle(null)} 
          className="mb-6 text-zinc-400 hover:text-white flex items-center gap-2"
        >
          &larr; Back to Plaza
        </button>

        <article className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
           {selectedArticle.coverImage && (
             <div className="h-64 md:h-96 w-full relative">
               <img src={selectedArticle.coverImage} className="w-full h-full object-cover" alt="Cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
             </div>
           )}
           
           <div className="p-8 md:p-12">
              <div className="flex gap-2 mb-6">
                {selectedArticle.tags.map(tag => (
                   <span key={tag} className="text-xs font-bold text-orange-400 bg-orange-900/20 px-3 py-1 rounded-full uppercase tracking-wider">
                     {tag}
                   </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {selectedArticle.title}
              </h1>

              <div className="flex items-center gap-4 mb-10 border-b border-zinc-800 pb-8">
                 <img src={selectedArticle.authorAvatar} className="w-12 h-12 rounded-full border-2 border-zinc-700" alt={selectedArticle.authorName}/>
                 <div>
                    <p className="text-white font-medium">{selectedArticle.authorName}</p>
                    <p className="text-zinc-500 text-sm">
                       {new Date(selectedArticle.createdAt).toLocaleDateString()} • {Math.ceil(selectedArticle.content.length / 500)} min read
                    </p>
                 </div>
              </div>

              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-orange-500">
                <div dangerouslySetInnerHTML={{ 
                  __html: selectedArticle.content
                    .replace(/^# (.*$)/gim, '') // Remove H1 as we render it separately
                    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
                    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\n/gim, '<br/>')
                }} />
              </div>
           </div>
        </article>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center py-12 bg-gradient-to-b from-zinc-900 to-black rounded-3xl border border-zinc-800">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Public Reports</h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Explore real market analyses, competitor breakdowns, and decision case studies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map(article => (
           <div 
             key={article.id}
             onClick={() => setSelectedArticle(article)}
             className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] hover:border-orange-500/50 transition-all duration-300 group flex flex-col h-full"
           >
              <div className="h-48 bg-zinc-800 relative overflow-hidden">
                {article.coverImage ? (
                  <img src={article.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={article.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <span className="text-4xl">📊</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                   <div className="flex gap-2">
                     {article.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] font-bold bg-black/80 backdrop-blur text-white px-2 py-1 rounded">
                           {t}
                        </span>
                     ))}
                   </div>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                 <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {article.title}
                 </h3>
                 <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">
                    {article.summary}
                 </p>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                       <img src={article.authorAvatar} className="w-6 h-6 rounded-full" />
                       <span className="text-xs text-zinc-500">{article.authorName}</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                       {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                 </div>
              </div>
           </div>
        ))}

        {articles.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <div className="inline-block p-6 rounded-full bg-zinc-900 mb-4 border border-zinc-800">
                <svg className="w-12 h-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
             </div>
             <p className="text-zinc-400 text-lg">The Plaza is empty.</p>
             <p className="text-zinc-600">Be the first to share your simulation results!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSquare;