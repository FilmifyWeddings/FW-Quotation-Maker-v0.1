import React from 'react';
import { QuotationData } from '../types';
import { FileText, Plus, Trash2, Edit3, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  quotations: QuotationData[];
  onEdit: (q: QuotationData) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export const Dashboard: React.FC<Props> = ({ quotations, onEdit, onDelete, onCreate }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = quotations.filter(q => 
    q.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="font-serif text-4xl text-brand-olive font-bold mb-2">My Collections</h1>
          <p className="text-gray-500 font-sans tracking-tight">Manage your professional wedding quotations</p>
        </div>
        
        <button 
          onClick={onCreate}
          className="bg-brand-olive text-white px-8 py-3 rounded-full flex items-center gap-2 font-bold shadow-lg shadow-brand-olive/20 hover:scale-105 transition active:scale-95"
        >
          <Plus size={20} /> Create New Quote
        </button>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Khwaish ka naam search karein..." 
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-brand-olive/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((q, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={q.id || i} 
            className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-bg rounded-bl-full -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all opacity-20" />
            
            <div className="mb-6">
              <span className="text-[10px] font-bold text-brand-olive uppercase tracking-widest bg-brand-bg px-2 py-1 rounded">Quotation</span>
              <h3 className="font-serif text-2xl text-brand-dark mt-3 truncate">{q.clientName}</h3>
              <p className="text-sm text-gray-400 mt-1 italic">Last modified: {new Date(q.lastModified || '').toLocaleDateString()}</p>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="text-brand-olive font-bold text-xl">
                ₹{q.finalAmount?.toLocaleString()}
              </div>
              <div className="text-gray-400 flex items-center gap-1 text-xs">
                 <FileText size={14} /> {q.functions.length} Events
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => onEdit(q)}
                className="flex-1 bg-brand-bg text-brand-olive font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-olive hover:text-white transition"
              >
                <Edit3 size={16} /> Open
              </button>
              <button 
                onClick={() => onDelete(q.id)}
                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Koi quotation nahi mila.</p>
          </div>
        )}
      </div>
    </div>
  );
};
