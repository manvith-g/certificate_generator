import useEditorStore from '../../store/useEditorStore';
import { HiOutlineTrash } from 'react-icons/hi';

const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Poppins', 'Playfair Display', 'Montserrat',
  'Open Sans', 'Lato', 'Great Vibes', 'Dancing Script', 'Arial',
];

export default function TextProperties({ onUpdate, onRemove }) {
  const selectedFieldId = useEditorStore((s) => s.selectedFieldId);
  const fields = useEditorStore((s) => s.fields);
  const field = fields.find((f) => f.id === selectedFieldId);

  if (!field) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Select a field on the canvas</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4, opacity: 0.7 }}>to edit its properties</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    onUpdate(selectedFieldId, { [key]: value });
  };

  const toggleBtnStyle = (isActive) => ({
    flex: 1,
    padding: '8px 0',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: isActive ? 700 : 500,
    fontStyle: 'normal',
    transition: 'all 0.2s ease',
    border: '1px solid',
    background: isActive ? 'var(--accent-muted)' : 'var(--bg-elevated)',
    color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
    borderColor: isActive ? 'var(--accent-border)' : 'var(--border-primary)',
    cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Properties</h3>
        <button
          onClick={() => onRemove(selectedFieldId)}
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(244, 63, 94, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fb7185', border: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
          title="Remove field"
        >
          <HiOutlineTrash style={{ fontSize: 14 }} />
        </button>
      </div>

      {/* Field Info */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 8, padding: 12,
        border: '1px solid var(--border-primary)',
        transition: 'all 0.3s ease',
      }}>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{field.field_name}</p>
        <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginTop: 2 }}>Key: {field.field_key}</p>
      </div>

      {/* Font Family */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Font Family</label>
        <select
          value={field.font_family || 'Inter'}
          onChange={(e) => handleChange('font_family', e.target.value)}
          className="select-dark"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
          Font Size: <span style={{ color: 'var(--text-primary)' }}>{field.font_size || 32}px</span>
        </label>
        <input
          type="range" min={8} max={120}
          value={field.font_size || 32}
          onChange={(e) => handleChange('font_size', parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Color */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Text Color</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={field.font_color || '#000000'}
            onChange={(e) => handleChange('font_color', e.target.value)}
            style={{ width: 40, height: 40, borderRadius: 8, cursor: 'pointer' }}
          />
          <input
            type="text"
            value={field.font_color || '#000000'}
            onChange={(e) => handleChange('font_color', e.target.value)}
            className="input-dark"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Style Toggles */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Style</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => handleChange('font_weight', field.font_weight === 'bold' ? 'normal' : 'bold')}
            style={{ ...toggleBtnStyle(field.font_weight === 'bold'), fontWeight: 700 }}
          >
            B
          </button>
          <button
            onClick={() => handleChange('font_style', field.font_style === 'italic' ? 'normal' : 'italic')}
            style={{ ...toggleBtnStyle(field.font_style === 'italic'), fontStyle: 'italic' }}
          >
            I
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Alignment</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => handleChange('text_align', align)}
              style={{
                ...toggleBtnStyle(field.text_align === align),
                fontSize: '0.75rem',
                textTransform: 'capitalize',
              }}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 6 }}>
          Letter Spacing: <span style={{ color: 'var(--text-primary)' }}>{field.letter_spacing || 0}</span>
        </label>
        <input
          type="range" min={-5} max={30} step={0.5}
          value={field.letter_spacing || 0}
          onChange={(e) => handleChange('letter_spacing', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
