import { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { HiArrowRight, HiOutlineAdjustments, HiX } from 'react-icons/hi';
import useTemplateStore from '../store/useTemplateStore';
import useEditorStore from '../store/useEditorStore';
import useCanvas from '../hooks/useCanvas';
import CanvasEditor from '../components/editor/CanvasEditor';
import FieldPalette from '../components/editor/FieldPalette';
import TextProperties from '../components/editor/TextProperties';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export default function EditorPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { templateUrl, templateWidth, templateHeight } = useTemplateStore();
  const { isDirty, clearEditor } = useEditorStore();
  const canvasHook = useCanvas(containerRef);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customFieldModal, setCustomFieldModal] = useState(false);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldKey, setCustomFieldKey] = useState('');

  if (!templateUrl) {
    return <Navigate to="/upload" replace />;
  }

  const handleAddField = (name, key) => {
    canvasHook.addTextField(name, key);
    setSidebarOpen(false);
  };

  const handleAddCustomField = () => {
    if (!customFieldName.trim() || !customFieldKey.trim()) {
      toast.error('Both name and key are required');
      return;
    }
    canvasHook.addTextField(customFieldName.trim(), customFieldKey.trim());
    setCustomFieldModal(false);
    setCustomFieldName('');
    setCustomFieldKey('');
    setSidebarOpen(false);
  };

  const handleNext = () => {
    const fieldData = canvasHook.exportFieldData();
    if (fieldData.length === 0) {
      toast.error('Add at least one field to the template');
      return;
    }
    useEditorStore.getState().setFields(fieldData);
    useEditorStore.getState().setDirty(false);
    navigate('/csv');
  };

  return (
    <>
      {/* 
        Full-screen editor layout.
        We use a fixed position layout below the navbar (top: 56px = h-14).
        This ensures nothing gets clipped or hidden.
      */}
      <div style={{ position: 'fixed', top: 56, left: 0, right: 0, bottom: 0, display: 'flex', width: '100%' }}>

        {/* ═══ MOBILE BACKDROP OVERLAY ═══ */}
        {sidebarOpen && (
          <div
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 56,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--overlay-bg)',
              backdropFilter: 'blur(4px)',
              zIndex: 35,
            }}
          />
        )}

        {/* ═══ LEFT SIDEBAR (DRAWER ON MOBILE) ═══ */}
        <div className={`editor-sidebar-container ${sidebarOpen ? 'open' : ''}`}>

          {/* Sidebar Header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>Fields & Properties</span>
              <span style={{
                color: 'var(--text-muted)', fontSize: 12,
                background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6,
                transition: 'all 0.3s ease',
              }}>
                {templateWidth}×{templateHeight}
              </span>
            </div>
          </div>

          {/* Sidebar Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <FieldPalette
                onAddField={handleAddField}
                onAddCustomField={() => setCustomFieldModal(true)}
              />

              <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

              <TextProperties
                onUpdate={canvasHook.updateCanvasField}
                onRemove={canvasHook.removeCanvasField}
              />
            </div>
          </div>
        </div>

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* TOP TOOLBAR — always visible */}
          <div className="editor-toolbar px-4 sm:px-6" style={{
            flexShrink: 0,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Toggle Sidebar Button for Mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden flex items-center justify-center"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                }}
                title="Toggle properties"
              >
                {sidebarOpen ? <HiX style={{ fontSize: 18 }} /> : <HiOutlineAdjustments style={{ fontSize: 18 }} />}
              </button>

              <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>Editor</span>
              {isDirty && (
                <span style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  whiteSpace: 'nowrap',
                }}>
                  Unsaved
                </span>
              )}
            </div>

            {/* GENERATE BUTTON — responsive text */}
            <button
              onClick={handleNext}
              className="btn-primary"
              style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, gap: 6 }}
            >
              <span className="hidden sm:inline">Next: Upload CSV & Generate</span>
              <span className="inline sm:hidden">Next</span>
              <HiArrowRight style={{ fontSize: 14 }} />
            </button>
          </div>

          {/* CANVAS AREA */}
          <div
            ref={containerRef}
            className="editor-canvas-area"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              padding: '16px 12px',
            }}
          >
            <CanvasEditor
              templateUrl={templateUrl}
              templateWidth={templateWidth}
              templateHeight={templateHeight}
              canvasHook={canvasHook}
            />
          </div>
        </div>
      </div>

      {/* ═══ CUSTOM FIELD MODAL ═══ */}
      <Modal
        isOpen={customFieldModal}
        onClose={() => setCustomFieldModal(false)}
        title="Add Custom Field"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Display Name</label>
            <input
              type="text"
              value={customFieldName}
              onChange={(e) => setCustomFieldName(e.target.value)}
              placeholder="e.g., Workshop Title"
              className="input-dark"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>CSV Column Key</label>
            <input
              type="text"
              value={customFieldKey}
              onChange={(e) => setCustomFieldKey(e.target.value)}
              placeholder="e.g., WorkshopTitle"
              className="input-dark"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Must match the column header in your CSV</p>
          </div>
          <button onClick={handleAddCustomField} className="btn-primary" style={{ width: '100%', padding: '12px 24px' }}>
            Add Field
          </button>
        </div>
      </Modal>
    </>
  );
}
