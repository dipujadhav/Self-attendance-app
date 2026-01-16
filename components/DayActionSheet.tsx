import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Check, Clock, Briefcase, Coffee, AlertCircle, Loader2, Sun, ChevronRight } from 'lucide-react';
import { DayRecord, AttendanceStatus, ShiftType, LeaveType } from '../types';
import { vibrate } from '../services/storage';

interface DayActionSheetProps {
    date: Date;
    initialRecord?: DayRecord;
    onClose: () => void;
    onSave: (r: DayRecord) => void;
}

const DayActionSheet: React.FC<DayActionSheetProps> = ({ date, initialRecord, onClose, onSave }) => {
    const [status, setStatus] = useState<AttendanceStatus>(initialRecord?.status || AttendanceStatus.UNMARKED);
    const [shift, setShift] = useState<ShiftType>(initialRecord?.shift || ShiftType.GENERAL);
    const [ot, setOt] = useState<string>(initialRecord?.overtimeMinutes ? String(initialRecord.overtimeMinutes) : '');
    const [notes, setNotes] = useState(initialRecord?.notes || '');
    const [leaveType, setLeaveType] = useState<LeaveType | undefined>(initialRecord?.leaveType);
    const [saveState, setSaveState] = useState<'IDLE' | 'SAVING'>('IDLE');

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSave = async () => {
        setSaveState('SAVING');
        const record: DayRecord = {
            date: format(date, 'yyyy-MM-dd'),
            status: status === AttendanceStatus.UNMARKED ? AttendanceStatus.PRESENT : status, 
            shift,
            overtimeMinutes: parseInt(ot) || 0,
            leaveType: status === AttendanceStatus.ABSENT ? leaveType : undefined,
            notes,
            tags: initialRecord?.tags || []
        };
        await new Promise(resolve => setTimeout(resolve, 600)); 
        onSave(record);
        vibrate([30, 60]);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center no-print px-0 sm:px-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            
            <div className="bg-white w-full max-w-lg rounded-t-[48px] sm:rounded-[48px] sm:mb-8 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.4)] animate-sheet-up flex flex-col max-h-[94vh] relative overflow-hidden border border-slate-100">
                
                <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-5 mb-1" />

                <div className="px-8 pb-4 pt-4 flex justify-between items-center">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 font-display">{format(date, 'yyyy')}</div>
                        <h3 className="text-3xl font-extrabold text-slate-950 font-display tracking-tight leading-none">{format(date, 'EEEE, MMM d')}</h3>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); vibrate(5); onClose(); }} 
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 active:scale-90 transition-all border border-slate-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-12 pb-40">
                    
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] font-display">Daily Status</label>
                            {status !== AttendanceStatus.UNMARKED && (
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100 font-display">Active</span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <StatusButton 
                                active={status === AttendanceStatus.PRESENT} 
                                icon={<Check className="w-5 h-5" />} 
                                label="Present" 
                                color="emerald"
                                onClick={() => { vibrate(5); setStatus(AttendanceStatus.PRESENT); }}
                            />
                            <StatusButton 
                                active={status === AttendanceStatus.ABSENT} 
                                icon={<AlertCircle className="w-5 h-5" />} 
                                label="Absent" 
                                color="rose"
                                onClick={() => { vibrate(5); setStatus(AttendanceStatus.ABSENT); }}
                            />
                            <StatusButton 
                                active={status === AttendanceStatus.HALF_DAY} 
                                icon={<Coffee className="w-5 h-5" />} 
                                label="Half Day" 
                                color="amber"
                                onClick={() => { vibrate(5); setStatus(AttendanceStatus.HALF_DAY); }}
                            />
                            <StatusButton 
                                active={status === AttendanceStatus.HOLIDAY} 
                                icon={<Sun className="w-5 h-5" />} 
                                label="Holiday" 
                                color="violet"
                                onClick={() => { vibrate(5); setStatus(AttendanceStatus.HOLIDAY); }}
                            />
                            <StatusButton 
                                active={status === AttendanceStatus.WEEKLY_OFF} 
                                icon={<Briefcase className="w-5 h-5" />} 
                                label="Off Day" 
                                color="slate"
                                onClick={() => { vibrate(5); setStatus(AttendanceStatus.WEEKLY_OFF); }}
                            />
                        </div>
                    </section>

                    {status === AttendanceStatus.ABSENT && (
                        <div className="animate-soft-in p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 block font-display">Reason for Leave</label>
                            <div className="flex flex-wrap gap-2.5">
                                {Object.values(LeaveType).map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => { vibrate(5); setLeaveType(t); }}
                                        className={`px-6 py-3.5 text-xs font-bold rounded-2xl border transition-all font-display tracking-wide ${leaveType === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 font-display">Shift</label>
                            <div className="relative">
                                <select 
                                    value={shift} 
                                    onChange={e => setShift(e.target.value as ShiftType)}
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[28px] text-sm font-bold text-slate-800 outline-none appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all font-display"
                                >
                                    {Object.values(ShiftType).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 font-display">Overtime</label>
                            <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input 
                                    type="number" 
                                    value={ot}
                                    onChange={e => setOt(e.target.value)}
                                    placeholder="0m"
                                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[28px] text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all font-display"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 font-display">Comments</label>
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Briefly describe your day..."
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[36px] text-sm font-medium text-slate-700 min-h-[160px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 resize-none transition-all leading-relaxed"
                        />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 glass border-t border-slate-100">
                    <button 
                        onClick={handleSave}
                        disabled={saveState === 'SAVING'}
                        className={`w-full py-5 rounded-[28px] font-black text-base shadow-2xl glow-indigo transition-all flex items-center justify-center gap-3 active:scale-[0.97] disabled:grayscale font-display tracking-widest uppercase ${
                            saveState === 'SAVING' ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        {saveState === 'SAVING' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Syncing...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                <span>Complete Log</span>
                            </>
                        )}
                    </button>
                    <div className="h-safe" />
                </div>
            </div>
        </div>
    );
};

interface StatusButtonProps {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: () => void;
}

const StatusButton: React.FC<StatusButtonProps> = ({ active, icon, label, color, onClick }) => {
    const colorMap: Record<string, string> = {
        emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-100/50 shadow-emerald-100/30',
        rose: 'text-rose-700 bg-rose-50 border-rose-200 ring-rose-100/50 shadow-rose-100/30',
        amber: 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-100/50 shadow-amber-100/30',
        violet: 'text-violet-700 bg-violet-50 border-violet-200 ring-violet-100/50 shadow-violet-100/30',
        slate: 'text-slate-700 bg-slate-100/50 border-slate-200 ring-slate-100 shadow-slate-100/30',
    };

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-[32px] border transition-all active:scale-[0.92] ${
                active 
                ? `${colorMap[color]} border-2 ring-[10px] shadow-2xl` 
                : 'border-slate-50 bg-slate-50/40 text-slate-400 hover:bg-white hover:border-slate-300'
            }`}
        >
            <div className={`mb-3 p-1.5 rounded-2xl ${active ? 'bg-white/50' : ''}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tight font-display ${active ? '' : 'opacity-50'}`}>
                {label}
            </span>
        </button>
    );
};

export default DayActionSheet;