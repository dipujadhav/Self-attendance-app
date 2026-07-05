import React, { useMemo, useRef, useState } from 'react';
import { BadgeCheck, Download, ImagePlus, RotateCcw, Scissors, ShieldCheck, Sparkles } from 'lucide-react';

const PASSPORT_WIDTH_MM = 26;
const PASSPORT_HEIGHT_MM = 31;
const DPI = 300;
const MM_PER_INCH = 25.4;
const OUTPUT_WIDTH_PX = Math.round((PASSPORT_WIDTH_MM / MM_PER_INCH) * DPI);
const OUTPUT_HEIGHT_PX = Math.round((PASSPORT_HEIGHT_MM / MM_PER_INCH) * DPI);

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const previewStyle = useMemo(() => ({
    aspectRatio: `${PASSPORT_WIDTH_MM} / ${PASSPORT_HEIGHT_MM}`,
  }), []);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const downloadPreview = () => {
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_WIDTH_PX;
    canvas.height = OUTPUT_HEIGHT_PX;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#111827';
    context.lineWidth = 3;
    context.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);

    if (!sourceImage) {
      saveCanvas(canvas);
      return;
    }

    const image = new Image();
    image.onload = () => {
      const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;
      context.drawImage(image, x, y, width, height);
      context.strokeStyle = '#111827';
      context.lineWidth = 3;
      context.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);
      saveCanvas(canvas);
    };
    image.src = sourceImage;
  };

  const saveCanvas = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = 'passport-photo-26x31mm.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-8 md:px-8 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            <ShieldCheck className="h-4 w-4" /> Dedicated passport photo workspace
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              Passport Photo Generator
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Create a clean 26 x 31 mm passport photo preview with a pure white canvas, centered image placement, and thin black border. This repository is now branded only for passport photo generation.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Feature icon={<Scissors />} title="26 x 31 mm" description="Passport-size output target at 300 DPI." />
            <Feature icon={<Sparkles />} title="White background" description="Clean document-style canvas." />
            <Feature icon={<BadgeCheck />} title="Border guide" description="Thin black outline for print trimming." />
          </div>
        </div>

        <div className="w-full flex-1 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Photo Preview</h2>
              <p className="text-sm text-slate-500">{OUTPUT_WIDTH_PX} x {OUTPUT_HEIGHT_PX}px at 300 DPI</p>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition active:scale-95"
            >
              <ImagePlus className="h-4 w-4" /> Upload
            </button>
          </div>

          <div className="mx-auto max-w-sm rounded-3xl bg-slate-100 p-5">
            <div style={previewStyle} className="relative mx-auto w-full overflow-hidden border border-black bg-white shadow-inner">
              {sourceImage ? (
                <img src={sourceImage} alt="Uploaded passport preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
                  <ImagePlus className="h-12 w-12" />
                  <p className="text-sm font-semibold">Upload a portrait to start passport photo preparation.</p>
                </div>
              )}
            </div>
          </div>

          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => { setSourceImage(null); setFileName(''); if (inputRef.current) inputRef.current.value = ''; }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              type="button"
              onClick={downloadPreview}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition active:scale-95"
            >
              <Download className="h-4 w-4" /> Download PNG
            </button>
          </div>

          {fileName && <p className="mt-4 truncate text-center text-xs font-semibold text-slate-400">Loaded: {fileName}</p>}
        </div>
      </section>
    </main>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
      {icon}
    </div>
    <h3 className="font-black text-slate-900">{title}</h3>
    <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
  </div>
);

export default App;
