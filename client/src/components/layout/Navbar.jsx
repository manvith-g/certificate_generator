import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineSparkles, HiSun, HiMoon, HiArrowRight } from 'react-icons/hi';
import useThemeStore from '../../store/useThemeStore';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    { path: '/upload', label: 'Upload', num: '1' },
    { path: '/editor', label: 'Edit', num: '2' },
    { path: '/csv', label: 'Generate', num: '3' },
  ];

  const currentIdx = steps.findIndex(s => location.pathname.startsWith(s.path));
  const isToolPage = currentIdx >= 0;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.03m',
          }}>
            <span style={{ color: 'var(--text-primary)' }}>Vel</span>
            <span style={{ color: 'var(--accent-primary)' }}>ora</span>
          </span>
        </Link>

        {/* Center: Step Indicator (tool pages) or Nav Links (landing) */}
        {isToolPage ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {steps.map((step, i) => {
              const isActive = i === currentIdx;
              const isPast = currentIdx >= 0 && i < currentIdx;
              return (
                <div key={step.path} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && (
                    <div style={{
                      width: 32, height: 2,
                      background: isPast ? 'var(--accent-primary)' : 'var(--border-primary)',
                      transition: 'background-color 0.3s ease',
                    }} />
                  )}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    fontSize: 13, fontWeight: 500,
                    transition: 'all 0.25s ease',
                    background: isActive ? 'var(--accent-muted)' : 'transparent',
                    color: isActive
                      ? 'var(--accent-text)'
                      : isPast
                        ? 'var(--accent-primary)'
                        : 'var(--text-muted)',
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      fontSize: 11, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive
                        ? 'var(--accent-primary)'
                        : isPast
                          ? 'var(--accent-muted)'
                          : 'var(--bg-elevated)',
                      color: isActive
                        ? '#fff'
                        : isPast
                          ? 'var(--accent-text)'
                          : 'var(--text-muted)',
                      transition: 'all 0.25s ease',
                    }}>
                      {step.num}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : isLanding ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a
              href="#features"
              style={{
                fontSize: 14, fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              style={{
                fontSize: 14, fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              How It Works
            </a>
          </div>
        ) : null}

        {/* Right: Theme Toggle + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <HiSun style={{ fontSize: 18 }} />
            ) : (
              <HiMoon style={{ fontSize: 18 }} />
            )}
          </button>

          {isLanding && (
            <Link
              to="/upload"
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: 13, borderRadius: 10, gap: 6 }}
            >
              Get Started <HiArrowRight style={{ fontSize: 14 }} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
