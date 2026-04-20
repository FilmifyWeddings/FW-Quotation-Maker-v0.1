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
  const [recognition, setRecognition] = React.useState<any>(null);

  React.useEffect(() => {
    // Initialize Web Speech API for real-time visual feedback
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'hi-IN'; // Indian English/Hindi mix context

      recognizer.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            // We'll let Whisper handle the final one for better accuracy, 
            // but we show the interim one for the 'ChatGPT stream' feel
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (interimTranscript) setTranscription(prev => prev + " " + interimTranscript);
      };

      setRecognition(recognizer);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determination of supported mime-type for better quality
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/mp4';
        
      const recorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000 
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: mimeType });
        
        setIsProcessing(true);
        setTranscription("Analyzing High-Accuracy Audio...");
        try {
          // 1. Get High-Accuracy Transcription via Groq (Whisper Large V3)
          const finalStableText = await transcribeWithGroq(audioBlob);
          setTranscription(finalStableText);
          
          // 2. Heavy Reasoning & Error Correction with Gemini 3.1 Pro
          const updates = await updateQuotationWithAI(currentData, finalStableText);
          onUpdate({ ...currentData, ...updates });
        } catch (err: any) {
          console.error(err);
          const msg = err.message || "";
          if (msg.includes("Groq API Key")) {
            alert("Voice accuracy ke liye please Settings mein GROQ API KEY daalein.");
          } else {
            alert("Analysis failed. Phir se try karein.");
          }
        } finally {
          setIsProcessing(false);
        }

        stream.getTracks().forEach(t => t.stop());
      };

      // Start both: High quality recording and real-time visual streaming
      recorder.start();
      if (recognition) {
        setTranscription(""); // Clear previous
        try { recognition.start(); } catch(e) {} 
      }
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Microphone capture failed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      if (recognition) {
        try { recognition.stop(); } catch(e) {}
      }
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
          <div className="bg-brand-bg rounded-3xl p-6 text-center space-y-4 shadow-inner border border-brand-olive/5 relative overflow-hidden">
            {isRecording && <div className="absolute inset-0 bg-brand-olive/5 animate-pulse" />}
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-500 shadow-xl ${
                isRecording ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-brand-olive shadow-brand-olive/30'
              }`}
            >
              {isRecording ? <MicOff className="text-white" size={28} /> : <Mic className="text-white" size={28} />}
            </button>
            <div className="relative z-10 space-y-1">
              <p className="text-xs font-sans text-brand-dark font-bold uppercase tracking-wider">
                {isRecording ? "Listening..." : isProcessing ? "Perfecting with AI..." : "Tap to Speak"}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                {isRecording ? "Seeing text exactly as you speak" : "Powered by Groq Whisper & Gemini 3.1 Pro"}
              </p>
            </div>
          </div>
        </section>

        {/* Input Text Area */}
        <section>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Prompt Editor</label>
          <textarea 
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="Aapki awaaz yahan 'streaming' format mein dikhegi... ya manually type karein."
            className="w-full h-40 p-4 text-xs bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-olive/20 resize-none font-sans shadow-inner scrollbar-hide"
          />
          <button 
            disabled={isProcessing || !transcription.trim()}
            onClick={() => processWithAI(transcription)}
            className="w-full mt-3 bg-brand-olive text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-brand-dark transition active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-olive/10"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={16} /> Update via AI</>}
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
