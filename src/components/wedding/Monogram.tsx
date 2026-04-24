export const Monogram = () => (
  <div className="flex items-center justify-center gap-1 text-gold">
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-1" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
    <svg viewBox="0 0 24 24" className="h-6 w-6 -ml-3 mt-4 fill-none stroke-current stroke-1" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </div>
);

export const Divider = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center gap-6 text-gold/80">
    <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
    <span className="font-display text-[10px] tracking-[0.6em] uppercase">{label}</span>
    <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
  </div>
);
