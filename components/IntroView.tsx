import React, { useState } from 'react';
import { CalendarCheck, PieChart, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { vibrate } from '../services/storage';

interface IntroViewProps {
  onComplete: () => void;
}

const IntroView: React.FC<IntroViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <CalendarCheck className="w-16 h-16 text-blue-600" />,
      title: "Track Daily Work",
      desc: "Mark attendance, shifts, and overtime with a single tap. Keep your work log organized."
    },
    {
      icon: <PieChart className="w-16 h-16 text-purple-600" />,
      title: "Smart Insights",
      desc: "Visualize your monthly performance. Generate PDF reports instantly for your records."
    },
    {
      icon: <ShieldCheck className="w-16 h-16 text-emerald-600" />,
      title: "Offline & Secure",
      desc: "Your data stays on your device. Works completely offline with secure local backup."
    }
  ];

  const handleNext = () => {
    vibrate(10);
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      vibrate([10, 50, 10]);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-8 animate-fade-in">
      <div className="w-full flex justify-end">
        <button onClick={onComplete} className="text-slate-400 font-medium text-sm p-2">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto">
        <div className="mb-10 p-6 bg-slate-50 rounded-[32px] shadow-sm border border-slate-100 animate-slide-up">
            {slides[step].icon}
        </div>
        <h2 className="text-3xl font-semibold text-slate-800 mb-4 animate-fade-in key-{step}">
            {slides[step].title}
        </h2>
        <p className="text-base text-slate-500 font-normal leading-relaxed animate-fade-in key-{step}-desc">
            {slides[step].desc}
        </p>
      </div>

      <div className="w-full flex flex-col items-center gap-8 mb-8">
        {/* Indicators */}
        <div className="flex gap-2">
            {slides.map((_, i) => (
                <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`} 
                />
            ))}
        </div>

        <button 
            onClick={handleNext}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
            {step === slides.length - 1 ? (
                <>Get Started <Check className="w-5 h-5" /></>
            ) : (
                <>Next <ArrowRight className="w-5 h-5" /></>
            )}
        </button>
      </div>
    </div>
  );
};

export default IntroView;