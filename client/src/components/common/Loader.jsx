export default function Loader({ size = 'md', text }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`${sizes[size]} spinner`} />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }} className="animate-pulse">{text}</p>}
    </div>
  );
}

export function ProgressBar({ progress, label, sublabel }) {
  const roundedProgress = Math.round(Math.min(progress, 100));

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{roundedProgress}%</span>
        </div>
      )}
      {sublabel && (
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          marginBottom: 8,
          opacity: 0.8,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {sublabel}
        </p>
      )}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${roundedProgress}%`,
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}
