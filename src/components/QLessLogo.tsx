const QLessLogo = ({ collapsed = false }: { collapsed?: boolean }) => {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Abstract Q with open gate / checkmark feel */}
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="60 16"
        />
        <path
          d="M22 22L30 30"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 16L18 20L26 12"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </svg>
      {!collapsed && (
        <span className="text-xl font-bold tracking-tight text-foreground">
          Q<span className="text-primary">Less</span>
        </span>
      )}
    </div>
  );
};

export default QLessLogo;
