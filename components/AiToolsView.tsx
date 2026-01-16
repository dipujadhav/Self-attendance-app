import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Video, Loader2, PlayCircle, Download, Wand2 } from 'lucide-react';
import { ensureApiKey, generateVeoVideo, generateProImage, blobToBase64 } from '../services/ai';

const AiToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'VEO' | 'IMAGE'>('VEO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Veo State
  const [veoImage, setVeoImage] = useState<string | null>(null);
  const [veoPrompt, setVeoPrompt] = useState('');
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [veoResult, setVeoResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Gen State
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgSize, setImgSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imgResult, setImgResult] = useState<string | null>(null);

  const handleVeoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await blobToBase64(file);
      setVeoImage(base64);
    }
  };

  const executeVeo = async () => {
    try {
      setLoading(true);
      setError(null);
      const ready = await ensureApiKey();
      if (!ready) {
        setError("API Key Selection is required.");
        setLoading(false);
        return;
      }
      if (!veoImage) {
        setError("Please upload an image first.");
        setLoading(false);
        return;
      }
      const videoUrl = await generateVeoVideo(veoImage, veoPrompt, veoAspectRatio);
      setVeoResult(videoUrl);
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found.")) {
        await window.aistudio?.openSelectKey();
      }
      setError(e.message || "Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  const executeImageGen = async () => {
    try {
      setLoading(true);
      setError(null);
      const ready = await ensureApiKey();
      if (!ready) {
        setError("API Key Selection is required.");
        setLoading(false);
        return;
      }
      if (!imgPrompt) {
        setError("Please enter a prompt.");
        setLoading(false);
        return;
      }
      const imageUrl = await generateProImage(imgPrompt, imgSize);
      setImgResult(imageUrl);
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found.")) {
        await window.aistudio?.openSelectKey();
      }
      setError(e.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border-b dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('VEO')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 ${activeTab === 'VEO' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
          <Video className="w-4 h-4" /> Veo Animator
        </button>
        <button 
          onClick={() => setActiveTab('IMAGE')}
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors duration-200 ${activeTab === 'IMAGE' ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
          <Wand2 className="w-4 h-4" /> Pro Image Gen
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-lg text-sm animate-fade-in">
                {error}
            </div>
        )}

        {activeTab === 'VEO' ? (
            <div key="veo" className="space-y-6 animate-fade-in">
                <div className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-opacity duration-300 ${loading ? 'opacity-80' : 'opacity-100'}`}>
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">1. Upload Source Image</h3>
                    <div 
                        onClick={() => !loading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${loading ? 'pointer-events-none' : ''}`}
                    >
                        {veoImage ? (
                            <img src={veoImage} alt="Source" className="max-h-48 rounded shadow-sm object-contain animate-fade-in" />
                        ) : (
                            <>
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-2 text-blue-600 dark:text-blue-400">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <span className="text-sm text-slate-500 dark:text-slate-400">Tap to upload photo</span>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleVeoUpload} accept="image/*" className="hidden" />
                    </div>
                </div>

                <div className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-opacity duration-300 ${loading ? 'opacity-80' : 'opacity-100'}`}>
                    <h3 className="font-semibold text-slate-800 dark:text-white">2. Settings</h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Aspect Ratio</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setVeoAspectRatio('16:9')}
                                disabled={loading}
                                className={`flex-1 py-2 px-3 rounded border text-sm transition-all duration-200 ${veoAspectRatio === '16:9' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700'}`}
                            >
                                Landscape (16:9)
                            </button>
                            <button 
                                onClick={() => setVeoAspectRatio('9:16')}
                                disabled={loading}
                                className={`flex-1 py-2 px-3 rounded border text-sm transition-all duration-200 ${veoAspectRatio === '9:16' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700'}`}
                            >
                                Portrait (9:16)
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Prompt (Optional)</label>
                        <input 
                            type="text" 
                            value={veoPrompt} 
                            onChange={e => setVeoPrompt(e.target.value)}
                            disabled={loading}
                            className="w-full p-3 border dark:border-slate-700 rounded-lg text-sm transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            placeholder="e.g., Make the water flow, cinematic lighting..."
                        />
                    </div>
                    <button 
                        onClick={executeVeo}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                        {loading ? 'Generating...' : 'Generate Video'}
                    </button>
                </div>

                {veoResult && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Result</h3>
                        <video src={veoResult} controls className="w-full rounded-lg bg-black" autoPlay loop />
                        <a href={veoResult} download="veo-video.mp4" className="block mt-2 text-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">Download Video</a>
                    </div>
                )}
            </div>
        ) : (
            <div key="image" className="space-y-6 animate-fade-in">
                <div className={`bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-opacity duration-300 ${loading ? 'opacity-80' : 'opacity-100'}`}>
                    <h3 className="font-semibold text-slate-800 dark:text-white">Create Image</h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Prompt</label>
                        <textarea 
                            value={imgPrompt}
                            onChange={e => setImgPrompt(e.target.value)}
                            disabled={loading}
                            className="w-full p-3 border dark:border-slate-700 rounded-lg text-sm h-32 resize-none transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            placeholder="Describe the image you want to generate..."
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1">Resolution</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['1K', '2K', '4K'].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setImgSize(size as any)}
                                    disabled={loading}
                                    className={`py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${imgSize === size ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 text-slate-600'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={executeImageGen}
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                        {loading ? 'Generating...' : 'Generate Image'}
                    </button>
                </div>

                {imgResult && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Result</h3>
                        <img src={imgResult} alt="Generated" className="w-full rounded-lg shadow-sm" />
                        <a href={imgResult} download="generated-image.png" className="block mt-2 text-center text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">Download Image</a>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AiToolsView;