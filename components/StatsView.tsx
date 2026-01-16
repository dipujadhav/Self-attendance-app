import React, { useState } from 'react';
import { ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { AppData, AttendanceStatus, DayRecord } from '../types';
import { Printer, ClipboardList, CalendarX } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { vibrate } from '../services/storage';

interface StatsViewProps {
  data: AppData;
}

const StatsView: React.FC<StatsViewProps> = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const profile = data.profiles.find(p => p.id === data.activeProfileId) || data.profiles[0];
  const allRecords = data.records[profile.id] || {};

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculation Logic
  const stats = {
    present: 0,
    absent: 0,
    half: 0,
    holiday: 0,
    off: 0,
    unmarked: 0,
    otMinutes: 0
  };

  const tableData: DayRecord[] = [];

  daysInMonth.forEach(day => {
    const key = format(day, 'yyyy-MM-dd');
    const r = allRecords[key];
    
    if (r) {
        tableData.push(r);
        stats.otMinutes += r.overtimeMinutes || 0;
        if (r.status === AttendanceStatus.PRESENT) stats.present++;
        else if (r.status === AttendanceStatus.ABSENT) stats.absent++;
        else if (r.status === AttendanceStatus.HALF_DAY) stats.half++;
        else if (r.status === AttendanceStatus.HOLIDAY) stats.holiday++;
        else if (r.status === AttendanceStatus.WEEKLY_OFF) stats.off++;
    } else {
        stats.unmarked++;
    }
  });

  const workingDays = stats.present + stats.absent + stats.half;
  const score = stats.present + (stats.half * 0.5);
  const percentage = workingDays > 0 ? ((score / workingDays) * 100).toFixed(1) : '0.0';

  const chartData = [
    { name: 'P', value: stats.present, color: '#22c55e' },
    { name: 'A', value: stats.absent, color: '#ef4444' },
    { name: 'HD', value: stats.half, color: '#eab308' },
  ];

  const handlePrint = () => {
    vibrate(10);
    window.print();
  };

  const handleMonthChange = (offset: number) => {
    vibrate(5);
    setCurrentDate(new Date(currentDate.getFullYear(), offset, 1));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      
      {/* Month Selector */}
      <div className="px-5 py-4 bg-white border-b flex justify-between items-center no-print">
         <h2 className="text-2xl font-semibold text-slate-800">Insights</h2>
         <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <select 
                value={currentDate.getMonth()} 
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="bg-transparent text-sm font-medium text-slate-700 outline-none px-2 py-1"
            >
                {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>{format(new Date(2024, i, 1), 'MMMM')}</option>
                ))}
            </select>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-6">
        
        {/* Print Header */}
        <div className="hidden print:block mb-8 border-b pb-4">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Attendance Report</h1>
                    <p className="text-slate-500 mt-1">Generated for <span className="font-bold text-black">{profile.name}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</p>
                    <p className="text-sm text-slate-400">Self Attendance Pro</p>
                </div>
            </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <div className="text-xs font-normal text-slate-500">Monthly Score</div>
                <div className="flex items-baseline mt-1">
                    <span className="text-4xl font-bold text-slate-800">{percentage}</span>
                    <span className="text-xl font-normal text-slate-400 ml-1">%</span>
                </div>
                <div className="text-xs text-slate-500 mt-3 font-normal bg-slate-50 inline-block px-2.5 py-1 rounded-md border border-slate-100">
                    {workingDays} Working Days
                </div>
            </div>
            <div className="h-28 w-28">
                {workingDays > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} innerRadius={35} outerRadius={50} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                                {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full rounded-full border-4 border-slate-100 flex items-center justify-center">
                        <CalendarX className="text-slate-300 w-8 h-8" />
                    </div>
                )}
            </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
            <StatsCard label="Overtime" value={`${Math.floor(stats.otMinutes / 60)}h ${stats.otMinutes % 60}m`} color="blue" />
            <StatsCard label="Leaves" value={stats.absent} color="red" />
            <StatsCard label="Holidays" value={stats.holiday + stats.off} color="purple" />
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-2">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 print:bg-white">
                <h3 className="text-lg font-medium text-slate-800">Daily Logs</h3>
                {tableData.length > 0 && (
                    <button onClick={handlePrint} className="no-print flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 active:scale-95 transition-all">
                        <Printer className="w-4 h-4" /> Export PDF
                    </button>
                )}
            </div>
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 font-normal text-xs uppercase text-left">
                    <tr>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Shift</th>
                        <th className="px-5 py-3 font-medium">OT</th>
                        <th className="px-5 py-3 font-medium">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {tableData.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-5 py-12 text-center">
                                <div className="flex flex-col items-center justify-center opacity-50">
                                    <ClipboardList className="w-12 h-12 text-slate-300 mb-2" />
                                    <p className="text-slate-400 font-normal">No records found</p>
                                    <p className="text-xs text-slate-400 mt-1">Mark attendance in Calendar to see logs</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        tableData.sort((a,b) => a.date.localeCompare(b.date)).map(record => (
                            <tr key={record.date} className="hover:bg-slate-50">
                                <td className="px-5 py-3.5 font-normal text-slate-700">{format(new Date(record.date), 'dd MMM')}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide
                                        ${record.status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-700' : 
                                          record.status === AttendanceStatus.ABSENT ? 'bg-red-100 text-red-700' : 
                                          record.status === AttendanceStatus.HALF_DAY ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}
                                    `}>
                                        {record.status === AttendanceStatus.ABSENT && record.leaveType ? record.leaveType : record.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-slate-600 capitalize font-normal">{record.shift.toLowerCase()}</td>
                                <td className="px-5 py-3.5 font-normal text-slate-600">{record.overtimeMinutes > 0 ? `${record.overtimeMinutes}m` : '-'}</td>
                                <td className="px-5 py-3.5 text-slate-500 max-w-[150px] truncate font-normal">{record.notes || '-'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Signature Section (Print Only) */}
        <div className="hidden print:flex mt-12 justify-between pt-8 border-t border-slate-300">
            <div>
                <p className="font-bold text-slate-800">Employer Signature</p>
                <div className="h-12 border-b border-slate-300 w-48 mt-2"></div>
            </div>
            <div>
                <p className="font-bold text-slate-800">Employee Signature</p>
                <div className="h-12 border-b border-slate-300 w-48 mt-2"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Use explicit mappings instead of dynamic strings for robustness
const StatsCard = ({ label, value, color }: { label: string, value: string | number, color: 'blue' | 'red' | 'purple' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-100 text-blue-700',
        red: 'bg-red-50 border-red-100 text-red-700',
        purple: 'bg-purple-50 border-purple-100 text-purple-700'
    };
    
    // Add text opacity classes manually for the label if needed, or use a consistent gray
    const textClass = colorClasses[color] || 'bg-slate-50 border-slate-100 text-slate-700';

    return (
        <div className={`${textClass} p-4 rounded-xl border flex flex-col items-center justify-center text-center`}>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-xs font-normal opacity-70 mt-1">{label}</div>
        </div>
    );
};

export default StatsView;