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
      <h3 className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-3">Dynamic Fields</h3>
      
      <div className="space-y-1">
        {PREDEFINED_FIELDS.map((field) => (
          <button
            key={field.key}
            onClick={() => onAddField(field.name, field.key)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left
                       hover:bg-dark-700 text-dark-200 hover:text-white transition-colors group"
          >
            <span>{field.icon}</span>
            <span className="flex-1 font-medium">{field.name}</span>
            <HiOutlinePlus className="text-dark-500 group-hover:text-accent-400 transition-colors" />
          </button>
        ))}
      </div>

      <button
        onClick={onAddCustomField}
        className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                   border border-dashed border-dark-500 hover:border-accent-500/50 
                   text-dark-300 hover:text-accent-400 transition-colors"
      >
        <HiOutlineTag />
        <span>Add Custom Field</span>
      </button>
    </div>
  );
}
