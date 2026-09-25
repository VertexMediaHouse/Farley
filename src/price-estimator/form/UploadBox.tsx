import { useRef, useState, type DragEvent, type ChangeEvent } from "react";

interface UploadBoxProps {
  label?: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

export default function UploadBox({ label = "Upload photo", value, onChange }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) onChange(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const preview = value ? URL.createObjectURL(value) : null;

  return (
    <div className="mt-1">
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="preview" className="h-24 w-auto rounded-lg border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs leading-none text-white"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors ${
            dragging ? "border-[#12294A] bg-slate-50" : "border-slate-300 bg-slate-50/50 hover:border-[#12294A]"
          }`}
        >
          <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-3 3m3-3l3 3" />
          </svg>
          <span className="text-xs font-medium text-slate-600">{label}</span>
          <span className="text-xs text-slate-400">Click or drag &amp; drop</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
    </div>
  );
}