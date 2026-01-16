import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  isFadingOut: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [creditVisible, setCreditVisible] = useState(false);

  useEffect(() => {
    // Sequential animation sequence for a professional choreographed entrance
    const logoTimer = setTimeout(() => setLogoVisible(true), 150);
    const nameTimer = setTimeout(() => setNameVisible(true), 500);
    const creditTimer = setTimeout(() => setCreditVisible(true), 900);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(nameTimer);
      clearTimeout(creditTimer);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center transition-all duration-800 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(165deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      {/* Dark theme overlay */}
      <div className="dark:block hidden absolute inset-0 bg-slate-950 opacity-100" />
      
      {/* Decorative Premium Blurs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="flex flex-col items-center text-center px-8 z-10">
        
        {/* 1. MINIMAL LOGO */}
        <div 
          className={`mb-10 transition-all duration-1000 transform ${
            logoVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-90 -rotate-6'
          }`}
        >
          <div className="w-22 h-22 bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-none flex items-center justify-center border border-white dark:border-slate-800">
            <svg 
              width="44" 
              height="44" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-indigo-600 dark:text-indigo-400"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="M9 14l2 2 4-4"></path>
            </svg>
          </div>
        </div>

        {/* 2. APP NAME */}
        <div className={`transition-all duration-800 transform ${
            nameVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          <h1 className="font-display font-extrabold text-[32px] sm:text-[36px] text-slate-900 dark:text-white tracking-tight">
            SELF <span className="text-indigo-600 dark:text-indigo-400">LOG</span>
          </h1>
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] mt-1 font-display">
            Attendance Suite
          </p>
        </div>

        {/* 3. ENHANCED DEVELOPER CREDIT */}
        <div 
          className={`mt-16 flex flex-col items-center transition-all duration-1000 transform ${
            creditVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[1px] w-6 bg-slate-300 dark:bg-slate-800" />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-display">
              Developed By
            </span>
            <div className="h-[1px] w-6 bg-slate-300 dark:bg-slate-800" />
          </div>
          
          <span className="text-xl font-bold text-slate-800 dark:text-slate-200 font-display tracking-wide drop-shadow-sm">
            Dipak Jadhav
          </span>
          
          <div className="mt-4 flex gap-1">
            <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
            <div className="w-1 h-1 rounded-full bg-indigo-500/20" />
            <div className="w-1 h-1 rounded-full bg-indigo-500/10" />
          </div>
        </div>
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-12 w-40 h-[2px] bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
         <div className="h-full bg-indigo-500 dark:bg-indigo-400 animate-[loading-bar_3s_linear_forwards]" />
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