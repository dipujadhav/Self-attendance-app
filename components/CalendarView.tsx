import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Sun, ArrowUpRight } from 'lucide-react';
import { AppData, AttendanceStatus, ShiftType } from '../types';
import { vibrate } from '../services/storage';

interface CalendarViewProps {
  data: AppData;
  onDateSelect: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ data, onDateSelect }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const activeProfileId = data.activeProfileId;
  const records = data.records[activeProfileId] || {};

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  
  const monthlyStats = useMemo(() => {
    let present = 0, absent = 0, half = 0;
    daysInMonth.forEach(d => {
        const r = records[format(d, 'yyyy-MM-dd')];
        if (r?.status === AttendanceStatus.PRESENT) present++;
        if (r?.status === AttendanceStatus.ABSENT) absent++;
        if (r?.status === AttendanceStatus.HALF_DAY) half++;
    });
    return { present, absent, half };
  }, [currentDate, records]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    vibrate(8);
    if (direction === 'prev') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="flex flex-col h-full bg-[#fdfdff] animate-fade-in relative">
      <div className="bg-white px-8 pt-10 pb-6 border-b border-slate-100 shadow-[0_15px_50px_-25px_rgba(0,0,0,0.05)] z-10">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => handleMonthChange('prev')} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 active:scale-90 transition-all border border-slate-100">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center cursor-pointer active:opacity-60 transition-opacity" onClick={() => setCurrentDate(new Date())}>
                <h2 className="text-3xl font-black text-slate-950 font-display tracking-tight leading-none">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2 font-display">Work Records</div>
            </div>
            <button onClick={() => handleMonthChange('next')} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 active:scale-90 transition-all border border-slate-100">
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
        
        <div className="flex gap-3">
            <StatPill label="Present" count={monthlyStats.present} color="emerald" />
            <StatPill label="Absent" count={monthlyStats.absent} color="rose" />
            <StatPill label="Half" count={monthlyStats.half} color="amber" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-24">
        <div className="grid grid-cols-7 mb-6 px-1">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
            <div key={i} className={`text-center text-[10px] font-black tracking-[0.15em] font-display ${i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-300'}`}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3.5">
          {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square opacity-0" />)}
          {daysInMonth.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            return (
              <DayCell 
                key={dateKey} 
                day={day} 
                record={records[dateKey]} 
                isToday={isToday(day)} 
                onClick={() => {
                  vibrate(10);
                  onDateSelect(day);
                }} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatPill = ({ label, count, color }: { label: string, count: number, color: 'emerald' | 'rose' | 'amber' }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50/50',
        rose: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50/50',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50/50'
    };
    return (
        <div className={`flex-1 flex flex-col items-center justify-center py-4 rounded-[28px] border transition-all shadow-sm ${colors[color]}`}>
            <span className="text-2xl font-black font-display leading-none">{count}</span>
            <span className="text-[9px] font-black uppercase tracking-widest mt-1.5 opacity-60 font-display">{label}</span>
        </div>
    );
};

const DayCell: React.FC<{ day: Date; record?: any; isToday: boolean; onClick: () => void }> = ({ day, record, isToday, onClick }) => {
    let bgClass = 'bg-white';
    let borderClass = 'border-slate-100';
    let textClass = 'text-slate-900';

    if (record) {
        switch (record.status) {
            case AttendanceStatus.PRESENT: bgClass = 'bg-emerald-50'; borderClass = 'border-emerald-100'; textClass = 'text-emerald-800 font-bold'; break;
            case AttendanceStatus.ABSENT: bgClass = 'bg-rose-50'; borderClass = 'border-rose-100'; textClass = 'text-rose-800 font-bold'; break;
            case AttendanceStatus.HALF_DAY: bgClass = 'bg-amber-50'; borderClass = 'border-amber-100'; textClass = 'text-amber-800 font-bold'; break;
            case AttendanceStatus.HOLIDAY: bgClass = 'bg-violet-50'; borderClass = 'border-violet-100'; textClass = 'text-violet-800 font-bold'; break;
            case AttendanceStatus.WEEKLY_OFF: bgClass = 'bg-slate-50'; borderClass = 'border-slate-200'; textClass = 'text-slate-400'; break;
        }
    }

    return (
        <div 
            onClick={onClick}
            className={`aspect-square relative rounded-[20px] border flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.85] shadow-[0_4px_12px_-6px_rgba(0,0,0,0.06)] ${bgClass} ${borderClass} ${isToday ? 'ring-[6px] ring-indigo-500/10 border-indigo-400 scale-[1.12] z-10 bg-white shadow-indigo-100/50' : ''}`}
        >
            <span className={`text-base font-bold font-display ${isToday ? 'text-indigo-600 font-black' : textClass}`}>{format(day, 'd')}</span>
            
            <div className="absolute top-1.5 right-1.5">
                {record?.overtimeMinutes > 0 && <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500 font-black" />}
            </div>

            <div className="mt-1 flex gap-0.5">
                {record?.shift === ShiftType.NIGHT && <Moon className={`w-3.5 h-3.5 ${textClass} opacity-30`} />}
                {record?.shift === ShiftType.MORNING && <Sun className={`w-3.5 h-3.5 ${textClass} opacity-30`} />}
            </div>
            
            {record?.overtimeMinutes > 0 && (
                <div className="absolute bottom-2 flex items-center justify-center w-full px-2">
                    <div className="h-1 w-6 bg-indigo-500/30 rounded-full" />
                </div>
            )}
        </div>
    );
};

export default CalendarView;