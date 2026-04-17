import React from 'react';
import { Settings, X, Save, Lock, Database, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = React.useState({
    GEMINI_API_KEY: localStorage.getItem('GEMINI_API_KEY') || '',
    GOOGLE_SHEETS_URL: localStorage.getItem('GOOGLE_SHEETS_URL') || '',
  });

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('GEMINI_API_KEY', keys.GEMINI_API_KEY);
    localStorage.setItem('GOOGLE_SHEETS_URL', keys.GOOGLE_SHEETS_URL);
    alert("Settings updated! The app will now use these keys.");
    onClose();
    window.location.reload(); // Reload to apply changes across services
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 scale-in-center">
        <div className="p-8 bg-brand-bg/50 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-olive rounded-xl text-white">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-brand-olive">App Settings</h2>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Configuration & API Keys</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              <Sparkles size={12} className="text-amber-500" /> Gemini API Key
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                <Lock size={16} />
              </div>
              <input 
                type="password"
                value={keys.GEMINI_API_KEY}
                onChange={(e) => setKeys({ ...keys, GEMINI_API_KEY: e.target.value })}
                placeholder="Paste AI Studio Key here..."
                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-olive/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-sans transition-all outline-none"
              />
            </div>
            <p className="text-[9px] text-gray-400 ml-1">Used for Audio analysis and JSON updates. <a href="https://aistudio.google.com/" target="_blank" className="text-brand-olive underline">Get key here.</a></p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              <Database size={12} className="text-blue-500" /> Google Sheets App Script URL
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                <Database size={16} />
              </div>
              <input 
                type="text"
                value={keys.GOOGLE_SHEETS_URL}
                onChange={(e) => setKeys({ ...keys, GOOGLE_SHEETS_URL: e.target.value })}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-olive/20 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-sans transition-all outline-none"
              />
            </div>
            <p className="text-[9px] text-gray-400 ml-1">For cloud storage. Deploy your Apps Script as 'Web App' to get this URL.</p>
          </div>
        </div>

        <div className="p-8 bg-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 font-bold text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-[2] py-4 bg-brand-olive text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark shadow-lg shadow-brand-olive/20 transition active:scale-95"
          >
            <Save size={18} /> Update & Save
          </button>
        </div>
      </div>

      <style>{`
        .scale-in-center {
          animation: scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        @keyframes scale-in-center {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
