import React, { useState, useEffect } from 'react';
import { CalendarRange, PieChart, Settings, UserCircle } from 'lucide-react';
import { AppData, DayRecord } from './types';
import { loadData, saveData, vibrate } from './services/storage';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import IntroView from './components/IntroView';
import SplashScreen from './components/SplashScreen';
import DayActionSheet from './components/DayActionSheet';
import { format } from 'date-fns';

const App: React.FC = () => {
  // App Data State
  const [data, setData] = useState<AppData>(loadData());
  const [currentView, setCurrentView] = useState<'CALENDAR' | 'STATS' | 'SETTINGS'>('CALENDAR');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingSplash, setIsFadingSplash] = useState(false);
  
  // Handle Splash Screen Lifecycle (Total 3 seconds)
  useEffect(() => {
    // Start fade out at 2.6s to finish by 3.0s
    const fadeTimer = setTimeout(() => {
      setIsFadingSplash(true);
    }, 2600);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); 

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Persist data whenever it changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  const handleUpdateRecord = (date: string, record: DayRecord) => {
    setData(prev => {
        const activeProfileId = prev.activeProfileId;
        const currentProfileRecords = prev.records[activeProfileId] || {};
        return {
          ...prev,
          records: {
            ...prev.records,
            [activeProfileId]: {
              ...currentProfileRecords,
              [date]: record
            }
          }
        };
    });
    setSelectedDate(null);
  };

  const handleUpdateData = (newData: AppData) => {
    setData(newData);
  };

  const handleOnboardingComplete = () => {
    setData(prev => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const activeProfile = data.profiles.find(p => p.id === data.activeProfileId) || data.profiles[0];

  const handleNavClick = (view: typeof currentView) => {
    vibrate(5);
    setCurrentView(view);
  };

  // Note: Splash shows before even checking onboarding status
  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingSplash} />;
  }

  if (data.hasCompletedOnboarding === false) {
    return <IntroView onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white shadow-[0_60px_130px_-40px_rgba(0,0,0,0.18)] relative print:max-w-none print:shadow-none font-sans">
      
      {/* Top Bar */}
      <div className="px-8 py-6 bg-white border-b border-slate-50 flex justify-between items-center z-10 no-print">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[20px] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black font-display text-2xl border border-indigo-100 shadow-sm`}>
                {activeProfile.name.charAt(0)}
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-950 font-display tracking-tight leading-none">Self Log</h1>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-1.5 font-display">{activeProfile.name}</div>
            </div>
        </div>
        <button onClick={() => handleNavClick('SETTINGS')} className="p-3 bg-slate-50 border border-slate-100 rounded-[18px] text-slate-400 active:scale-95 transition-all hover:bg-slate-100">
            <UserCircle className="w-7 h-7" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#fdfdff] print:bg-white">
        {currentView === 'CALENDAR' && <CalendarView data={data} onDateSelect={setSelectedDate} />}
        {currentView === 'STATS' && <StatsView data={data} />}
        {currentView === 'SETTINGS' && <SettingsView data={data} onUpdateData={handleUpdateData} />}
      </div>

      {/* Global Attendance Sheet Overlay */}
      {selectedDate && (
        <DayActionSheet 
          date={selectedDate}
          initialRecord={data.records[data.activeProfileId]?.[format(selectedDate, 'yyyy-MM-dd')]}
          onClose={() => setSelectedDate(null)}
          onSave={(record) => handleUpdateRecord(record.date, record)}
        />
      )}

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-slate-50 px-10 py-4 flex justify-between items-center z-20 pb-safe no-print shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.04)]">
        <NavButton 
            active={currentView === 'CALENDAR'} 
            onClick={() => handleNavClick('CALENDAR')} 
            icon={<CalendarRange className="w-6 h-6" />} 
            label="Log" 
        />
        <NavButton 
            active={currentView === 'STATS'} 
            onClick={() => handleNavClick('STATS')} 
            icon={<PieChart className="w-6 h-6" />} 
            label="Metrics" 
        />
        <NavButton 
            active={currentView === 'SETTINGS'} 
            onClick={() => handleNavClick('SETTINGS')} 
            icon={<Settings className="w-6 h-6" />} 
            label="Setup" 
        />
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-20 py-1 transition-all duration-300 active:scale-90 ${active ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
    >
        <div className={`p-2.5 rounded-[22px] transition-all duration-300 ${active ? 'bg-indigo-50 ring-8 ring-indigo-50/40 translate-y-[-6px] shadow-sm' : ''}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-black mt-2 uppercase tracking-[0.25em] font-display ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
);

export default App;