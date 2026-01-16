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
  const [data, setData] = useState<AppData | null>(null);
  const [currentView, setCurrentView] = useState<'CALENDAR' | 'STATS' | 'SETTINGS'>('CALENDAR');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingSplash, setIsFadingSplash] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    setData(loadData());
  }, []);
  
  useEffect(() => {
    if (data?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data?.theme]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsFadingSplash(true), 2600);
    const removeTimer = setTimeout(() => setShowSplash(false), 3000); 
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  const activeProfile = useMemo(() => {
    if (!data) return DEFAULT_PROFILE;
    return (data.profiles || []).find(p => p.id === data.activeProfileId) || data.profiles?.[0] || DEFAULT_PROFILE;
  }, [data]);

  if (showSplash) return <SplashScreen isFadingOut={isFadingSplash} />;
  if (!data) return <div style={{padding: 20}}>Initialising application...</div>;

  if (data.hasCompletedOnboarding === false) {
    return <IntroView onComplete={() => setData({...data, hasCompletedOnboarding: true})} />;
  }

  const handleUpdateRecord = (date: string, record: DayRecord) => {
    if (!data) return;
    const activeId = data.activeProfileId || 'default';
    const profileRecords = data.records?.[activeId] || {};
    setData({
      ...data,
      records: {
        ...data.records,
        [activeId]: { ...profileRecords, [date]: record }
      }
    });
    setSelectedDate(null);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white dark:bg-slate-950 shadow-2xl relative overflow-hidden font-sans">
      <div className="px-8 py-6 border-b dark:border-slate-900 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[20px] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-display text-2xl border border-indigo-100 dark:border-indigo-800">
                {activeProfile?.name?.charAt(0) || 'J'}
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-950 dark:text-white font-display tracking-tight leading-none">Self Log</h1>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-display">{activeProfile?.name || 'Main Job'}</div>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setData({...data, theme: data.theme === 'dark' ? 'light' : 'dark'})} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-[18px] text-slate-400 active:scale-95 transition-all">
                {data.theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button onClick={() => setCurrentView('SETTINGS')} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-[18px] text-slate-400 active:scale-95 transition-all">
                <UserCircle className="w-6 h-6" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#fdfdff] dark:bg-slate-950">
        {currentView === 'CALENDAR' && <CalendarView data={data} onDateSelect={setSelectedDate} />}
        {currentView === 'STATS' && <StatsView data={data} />}
        {currentView === 'SETTINGS' && <SettingsView data={data} onUpdateData={setData} />}
      </div>

      {selectedDate && (
        <DayActionSheet 
          date={selectedDate}
          initialRecord={data.records?.[data.activeProfileId]?.[format(selectedDate, 'yyyy-MM-dd')]}
          onClose={() => setSelectedDate(null)}
          onSave={(record) => handleUpdateRecord(record.date, record)}
        />
      )}

      <div className="bg-white dark:bg-slate-950 border-t dark:border-slate-900 px-10 py-4 flex justify-between items-center z-20 pb-safe shadow-2xl">
        <NavButton active={currentView === 'CALENDAR'} onClick={() => setCurrentView('CALENDAR')} icon={<CalendarRange className="w-6 h-6" />} label="Log" />
        <NavButton active={currentView === 'STATS'} onClick={() => setCurrentView('STATS')} icon={<PieChart className="w-6 h-6" />} label="Metrics" />
        <NavButton active={currentView === 'SETTINGS'} onClick={() => setCurrentView('SETTINGS')} icon={<Settings className="w-6 h-6" />} label="Setup" />
      </div>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-20 py-1 transition-all active:scale-90 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>
        <div className={`p-2.5 rounded-[22px] ${active ? 'bg-indigo-50 dark:bg-indigo-950 ring-8 ring-indigo-50/40 dark:ring-indigo-900/20 translate-y-[-6px]' : ''}`}>
            {icon}
        </div>
        <span className="text-[10px] font-black mt-2 uppercase tracking-widest font-display">{label}</span>
    </button>
);

export default App;