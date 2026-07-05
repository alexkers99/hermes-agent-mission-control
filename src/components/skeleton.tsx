export function Skel({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ background: "var(--panel-elevated)", opacity: 0.5, ...style }}
    />
  );
}

export function SkelCard({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`telemetry-card ${className}`} style={{ animation: "none", ...style }} />;
}
