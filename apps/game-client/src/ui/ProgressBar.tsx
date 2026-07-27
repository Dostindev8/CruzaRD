interface Props {
  value: number;
  max: number;
  height?: number;
}

export function ProgressBar({ value, max, height = 10 }: Props) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div
      style={{
        height,
        borderRadius: 999,
        background: '#061225',
        border: '1px solid rgba(245,197,66,.45)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #3a8bff, #5ad0ff)',
          transition: 'width 200ms ease',
        }}
      />
    </div>
  );
}
