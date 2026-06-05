import { useState, useCallback, useRef, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineExclamation } from 'react-icons/hi';

export default function CsvPreviewTable({ data, headers, onDataChange, expectedKeys }) {
  const [editingCell, setEditingCell] = useState(null); // { row, col }
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const startEdit = (rowIdx, colIdx) => {
    setEditingCell({ row: rowIdx, col: colIdx });
    setEditValue(data[rowIdx][headers[colIdx]] ?? '');
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const newData = data.map((row, i) => {
      if (i === editingCell.row) {
        return { ...row, [headers[editingCell.col]]: editValue };
      }
      return row;
    });
    onDataChange(newData);
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitEdit();
      // Move to next cell
      if (editingCell) {
        const nextCol = editingCell.col + 1;
        if (nextCol < headers.length) {
          setTimeout(() => startEdit(editingCell.row, nextCol), 0);
        } else if (editingCell.row + 1 < data.length) {
          setTimeout(() => startEdit(editingCell.row + 1, 0), 0);
        }
      }
    }
  };

  const addRow = () => {
    const emptyRow = {};
    headers.forEach((h) => (emptyRow[h] = ''));
    onDataChange([...data, emptyRow]);
  };

  const deleteRow = (rowIdx) => {
    const newData = data.filter((_, i) => i !== rowIdx);
    onDataChange(newData);
    if (editingCell?.row === rowIdx) cancelEdit();
  };

  const matchedKeys = expectedKeys
    ? new Set(headers.filter((h) => expectedKeys.includes(h)))
    : null;

  const missingKeys = expectedKeys
    ? expectedKeys.filter((k) => !headers.includes(k))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Column Match Indicator */}
      {expectedKeys && expectedKeys.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          padding: '10px 14px', borderRadius: 10,
          background: missingKeys.length > 0
            ? 'rgba(251, 191, 36, 0.08)'
            : 'rgba(16, 185, 129, 0.08)',
          border: `1px solid ${missingKeys.length > 0
            ? 'rgba(251, 191, 36, 0.2)'
            : 'rgba(16, 185, 129, 0.2)'}`,
        }}>
          {missingKeys.length === 0 ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#34d399', fontWeight: 500 }}>
              <HiOutlineCheck style={{ fontSize: 14 }} />
              All field keys found in CSV columns
            </span>
          ) : (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#fbbf24', fontWeight: 500 }}>
                <HiOutlineExclamation style={{ fontSize: 14 }} />
                Missing columns:
              </span>
              {missingKeys.map((k) => (
                <span key={k} style={{
                  fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6,
                  background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.25)', fontFamily: 'monospace',
                }}>
                  {k}
                </span>
              ))}
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--border-primary)',
        background: 'var(--bg-card)',
      }}>
        <div style={{
          overflowX: 'auto', overflowY: 'auto',
          maxHeight: 360,
        }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: '10px 12px', textAlign: 'center',
                  background: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)', fontWeight: 600,
                  fontSize: '0.68rem', textTransform: 'uppercase',
                  letterSpacing: '0.05em', position: 'sticky', top: 0, zIndex: 2,
                  width: 44,
                }}>
                  #
                </th>
                {headers.map((header, i) => {
                  const isMatched = matchedKeys?.has(header);
                  const isExpected = expectedKeys?.includes(header);
                  return (
                    <th key={i} style={{
                      padding: '10px 14px', textAlign: 'left',
                      background: 'var(--bg-elevated)',
                      borderBottom: '1px solid var(--border-primary)',
                      color: isMatched ? '#34d399' : isExpected === false ? 'var(--text-muted)' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '0.72rem',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 2,
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isMatched && <HiOutlineCheck style={{ fontSize: 12, flexShrink: 0 }} />}
                        {header}
                      </span>
                    </th>
                  );
                })}
                <th style={{
                  padding: '10px 12px', textAlign: 'center',
                  background: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border-primary)',
                  position: 'sticky', top: 0, zIndex: 2,
                  width: 44,
                }} />
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr key={rowIdx} style={{
                  transition: 'background 0.15s ease',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Row number */}
                  <td style={{
                    padding: '8px 12px', textAlign: 'center',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500,
                  }}>
                    {rowIdx + 1}
                  </td>
                  {/* Data cells */}
                  {headers.map((header, colIdx) => {
                    const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;
                    return (
                      <td
                        key={colIdx}
                        onClick={() => !isEditing && startEdit(rowIdx, colIdx)}
                        style={{
                          padding: isEditing ? '4px 6px' : '8px 14px',
                          borderBottom: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          cursor: 'text',
                          minWidth: 100,
                          maxWidth: 260,
                          position: 'relative',
                        }}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={commitEdit}
                            style={{
                              width: '100%',
                              padding: '5px 8px',
                              fontSize: '0.8rem',
                              background: 'var(--bg-input)',
                              border: '1.5px solid var(--accent-primary)',
                              borderRadius: 6,
                              color: 'var(--text-primary)',
                              outline: 'none',
                              fontFamily: 'var(--font-sans)',
                              boxShadow: '0 0 0 3px var(--accent-muted)',
                            }}
                          />
                        ) : (
                          <span style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {row[header] || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>empty</span>}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {/* Delete button */}
                  <td style={{
                    padding: '8px 8px',
                    borderBottom: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRow(rowIdx); }}
                      title="Delete row"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 4, borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#f43f5e';
                        e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      <HiOutlineTrash style={{ fontSize: 14 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer: row count + add row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {data.length} row{data.length !== 1 ? 's' : ''} • Click any cell to edit
        </span>
        <button
          onClick={addRow}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: '1px dashed var(--border-hover)',
            color: 'var(--text-secondary)', fontSize: '0.75rem',
            padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
            fontWeight: 500, transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color = 'var(--accent-primary)';
            e.currentTarget.style.background = 'var(--accent-muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-hover)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'none';
          }}
        >
          <HiOutlinePlus style={{ fontSize: 13 }} />
          Add Row
        </button>
      </div>
    </div>
  );
}
