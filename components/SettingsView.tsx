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
        
        // If deleting the active profile, switch to the first available one.
        // Otherwise, keep the current active profile.
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
    <div className="p-5 space-y-6 pb-24 overflow-y-auto">
      <h2 className="text-2xl font-semibold text-slate-800">Settings</h2>

      {/* Profiles */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Work Profiles</h3>
        <div className="space-y-3">
            {data.profiles.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${data.activeProfileId === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}>
                    <div onClick={() => handleSwitchProfile(p.id)} className="flex-1 cursor-pointer p-1">
                        <div className={`text-base font-normal ${data.activeProfileId === p.id ? 'text-blue-700' : 'text-slate-700'}`}>{p.name}</div>
                        {data.activeProfileId === p.id && <div className="text-xs text-blue-500 mt-0.5">Active</div>}
                    </div>
                    {data.profiles.length > 1 && (
                        <button 
                            onClick={(e) => handleDeleteProfile(p.id, e)} 
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
                placeholder="New Work / Subject Name" 
                className="flex-1 p-3 border rounded-xl text-sm font-normal outline-none focus:ring-2 focus:ring-slate-200"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
            />
            <button onClick={handleAddProfile} className="bg-slate-800 text-white p-3 rounded-xl hover:bg-slate-700 transition-colors">
                <Plus className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Backup & Restore</h3>
        <div className="flex gap-4">
            <button onClick={() => exportData(data)} className="flex-1 flex flex-col items-center justify-center p-5 border rounded-xl hover:bg-slate-50 transition-colors">
                <Save className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-slate-700">Backup Data</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center p-5 border rounded-xl hover:bg-slate-50 transition-colors">
                <Upload className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-slate-700">Restore Data</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
        <p className="text-xs text-slate-400 mt-3 font-normal">Data is stored locally on your device. Create regular backups.</p>
      </div>

      <div className="text-center text-xs text-slate-400 mt-10">
        v1.0.0 • Offline First
      </div>
    </div>
  );
};

export default SettingsView;