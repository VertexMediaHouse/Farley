interface InfoButtonProps {
  helpText: string;
}

export default function InfoButton({ helpText }: InfoButtonProps) {
  return (
    <span className="group relative ml-1.5 inline-block align-middle">
      <span className="flex h-4 w-4 cursor-default select-none items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold leading-none text-slate-600 transition group-hover:bg-[#12294A] group-hover:text-white">
        i
      </span>
      <span className="pointer-events-none absolute left-6 top-0 z-[10001] w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600 opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
        {helpText}
      </span>
    </span>
  );
}