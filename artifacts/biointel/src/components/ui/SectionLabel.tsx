export function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex flex-row items-center gap-[12px] mb-8">
      <div className="w-[40px] h-[0.5px] bg-[var(--teal)] shrink-0" />
      <span className="font-mono text-[11px] text-[var(--teal)] tracking-[0.12em] uppercase">
        {text}
      </span>
    </div>
  );
}
