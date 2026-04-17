/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { QuotationData, BLANK_QUOTATION } from './types';
import { Dashboard } from './components/Dashboard';
import { AIControlPanel } from './components/AIControlPanel';
import { QuotationCanvas } from './components/QuotationCanvas';
import { fetchAllQuotations, saveQuotation, deleteQuotationFromCloud } from './services/sheetService';
import { LogOut, ArrowLeft, Loader2, Save, Sparkles } from 'lucide-react';

export default function App() {
  const [view, setView] = React.useState<'dashboard' | 'editor'>('dashboard');
  const [quotations, setQuotations] = React.useState<QuotationData[]>([]);
  const [currentQuote, setCurrentQuote] = React.useState<QuotationData>(BLANK_QUOTATION);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Load history on mount
  React.useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await fetchAllQuotations();
      setQuotations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentQuote({ ...BLANK_QUOTATION, id: Math.random().toString(36).substr(2, 9) });
    setView('editor');
  };

  const handleEdit = (q: QuotationData) => {
    setCurrentQuote(q);
    setView('editor');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    await deleteQuotationFromCloud(id);
    loadQuotes();
  };

  const handleUpdate = (newData: QuotationData) => {
    setCurrentQuote(newData);
  };

  const handleCloudSave = async () => {
    setSaving(true);
    try {
      await saveQuotation(currentQuote);
      alert("Quotation saved successfully to Google Sheets!");
      loadQuotes();
    } catch (err) {
      alert("Saving failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && view === 'dashboard') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-bg font-serif">
         <Loader2 className="animate-spin text-brand-olive mb-4" size={48} />
         <p className="text-brand-olive tracking-widest uppercase text-sm font-bold">Connecting to Sheets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {view === 'dashboard' ? (
        <main className="animate-in fade-in duration-700">
           <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-olive rounded-xl rotate-6 flex items-center justify-center text-white shadow-lg shadow-brand-olive/20 italic font-serif">F</div>
                <span className="font-serif font-bold text-xl tracking-tight text-brand-olive uppercase">Filmify <span className="text-gray-400 font-sans text-xs tracking-[0.2em] font-medium ml-1">Pro</span></span>
             </div>
             <div className="flex items-center gap-4">
                <div className="hidden md:block text-right">
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dashboard Active</p>
                   <p className="text-xs font-semibold">Sheets DB Connected</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-bg" />
             </div>
           </div>
           
           <Dashboard 
             quotations={quotations} 
             onEdit={handleEdit} 
             onDelete={handleDelete} 
             onCreate={handleCreate} 
           />
        </main>
      ) : (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-200 animate-in slide-in-from-right duration-500">
          <AIControlPanel 
            currentData={currentQuote} 
            onUpdate={handleUpdate} 
            onSave={handleCloudSave} 
            onPrint={handlePrint}
          />

          <main className="flex-1 h-screen overflow-y-auto relative no-scrollbar">
            {/* Float Header in Editor */}
            <header className="no-print sticky top-0 z-40 px-8 py-6 flex justify-between items-center w-full max-w-[210mm] mx-auto pointer-events-none">
               <button 
                 onClick={() => setView('dashboard')}
                 className="pointer-events-auto bg-white/90 backdrop-blur shadow-xl rounded-2xl px-5 py-3 flex items-center gap-2 font-bold text-xs text-brand-dark hover:scale-105 transition"
               >
                 <ArrowLeft size={16} /> Dashboard
               </button>
               
               <div className="pointer-events-auto flex items-center gap-3">
                 <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl px-5 py-3 text-xs flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="font-bold uppercase tracking-widest text-gray-500">{saving ? "Saving..." : "Ready to Print"}</span>
                 </div>
               </div>
            </header>

            <QuotationCanvas data={currentQuote} onChange={handleUpdate} />
          </main>

          {/* Floating Save Button Mobile Only */}
          <div className="no-print fixed bottom-6 right-6 md:hidden">
             <button 
               onClick={handleCloudSave}
               className="w-16 h-16 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition"
             >
               <Save size={28} />
             </button>
          </div>
        </div>
      )}

      {/* Styles for no-scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          .no-scrollbar { overflow: visible; }
        }
      `}</style>
    </div>
  );
}
