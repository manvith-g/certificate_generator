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
      <div className="text-center py-8">
        <p className="text-dark-400 text-sm">Select a field on the canvas</p>
        <p className="text-dark-500 text-xs mt-1">to edit its properties</p>
      </div>
    );
  }

  const handleChange = (key, value) => {
    onUpdate(selectedFieldId, { [key]: value });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-dark-300 uppercase tracking-wider">Properties</h3>
        <button
          onClick={() => onRemove(selectedFieldId)}
          className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 
                     hover:bg-rose-500/20 transition-colors"
          title="Remove field"
        >
          <HiOutlineTrash className="text-sm" />
        </button>
      </div>

      {/* Field Info */}
      <div className="bg-dark-700 rounded-lg p-3 border border-dark-600">
        <p className="text-white text-sm font-medium">{field.field_name}</p>
        <p className="text-accent-400 text-xs mt-0.5">Key: {field.field_key}</p>
      </div>

      {/* Font Family */}
      <div>
        <label className="text-xs text-dark-300 font-medium block mb-1.5">Font Family</label>
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
        <label className="text-xs text-dark-300 font-medium block mb-1.5">
          Font Size: <span className="text-dark-100">{field.font_size || 32}px</span>
        </label>
        <input
          type="range" min={8} max={120}
          value={field.font_size || 32}
          onChange={(e) => handleChange('font_size', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Color */}
      <div>
        <label className="text-xs text-dark-300 font-medium block mb-1.5">Text Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={field.font_color || '#000000'}
            onChange={(e) => handleChange('font_color', e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={field.font_color || '#000000'}
            onChange={(e) => handleChange('font_color', e.target.value)}
            className="input-dark flex-1"
          />
        </div>
      </div>

      {/* Style Toggles */}
      <div>
        <label className="text-xs text-dark-300 font-medium block mb-1.5">Style</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleChange('font_weight', field.font_weight === 'bold' ? 'normal' : 'bold')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
              field.font_weight === 'bold'
                ? 'bg-accent-600/15 text-accent-300 border-accent-500/30'
                : 'bg-dark-700 text-dark-300 border-dark-600 hover:border-dark-500'
            }`}
          >
            B
          </button>
          <button
            onClick={() => handleChange('font_style', field.font_style === 'italic' ? 'normal' : 'italic')}
            className={`flex-1 py-2 rounded-lg text-sm italic transition-all border ${
              field.font_style === 'italic'
                ? 'bg-accent-600/15 text-accent-300 border-accent-500/30'
                : 'bg-dark-700 text-dark-300 border-dark-600 hover:border-dark-500'
            }`}
          >
            I
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="text-xs text-dark-300 font-medium block mb-1.5">Alignment</label>
        <div className="flex gap-2">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => handleChange('text_align', align)}
              className={`flex-1 py-2 rounded-lg text-xs capitalize transition-all border ${
                field.text_align === align
                  ? 'bg-accent-600/15 text-accent-300 border-accent-500/30'
                  : 'bg-dark-700 text-dark-300 border-dark-600 hover:border-dark-500'
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="text-xs text-dark-300 font-medium block mb-1.5">
          Letter Spacing: <span className="text-dark-100">{field.letter_spacing || 0}</span>
        </label>
        <input
          type="range" min={-5} max={30} step={0.5}
          value={field.letter_spacing || 0}
          onChange={(e) => handleChange('letter_spacing', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
