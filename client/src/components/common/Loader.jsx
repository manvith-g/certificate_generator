export default function Loader({ size = 'md', text }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`${sizes[size]} spinner`} />
      {text && <p className="text-dark-300 text-sm animate-pulse">{text}</p>}
    </div>
  );
}

export function ProgressBar({ progress, label }) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-dark-300">{label}</span>
          <span className="text-accent-400 font-medium">{progress}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    </div>
  );
}
