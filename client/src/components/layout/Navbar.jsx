import { Link, useLocation } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi';

export default function Navbar() {
  const location = useLocation();

  const steps = [
    { path: '/upload', label: 'Upload', num: '1' },
    { path: '/editor', label: 'Edit', num: '2' },
    { path: '/csv', label: 'Generate', num: '3' },
  ];

  const currentIdx = steps.findIndex(s => location.pathname.startsWith(s.path));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/95 backdrop-blur-lg border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/upload" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center
                          group-hover:bg-accent-500 transition-colors">
            <HiOutlineSparkles className="text-white text-sm" />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-white">Cert</span><span className="text-accent-400">Gen</span>
          </span>
        </Link>

        {/* Step Indicator */}
        <div className="flex items-center gap-0.5">
          {steps.map((step, i) => {
            const isActive = i === currentIdx;
            const isPast = currentIdx >= 0 && i < currentIdx;
            return (
              <div key={step.path} className="flex items-center">
                {i > 0 && (
                  <div className={`w-8 h-[2px] ${isPast ? 'bg-accent-500' : 'bg-dark-600'}`} />
                )}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-600/15 text-accent-300'
                    : isPast
                      ? 'text-accent-400'
                      : 'text-dark-400'
                }`}>
                  <span className={`w-5 h-5 rounded-full text-xs font-semibold flex items-center justify-center ${
                    isActive
                      ? 'bg-accent-600 text-white'
                      : isPast
                        ? 'bg-accent-600/30 text-accent-300'
                        : 'bg-dark-600 text-dark-400'
                  }`}>
                    {step.num}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-24" />
      </div>
    </nav>
  );
}
