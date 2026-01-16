import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isFadingOut: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [creditVisible, setCreditVisible] = useState(false);

  useEffect(() => {
    // Sequential animation sequence
    const logoTimer = setTimeout(() => setLogoVisible(true), 100);
    const nameTimer = setTimeout(() => setNameVisible(true), 400);
    const creditTimer = setTimeout(() => setCreditVisible(true), 800);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(nameTimer);
      clearTimeout(creditTimer);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(165deg, #f1f5f9 0%, #e2e8f0 100%)'
      }}
    >
      {/* Decorative Blur for "Premium" feel */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-slate-500/5 blur-[100px] rounded-full" />

      <div className="flex flex-col items-center text-center px-8 z-10">
        
        {/* 1. SIMPLE LOGO */}
        <div 
          className={`mb-8 transition-all duration-700 transform ${
            logoVisible ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
        >
          <div className="w-20 h-20 bg-white rounded-[24px] shadow-xl shadow-slate-200/50 flex items-center justify-center border border-slate-100">
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-indigo-600"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M9 16l2 2 4-4"></path>
            </svg>
          </div>
        </div>

        {/* 2. APP NAME */}
        <h1 
          className={`font-sans font-semibold text-[28px] sm:text-[32px] text-slate-900 tracking-[0.01em] transition-all duration-700 transform ${
            nameVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          SELF ATTENDANCE APP
        </h1>

        {/* 3. DEVELOPER CREDIT */}
        <p 
          className={`mt-3 font-sans text-sm text-slate-500/70 tracking-wide transition-all duration-700 ${
            creditVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Developed by Dipak Jadhav
        </p>
      </div>

      {/* Progress Indicator (Subtle) */}
      <div className="absolute bottom-16 w-32 h-[1px] bg-slate-200">
         <div className="h-full bg-indigo-500 animate-[loading-bar_3s_linear_forwards]" />
      </div>

      <style>{`
        @keyframes loading-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;