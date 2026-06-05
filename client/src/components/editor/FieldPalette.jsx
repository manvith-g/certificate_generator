import { HiOutlinePlus, HiOutlineTag } from 'react-icons/hi';

const PREDEFINED_FIELDS = [
  { name: 'Name', key: 'Name', icon: '👤' },
  { name: 'Date', key: 'Date', icon: '📅' },
  { name: 'Event Name', key: 'EventName', icon: '🎪' },
  { name: 'Certificate ID', key: 'CertificateID', icon: '🔖' },
  { name: 'College Name', key: 'College', icon: '🏛️' },
  { name: 'Position/Rank', key: 'Position', icon: '🏆' },
];

export default function FieldPalette({ onAddField, onAddCustomField }) {
  return (
    <div>
      <h3 style={{
        fontSize: '0.75rem', fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: 1,
        marginBottom: 12,
      }}>
        Dynamic Fields
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {PREDEFINED_FIELDS.map((field) => (
          <button
            key={field.key}
            onClick={() => onAddField(field.name, field.key)}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8,
              fontSize: '0.875rem', textAlign: 'left',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span>{field.icon}</span>
            <span style={{ flex: 1, fontWeight: 500 }}>{field.name}</span>
            <HiOutlinePlus style={{ color: 'var(--text-muted)', transition: 'color 0.2s ease' }} />
          </button>
        ))}
      </div>

      <button
        onClick={onAddCustomField}
        style={{
          marginTop: 8, width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px', borderRadius: 8,
          fontSize: '0.875rem',
          border: '1px dashed var(--border-hover)',
          background: 'transparent',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = 'var(--accent-border)';
          e.currentTarget.style.color = 'var(--accent-primary)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = 'var(--border-hover)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <HiOutlineTag />
        <span>Add Custom Field</span>
      </button>
    </div>
  );
}
