import React from 'react';
import { Mic, MicOff, Sparkles, Save, Cloud, Loader2, Printer } from 'lucide-react';
import { updateQuotationWithAI, transcribeWithGroq } from '../services/geminiService';
import { QuotationData } from '../types';

interface Props {
  currentData: QuotationData;
  onUpdate: (newData: QuotationData) => void;
  onSave: () => void;
  onPrint: () => void;
}

export const AIControlPanel: React.FC<Props> = ({ currentData, onUpdate, onSave, onPrint }) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [transcription, setTranscription] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        setIsProcessing(true);
        try {
          // 1. Transcription via Groq (Whisper Large V3)
          const text = await transcribeWithGroq(audioBlob);
          setTranscription(text);
          
          // 2. Process with Gemini
          const updates = await updateQuotationWithAI(currentData, text);
          onUpdate({ ...currentData, ...updates });
        } catch (err: any) {
          console.error(err);
          const msg = err.message || "";
          if (msg.includes("Groq API Key")) {
            alert("Voice accuracy ke liye please Settings mein GROQ API KEY daalein (It's Free!).");
          } else {
            alert("Voice capture fail hua. Phir se try karein.");
          }
        } finally {
          setIsProcessing(false);
        }

        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Microphone capture failed. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processWithAI = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const updates = await updateQuotationWithAI(currentData, text);
      onUpdate({ ...currentData, ...updates });
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("401") || msg.includes("key")) {
        alert("Settings mein check karein, Gemini API key sahi nahi hai.");
      } else {
        alert("Gemini busy hai ya prompt bahut bada hai. Phir se try karein.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="no-print w-full md:w-96 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col shadow-2xl">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
         <h2 className="font-serif text-2xl text-brand-olive font-bold">Filmify AI</h2>
         <div className="bg-brand-bg p-2 rounded-full"><Sparkles className="text-brand-olive" size={18} /></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Voice Section */}
        <section>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Voice Assistant</label>
          <div className="bg-brand-bg rounded-3xl p-6 text-center space-y-4 shadow-inner border border-brand-olive/5">
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-500 shadow-xl ${
                isRecording ? 'bg-red-500 scale-110 shadow-red-200 pulse' : 'bg-brand-olive shadow-brand-olive/30'
              }`}
            >
              {isRecording ? <MicOff className="text-white" size={28} /> : <Mic className="text-white" size={28} />}
            </button>
            <p className="text-xs font-sans text-brand-dark font-medium">
              {isRecording ? "Boaliye, hum sun rahe hain..." : "Start recording to edit via voice"}
            </p>
          </div>
        </section>

        {/* Input Text Area */}
        <section>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Prompt Editor</label>
          <textarea 
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="Example: 'Engagement event add kar do 50k mein' or 'Terms update karo'"
            className="w-full h-32 p-4 text-xs bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-olive/20 resize-none font-sans"
          />
          <button 
            disabled={isProcessing}
            onClick={() => processWithAI(transcription)}
            className="w-full mt-3 bg-brand-dark text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={18} /> Update via AI</>}
          </button>
        </section>

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
           <p className="text-[10px] text-blue-700 leading-relaxed font-sans font-medium">
             💡 AI use karke aap events add kar sakte hain, amounts update kar sakte hain aur deliverables badal sakte hain.
           </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
        <button 
          onClick={onSave}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:bg-green-700 transition active:scale-95"
        >
          <Cloud size={20} /> Save to Cloud
        </button>
        <button 
          onClick={onPrint}
          className="w-full bg-white border-2 border-brand-olive text-brand-olive font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-bg transition active:scale-95"
        >
          <Printer size={20} /> Download PDF
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1.1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.15); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { transform: scale(1.1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .pulse { animation: pulse 1.5s infinite; }
      `}</style>
    </div>
  );
};
