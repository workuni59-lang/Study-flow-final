const LadderIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
    className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="2" x2="3" y2="14" />
    <line x1="13" y1="2" x2="13" y2="14" />
    <line x1="3" y1="4" x2="8" y2="4" />
    <line x1="3" y1="7" x2="10" y2="7" />
    <line x1="3" y1="10" x2="12" y2="10" />
    <line x1="3" y1="13" x2="7" y2="13" />
  </svg>
);

export default LadderIcon;
