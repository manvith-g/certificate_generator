import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlinePhotograph,
  HiOutlinePencilAlt,
  HiOutlineDownload,
  HiOutlineLightningBolt,
  HiArrowRight,
  HiOutlineSparkles,
  HiOutlineTemplate,
  HiOutlineUserGroup,
} from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

const FEATURES = [
  {
    icon: <HiOutlinePhotograph />,
    title: 'Template Upload',
    description: 'Upload any certificate design as a PNG or JPG template. Your canvas, your rules.',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
    color: '#818cf8',
  },
  {
    icon: <HiOutlinePencilAlt />,
    title: 'Visual Editor',
    description: 'Drag-and-drop text fields onto your template. Customize fonts, sizes, colors, and alignment.',
    gradient: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))',
    color: '#22d3ee',
  },
  {
    icon: <HiOutlineUserGroup />,
    title: 'Bulk Generation',
    description: 'Import a CSV with participant data and generate hundreds of certificates in seconds.',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
    color: '#a855f7',
  },
  {
    icon: <HiOutlineDownload />,
    title: 'Instant Download',
    description: 'Get all your certificates bundled in a ZIP file, ready to distribute immediately.',
    gradient: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))',
    color: '#34d399',
  },
];

const STEPS = [
  {
    num: '1',
    title: 'Upload Template',
    description: 'Choose your certificate background image — any PNG or JPG design works.',
    icon: <HiOutlineTemplate className="text-xl" />,
  },
  {
    num: '2',
    title: 'Place Fields',
    description: 'Add dynamic text fields for names, dates, and more. Style them exactly how you want.',
    icon: <HiOutlinePencilAlt className="text-xl" />,
  },
  {
    num: '3',
    title: 'Generate & Download',
    description: 'Upload your CSV data and generate all certificates at once. Download as a ZIP.',
    icon: <HiOutlineLightningBolt className="text-xl" />,
  },
];

export default function LandingPage() {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* ═══════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════ */}
      <section className="hero-gradient" style={{ position: 'relative',marginTop:'20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        {/* Background dots */}
        <div className="hero-dots" />

        {/* Floating accent orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} className="animate-float" />
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.06), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', animationDelay: '2s' }} className="animate-float" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          {/* Badge */}
          {/* <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 99, border: '1px solid var(--accent-border)', background: 'var(--accent-muted)', marginBottom: 28 }}
          >
            <HiOutlineSparkles style={{ color: 'var(--accent-primary)', fontSize: 16 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-text)', letterSpacing: 0.3 }}>
              Free & Open Source Certificate Generator — Velora
            </span>
          </motion.div> */}

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 20,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Generate Dynamic{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #22d3ee, #a855f7)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 4s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Certificates
            </span>
            <br />
            in Minutes
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-secondary)',
              maxWidth: 560,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            Upload your template, place dynamic fields, import your data, and bulk-generate
            stunning certificates — all from your browser.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}
          >
            <Link
              to="/upload"
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 14 }}
            >
              Get Started <HiArrowRight />
            </Link>
            <a
              href="#features"
              className="btn-secondary"
              style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 14 }}
            >
              See Features
            </a>
          </motion.div>

          {/* Hero visual — floating certificate mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            custom={4}
            style={{
              marginTop: 64,
              position: 'relative',
              display: 'inline-block',
            }}
          >
            <div
              className="animate-float"
              style={{
                width: 'min(700px, 85vw)',
                height: 'auto',
                aspectRatio: '16/10',
                borderRadius: 16,
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-card)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 60px rgba(99,102,241,0.08)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Mock editor preview */}
              <div style={{ display: 'flex', height: '100%' }}>
                {/* Mini sidebar */}
                <div style={{ width: '28%', borderRight: '1px solid var(--border-primary)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ width: '70%', height: 10, borderRadius: 4, background: 'var(--bg-elevated)' }} />
                  <div style={{ width: '100%', height: 28, borderRadius: 8, background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', marginTop: 8 }} />
                  <div style={{ width: '100%', height: 28, borderRadius: 8, background: 'var(--bg-elevated)', marginTop: 4 }} />
                  <div style={{ width: '100%', height: 28, borderRadius: 8, background: 'var(--bg-elevated)', marginTop: 4 }} />
                  <div style={{ width: '60%', height: 8, borderRadius: 4, background: 'var(--bg-elevated)', marginTop: 16 }} />
                  <div style={{ width: '100%', height: 24, borderRadius: 8, background: 'var(--bg-elevated)', marginTop: 8 }} />
                  <div style={{ width: '100%', height: 24, borderRadius: 8, background: 'var(--bg-elevated)', marginTop: 4 }} />
                </div>
                {/* Main canvas */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-primary)' }}>
                  <div style={{
                    width: '85%',
                    aspectRatio: '1.4/1',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, var(--accent-muted), rgba(34,211,238,0.06))',
                    border: '1px dashed var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 8,
                  }}>
                    <div style={{ width: '50%', height: 8, borderRadius: 4, background: 'var(--accent-border)' }} />
                    <div style={{ width: '35%', height: 6, borderRadius: 4, background: 'var(--border-primary)' }} />
                    <div style={{ width: '25%', height: 6, borderRadius: 4, background: 'var(--border-primary)', marginTop: 4 }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════ */}
      <section id="features" style={{ padding: 'clamp(60px, 10vw, 120px) 24px', background: 'var(--bg-secondary)', transition: 'background-color 0.35s ease' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <span style={{
              display: 'inline-block',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: 'var(--accent-primary)',
              marginBottom: 12,
            }}>
              Features
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}>
              Everything You Need
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
              A complete toolkit for creating professional certificates at scale.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div
                  className="feature-icon"
                  style={{ background: feature.gradient, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: 'clamp(60px, 10vw, 120px) 24px', background: 'var(--bg-primary)', transition: 'background-color 0.35s ease' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <span style={{
              display: 'inline-block',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: 'var(--accent-primary)',
              marginBottom: 12,
            }}>
              How It Works
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}>
              Three Simple Steps
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>
              From template to finished certificates in under 5 minutes.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            position: 'relative',
          }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute',
              top: 48,
              left: 'calc(16.67% + 22px)',
              right: 'calc(16.67% + 22px)',
              height: 2,
              background: `repeating-linear-gradient(90deg, var(--border-primary) 0px, var(--border-primary) 6px, transparent 6px, transparent 12px)`,
              display: 'var(--show-connecting-line, block)',
              zIndex: 0,
            }} />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="step-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{ position: 'relative', zIndex: 1 }}
              >
                <div className="step-number">{step.num}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA SECTION
          ═══════════════════════════════════════════ */}
      <section className="cta-section" style={{ padding: 'clamp(60px, 8vw, 100px) 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'var(--accent-muted)',
              border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <HiOutlineLightningBolt style={{ fontSize: 24, color: 'var(--accent-primary)' }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}>
              Ready to Create?
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              marginBottom: 32,
              lineHeight: 1.6,
            }}>
              Start generating professional certificates right now. No sign-up required.
            </p>
            <Link
              to="/upload"
              className="btn-primary"
              style={{ padding: '16px 40px', fontSize: '1rem', borderRadius: 14 }}
            >
              Start Creating <HiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════ */}
      <footer style={{
        padding: '32px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-primary)',
        background: 'var(--bg-primary)',
        transition: 'background-color 0.35s ease, border-color 0.35s ease',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Built with ❤️ — Velora © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
