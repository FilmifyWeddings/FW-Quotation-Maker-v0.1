import React from 'react';
import { QuotationData, PaymentStep, WeddingFunction } from '../types';
import { Plus, X, Camera, Calendar, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  data: QuotationData;
  onChange: (newData: QuotationData) => void;
}

export const QuotationCanvas: React.FC<Props> = ({ data, onChange }) => {

  const updateField = (field: keyof QuotationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateSubField = (list: any[], index: number, value: any, fieldKey: keyof QuotationData) => {
    const newList = [...list];
    newList[index] = value;
    updateField(fieldKey, newList);
  };

  const removeItem = (list: any[], index: number, fieldKey: keyof QuotationData) => {
    const newList = [...list];
    newList.splice(index, 1);
    updateField(fieldKey, newList);
  };

  const addItem = (list: any[], newItem: any, fieldKey: keyof QuotationData) => {
    updateField(fieldKey, [...list, newItem]);
  };

  return (
    <div id="quotation-print-area" className="flex flex-col items-center bg-gray-200 py-10 md:px-0">
      
      {/* PAGE 1: COVER */}
      <section className="a4-page">
        <div className="flex-1 flex flex-col items-center justify-center p-12 py-20">
          <h2 className="font-serif text-[14px] tracking-[0.4em] text-brand-olive uppercase mb-12">
            Wedding Photography & Film
          </h2>
          
          <div className="w-full flex justify-center mb-16">
            <h1 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => updateField('clientName', e.currentTarget.innerText)}
              className="font-serif text-6xl md:text-8xl text-brand-olive text-center uppercase tracking-tight leading-none"
            >
              {data.clientName}
            </h1>
          </div>

          {/* Arch Image Crop */}
          <div className="relative w-full max-w-md aspect-[3/4] overflow-hidden rounded-t-full border-[10px] border-white shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800" 
              alt="Cover" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-16 text-center">
            <p className="font-sans text-[12px] tracking-[0.2em] text-brand-olive uppercase italic">
              Quotation Prepared for Your Special Days
            </p>
          </div>
        </div>
        
        <footer className="h-16 bg-brand-olive flex items-center justify-center px-12">
          <p className="text-white font-serif tracking-widest text-sm italic">Filmify Weddings</p>
        </footer>
      </section>

      {/* PAGE 2: ABOUT & PRE-WED */}
      <section className="a4-page">
        <div className="p-16 flex flex-col h-full">
          <div className="flex gap-12 items-start mb-20">
            <div className="flex-1">
              <h2 className="font-serif text-4xl text-brand-olive mb-6 underline decoration-brand-accent/30 underline-offset-8">
                About Us
              </h2>
              <p className="font-sans text-sm leading-relaxed text-gray-700 italic">
                We are more than just photographers. We are storytellers dedicated to capturing 
                the silence between glances and the loudness of shared laughter. Our goal is to 
                make your memories immortal.
              </p>
            </div>
            <div className="w-48 h-64 overflow-hidden rounded-lg shadow-lg rotate-3 bg-white p-2">
              <img 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400" 
                className="w-full h-full object-cover rounded" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex-1 border-t border-brand-olive/20 pt-12">
            <div className="flex items-center gap-4 mb-8">
               <Camera className="text-brand-olive" size={24} />
               <h3 className="font-serif text-2xl text-brand-olive uppercase tracking-wider">
                 Pre-Wedding Deliverables
               </h3>
            </div>
            
            <ul className="space-y-4">
              {data.preWeddingDeliverables.map((item, i) => (
                <li key={i} className="group flex items-center gap-3 font-sans text-sm text-gray-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-olive" />
                  <span 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => updateSubField(data.preWeddingDeliverables, i, e.currentTarget.innerText, 'preWeddingDeliverables')}
                    className="flex-1"
                  >
                    {item}
                  </span>
                  <button 
                    onClick={() => removeItem(data.preWeddingDeliverables, i, 'preWeddingDeliverables')}
                    className="no-print opacity-0 group-hover:opacity-100 text-red-400 p-1"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => addItem(data.preWeddingDeliverables, 'New Deliverable', 'preWeddingDeliverables')}
              className="no-print mt-6 flex items-center gap-2 text-xs text-brand-olive border border-brand-olive px-3 py-1.5 rounded-full hover:bg-brand-olive hover:text-white transition"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>
        </div>
      </section>

      {/* PAGE 3: FUNCTIONS TIMELINE */}
      <section className="a4-page">
        <div className="p-16">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl text-brand-olive uppercase tracking-[0.2em] mb-4">
              The Celebrations
            </h2>
            <div className="h-px w-24 bg-brand-olive mx-auto mb-4" />
          </div>

          <div className="space-y-12">
            {data.functions.map((fn, idx) => (
              <div key={fn.id} className="group relative border-l-2 border-brand-olive/30 pl-8 ml-4">
                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-brand-bg border-4 border-brand-olive" />
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 
                      contentEditable 
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newFns = [...data.functions];
                        newFns[idx].name = e.currentTarget.innerText;
                        updateField('functions', newFns);
                      }}
                      className="font-serif text-2xl text-brand-dark uppercase"
                    >
                      {fn.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium uppercase mt-1">
                      <span 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newFns = [...data.functions];
                          newFns[idx].date = e.currentTarget.innerText;
                          updateField('functions', newFns);
                        }}
                      >{fn.date}</span>
                      <span>•</span>
                      <span
                         contentEditable 
                         suppressContentEditableWarning
                         onBlur={(e) => {
                           const newFns = [...data.functions];
                           newFns[idx].time = e.currentTarget.innerText;
                           updateField('functions', newFns);
                         }}
                      >{fn.time}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(data.functions, idx, 'functions')}
                    className="no-print opacity-0 group-hover:opacity-100 text-red-400 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fn.services.map((s, sIdx) => (
                    <div key={sIdx} className="group/service flex items-center gap-2 bg-white/40 p-2 rounded border border-brand-olive/10">
                      <Calendar size={12} className="text-brand-olive" />
                      <span 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newFns = [...data.functions];
                          newFns[idx].services[sIdx] = e.currentTarget.innerText;
                          updateField('functions', newFns);
                        }}
                        className="text-[11px] font-sans flex-1"
                      >
                        {s}
                      </span>
                      <button 
                        onClick={() => {
                          const newFns = [...data.functions];
                          newFns[idx].services.splice(sIdx, 1);
                          updateField('functions', newFns);
                        }}
                        className="no-print opacity-0 group-hover/service:opacity-100 text-red-300"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newFns = [...data.functions];
                      newFns[idx].services.push('New Service');
                      updateField('functions', newFns);
                    }}
                    className="no-print border border-dashed border-brand-olive/30 text-[10px] py-1 rounded hover:bg-white"
                  >
                    + Add Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => addItem(data.functions, { id: Math.random().toString(), date: 'TBD', name: 'NEW EVENT', time: 'TBD', services: [] }, 'functions')}
            className="no-print mt-10 w-full flex justify-center items-center gap-2 text-sm text-brand-olive py-3 border-2 border-dashed border-brand-olive/30 rounded-lg hover:bg-white transition"
          >
            <Plus size={18} /> Add Wedding Function
          </button>
        </div>
      </section>

      {/* PAGE 4: PAYMENT SCHEDULE */}
      <section className="a4-page">
        <div className="p-16">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl text-brand-olive uppercase tracking-[0.2em] mb-2">
              Financial Summary
            </h2>
            <p className="font-sans text-[10px] tracking-widest text-gray-500 uppercase">Transparent & Secure Billing</p>
          </div>

          <div className="bg-white/50 rounded-xl overflow-hidden shadow-sm border border-brand-olive/10 mb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-olive text-white text-[11px] tracking-wider uppercase">
                  <th className="p-4 border-r border-white/20">Milestone</th>
                  <th className="p-4 border-r border-white/20">Date</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 no-print text-center w-20">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.paymentSchedule.map((p, pIdx) => (
                  <tr key={p.id} className="border-b border-brand-olive/5 group">
                    <td className="p-4 font-medium" contentEditable suppressContentEditableWarning onBlur={(e) => {
                      const newSched = [...data.paymentSchedule];
                      newSched[pIdx].step = e.currentTarget.innerText;
                      updateField('paymentSchedule', newSched);
                    }}>{p.step}</td>
                    <td className="p-4 italic text-gray-500" contentEditable suppressContentEditableWarning onBlur={(e) => {
                      const newSched = [...data.paymentSchedule];
                      newSched[pIdx].date = e.currentTarget.innerText;
                      updateField('paymentSchedule', newSched);
                    }}>{p.date}</td>
                    <td className="p-4 text-right font-serif text-lg text-brand-olive">
                      ₹<span contentEditable suppressContentEditableWarning onBlur={(e) => {
                        const newSched = [...data.paymentSchedule];
                        newSched[pIdx].amount = parseInt(e.currentTarget.innerText.replace(/,/g,'')) || 0;
                        updateField('paymentSchedule', newSched);
                      }}>{p.amount.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-center no-print">
                      <button 
                        onClick={() => {
                          const newSched = [...data.paymentSchedule];
                          newSched[pIdx].status = p.status === 'Pending' ? 'Completed' : 'Pending';
                          updateField('paymentSchedule', newSched);
                        }}
                        className={`transition ${p.status === 'Completed' ? 'text-green-600' : 'text-gray-300'}`}
                      >
                        {p.status === 'Completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center bg-brand-olive text-white p-6 rounded-lg shadow-lg">
            <span className="font-serif text-xl tracking-widest">TOTAL QUOTATION</span>
            <span className="font-serif text-3xl">
              ₹<span contentEditable suppressContentEditableWarning onBlur={(e) => {
                const total = parseInt(e.currentTarget.innerText.replace(/,/g,'')) || 0;
                updateField('finalAmount', total);
              }}>{data.finalAmount.toLocaleString()}</span>
            </span>
          </div>
          
          <button 
            onClick={() => addItem(data.paymentSchedule, { id: Math.random().toString(), date: 'TBD', step: 'New Step', amount: 0, status: 'Pending' }, 'paymentSchedule')}
            className="no-print mt-4 text-xs text-brand-olive font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Add Payment Step
          </button>
        </div>
      </section>

      {/* PAGE 5: TERMS & CONDITIONS */}
      <section className="a4-page">
        <div className="p-16 flex flex-col h-full">
          <h2 className="font-serif text-3xl text-brand-olive mb-12 border-b border-brand-olive/20 pb-4 uppercase tracking-widest">
            Terms & Contract
          </h2>

          <div className="space-y-10 flex-1">
            <div>
              <h3 className="font-sans text-[11px] font-bold text-brand-olive uppercase tracking-[0.2em] mb-4">Photoshoot & Travel</h3>
              <ul className="space-y-3">
                {data.termsPhotoshoot.map((t, i) => (
                  <li key={i} className="group flex items-start gap-4 text-xs text-gray-700 leading-relaxed">
                    <span className="text-brand-olive font-serif">0{i+1}.</span>
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => updateSubField(data.termsPhotoshoot, i, e.currentTarget.innerText, 'termsPhotoshoot')} className="flex-1">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-sans text-[11px] font-bold text-brand-olive uppercase tracking-[0.2em] mb-4">Delivery Timeline</h3>
              <ul className="space-y-3">
                {data.termsDeliverables.map((t, i) => (
                  <li key={i} className="group flex items-start gap-4 text-xs text-gray-700 leading-relaxed">
                    <span className="text-brand-olive font-serif">0{i+1}.</span>
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => updateSubField(data.termsDeliverables, i, e.currentTarget.innerText, 'termsDeliverables')} className="flex-1">{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-sans text-[11px] font-bold text-brand-olive uppercase tracking-[0.2em] mb-4">Album Policies</h3>
              <ul className="space-y-3">
                {data.termsAlbum.map((t, i) => (
                  <li key={i} className="group flex items-start gap-4 text-xs text-gray-700 leading-relaxed">
                    <span className="text-brand-olive font-serif">0{i+1}.</span>
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => updateSubField(data.termsAlbum, i, e.currentTarget.innerText, 'termsAlbum')} className="flex-1">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-auto border-t-2 border-brand-olive pt-12 flex justify-between">
            <div className="w-48 text-center">
              <div className="h-px bg-gray-400 mb-2" />
              <p className="text-[10px] text-gray-500 font-bold uppercase">Client Signature</p>
            </div>
            <div className="w-48 text-center">
              <div className="h-px bg-gray-400 mb-2" />
              <p className="text-[10px] text-gray-500 font-bold uppercase">Studio Manager</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
