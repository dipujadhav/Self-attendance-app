import React, { useRef } from 'react';
import { AppData, WorkProfile } from '../types';
import { exportData, importData } from '../services/storage';
import { Save, Upload, Plus, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  data: AppData;
  onUpdateData: (newData: AppData) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ data, onUpdateData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProfileName, setNewProfileName] = React.useState('');

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const newData = await importData(e.target.files[0]);
        onUpdateData(newData);
        alert('Data restored successfully!');
      } catch (err) {
        alert('Failed to restore data. Invalid file.');
      }
    }
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    const newProfile: WorkProfile = {
      id: Date.now().toString(),
      name: newProfileName,
      color: 'blue'
    };
    const newData = {
      ...data,
      profiles: [...data.profiles, newProfile],
      records: { ...data.records, [newProfile.id]: {} },
      activeProfileId: newProfile.id
    };
    onUpdateData(newData);
    setNewProfileName('');
  };

  const handleSwitchProfile = (id: string) => {
    onUpdateData({ ...data, activeProfileId: id });
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.profiles.length <= 1) {
      alert("Cannot delete the only profile.");
      return;
    }
    if (window.confirm("Are you sure? This will delete all attendance data for this profile.")) {
        const newProfiles = data.profiles.filter(p => p.id !== id);
        const newRecords = { ...data.records };
        delete newRecords[id];
        
        let newActiveId = data.activeProfileId;
        if (id === data.activeProfileId) {
            newActiveId = newProfiles[0].id;
        }

        onUpdateData({
            ...data,
            profiles: newProfiles,
            records: newRecords,
            activeProfileId: newActiveId
        });
    }
  };

  return (
    <div className="p-5 space-y-6 pb-24 overflow-y-auto bg-slate-50 dark:bg-slate-950 h-full">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-white">Settings</h2>

      {/* Profiles */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Work Profiles</h3>
        <div className="space-y-3">
            {data.profiles.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${data.activeProfileId === p.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div onClick={() => handleSwitchProfile(p.id)} className="flex-1 cursor-pointer p-1">
                        <div className={`text-base font-normal ${data.activeProfileId === p.id ? 'text-indigo-700 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>{p.name}</div>
                        {data.activeProfileId === p.id && <div className="text-[10px] font-black uppercase text-indigo-500 mt-0.5 tracking-widest">Active</div>}
                    </div>
                    {data.profiles.length > 1 && (
                        <button 
                            onClick={(e) => handleDeleteProfile(p.id, e)} 
                            className="p-3 text-slate-400 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Delete Profile"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
        <div className="mt-5 flex gap-2">
            <input 
                type="text" 
                placeholder="New Work Name" 
                className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-sm font-normal outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 text-slate-800 dark:text-white"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
            />
            <button onClick={handleAddProfile} className="bg-slate-800 dark:bg-indigo-600 text-white p-3 rounded-xl hover:bg-slate-700 dark:hover:bg-indigo-700 transition-colors">
                <Plus className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">Backup & Restore</h3>
        <div className="flex gap-4">
            <button onClick={() => exportData(data)} className="flex-1 flex flex-col items-center justify-center p-5 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Save className="w-6 h-6 text-emerald-600 mb-2" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Backup</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center p-5 border dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Upload className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Restore</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-3 font-normal">Data is stored locally on your device. Create regular backups.</p>
      </div>

      <div className="text-center text-xs text-slate-400 dark:text-slate-700 mt-10">
        v1.1.0 • Offline First • Premium Design
      </div>
    </div>
  );
};

export default SettingsView;