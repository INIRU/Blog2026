interface TagProps {
  children: string;
  active?: boolean;
  onClick?: () => void;
}

export function Tag({ children, active, onClick }: TagProps) {
  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        display: "inline-block",
        padding: "4px 12px",
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 6,
        backgroundColor: active
          ? "rgba(59,130,246,0.2)"
          : "rgba(59,130,246,0.1)",
        border: active
          ? "1px solid rgba(59,130,246,0.3)"
          : "1px solid rgba(59,130,246,0.15)",
        color: "#60a5fa",
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.2s, border-color 0.2s",
        userSelect: "none",
        lineHeight: 1.5,
      }}
    >
      {children}
    </span>
  );
}
