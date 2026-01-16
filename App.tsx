import React, { useState, useEffect, useMemo } from 'react';
import { CalendarRange, PieChart, Settings, UserCircle, Sun, Moon } from 'lucide-react';
import { AppData, DayRecord } from './types';
import { loadData, saveData, vibrate, DEFAULT_PROFILE } from './services/storage';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import IntroView from './components/IntroView';
import SplashScreen from './components/SplashScreen';
import DayActionSheet from './components/DayActionSheet';
import { format } from 'date-fns';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => loadData());
  const [currentView, setCurrentView] = useState<'CALENDAR' | 'STATS' | 'SETTINGS'>('CALENDAR');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingSplash, setIsFadingSplash] = useState(false);
  
  useEffect(() => {
    try {
      if (data?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, [data?.theme]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFadingSplash(true), 2600);
    const removeTimer = setTimeout(() => setShowSplash(false), 3000); 
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  const handleUpdateRecord = (date: string, record: DayRecord) => {
    if (!data) return;
    setData(prev => {
        const activeProfileId = prev.activeProfileId || 'default';
        const currentProfileRecords = prev.records?.[activeProfileId] || {};
        return {
          ...prev,
          records: {
            ...prev.records,
            [activeProfileId]: { ...currentProfileRecords, [date]: record }
          }
        };
    });
    setSelectedDate(null);
  };

  const handleUpdateData = (newData: AppData) => { if (newData) setData(newData); };

  const toggleTheme = () => {
    const newTheme = data?.theme === 'dark' ? 'light' : 'dark';
    vibrate(15);
    setData(prev => ({ ...prev, theme: newTheme }));
  };

  const handleOnboardingComplete = () => {
    setData(prev => ({ ...prev, hasCompletedOnboarding: true }));
  };

  const activeProfile = useMemo(() => {
    return (data?.profiles || []).find(p => p.id === data?.activeProfileId) || data?.profiles?.[0] || DEFAULT_PROFILE;
  }, [data?.profiles, data?.activeProfileId]);

  const handleNavClick = (view: typeof currentView) => {
    vibrate(5);
    setCurrentView(view);
  };

  if (showSplash) return <SplashScreen isFadingOut={isFadingSplash} />;

  if (data?.hasCompletedOnboarding === false) {
    return <IntroView onComplete={handleOnboardingComplete} />;
  }

  // Defensive calculation for initial record
  const currentDayRecord = useMemo(() => {
    if (!selectedDate || !data?.records || !data?.activeProfileId) return undefined;
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      return data.records[data.activeProfileId]?.[dateKey];
    } catch {
      return undefined;
    }
  }, [selectedDate, data]);

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-white dark:bg-slate-950 shadow-[0_60px_130px_-40px_rgba(0,0,0,0.18)] relative print:max-w-none print:shadow-none font-sans overflow-hidden">
      
      <div className="px-8 py-6 bg-white dark:bg-slate-950 border-b border-slate-50 dark:border-slate-900 flex justify-between items-center z-10 no-print">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[20px] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black font-display text-2xl border border-indigo-100 dark:border-indigo-800">
                {activeProfile?.name?.charAt(0) || 'J'}
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white font-display tracking-tight leading-none">Self Log</h1>
                <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em] mt-1.5 font-display">{activeProfile?.name || 'Main Job'}</div>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[18px] text-slate-400 active:scale-95 transition-all">
                {data?.theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button onClick={() => handleNavClick('SETTINGS')} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[18px] text-slate-400 active:scale-95 transition-all">
                <UserCircle className="w-6 h-6" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#fdfdff] dark:bg-slate-950 print:bg-white">
        {currentView === 'CALENDAR' && <CalendarView data={data} onDateSelect={setSelectedDate} />}
        {currentView === 'STATS' && <StatsView data={data} />}
        {currentView === 'SETTINGS' && <SettingsView data={data} onUpdateData={handleUpdateData} />}
      </div>

      {selectedDate && (
        <DayActionSheet 
          date={selectedDate}
          initialRecord={currentDayRecord}
          onClose={() => setSelectedDate(null)}
          onSave={(record) => handleUpdateRecord(record.date, record)}
        />
      )}

      <div className="bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 px-10 py-4 flex justify-between items-center z-20 pb-safe no-print">
        <NavButton active={currentView === 'CALENDAR'} onClick={() => handleNavClick('CALENDAR')} icon={<CalendarRange className="w-6 h-6" />} label="Log" />
        <NavButton active={currentView === 'STATS'} onClick={() => handleNavClick('STATS')} icon={<PieChart className="w-6 h-6" />} label="Metrics" />
        <NavButton active={currentView === 'SETTINGS'} onClick={() => handleNavClick('SETTINGS')} icon={<Settings className="w-6 h-6" />} label="Setup" />
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-20 py-1 transition-all active:scale-90 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>
        <div className={`p-2.5 rounded-[22px] transition-all ${active ? 'bg-indigo-50 dark:bg-indigo-950 ring-8 ring-indigo-50/40 dark:ring-indigo-900/20 translate-y-[-6px]' : ''}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-black mt-2 uppercase tracking-[0.25em] font-display ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
);

export default App;
