import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  File,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  RefreshCw,
  Copy,
  Check,
  X,
  Sparkles,
  BookOpen,
  Info,
  Clock,
  HardDrive
} from 'lucide-react';
import {
  getMaterials,
  uploadMaterial,
  getMaterialContent,
  deleteMaterial
} from '../services/api';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];

export default function LearningMaterialsManager({ defaultSubject = '' }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Selected file state
  const [selectedFile, setSelectedFile] = useState(null);
  const [customTitle, setCustomTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState(defaultSubject || 'CS301');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Preview Modal state
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Deletion confirm state
  const [deletingId, setDeletingId] = useState(null);

  // Load materials on mount
  useEffect(() => {
    loadMaterials();
  }, [defaultSubject]);

  const loadMaterials = async () => {
    setLoading(true);
    setError(null);
    const res = await getMaterials(defaultSubject || undefined);
    if (res.success && Array.isArray(res.data)) {
      setMaterials(res.data);
    } else {
      setError(res.error || 'Failed to connect to backend service.');
    }
    setLoading(false);
  };

  const validateFile = (file) => {
    if (!file) return 'Please select a file.';
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file format (.${ext}). Allowed: PDF, DOCX, TXT.`;
    }
    if (file.size === 0) {
      return 'Selected file is empty (0 bytes).';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds the 10 MB size limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
    }
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
        if (!customTitle) {
          setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
        if (!customTitle) {
          setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    const res = await uploadMaterial(selectedFile, {
      title: customTitle.trim(),
      subject_code: subjectCode
    });

    setUploading(false);

    if (res.success && res.data) {
      const doc = res.data;
      setSuccessMessage(
        `Document "${doc.title}" processed successfully! Extracted ${doc.extracted_char_count.toLocaleString()} characters.`
      );
      setSelectedFile(null);
      setCustomTitle('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh materials list from backend
      await loadMaterials();
    } else {
      setError(res.error || 'Upload failed. Please check backend server.');
    }
  };

  const handleOpenPreview = async (material) => {
    setPreviewMaterial(material);
    setLoadingPreview(true);
    setPreviewContent('');
    setCopied(false);

    const res = await getMaterialContent(material.id);
    setLoadingPreview(false);
    if (res.success && res.data) {
      setPreviewContent(res.data.extracted_text || '(No text extracted from this document)');
    } else {
      setPreviewContent(`Failed to load content: ${res.error || 'Unknown error'}`);
    }
  };

  const handleCopyPreview = () => {
    if (previewContent) {
      navigator.clipboard.writeText(previewContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteMaterial(id);
    setDeletingId(null);
    if (res.success) {
      setSuccessMessage('Document deleted successfully.');
      await loadMaterials();
    } else {
      setError(res.error || 'Failed to delete document.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="learning-materials-wrapper" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Learning Materials & Notes</h3>
            <span className="badge badge-primary">
              <Sparkles size={12} />
              <span>Phase 2 Engine</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Upload syllabus notes, PDFs, or slides to extract text for AI quiz generation and competency assessment.
          </p>
        </div>
        <button
          onClick={loadMaterials}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          title="Refresh document library"
        >
          <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alert Banners */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Grid: Upload Box + Materials List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Card 1: Upload Form */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Upload size={16} style={{ color: 'var(--primary)' }} />
            <span>Upload New Document</span>
          </h4>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-light)'}`,
              backgroundColor: dragActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              marginBottom: '1rem'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem'
            }}>
              <Upload size={22} />
            </div>
            {selectedFile ? (
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
                  {selectedFile.name}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {formatFileSize(selectedFile.size)} • Click to change file
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
                  Drag & drop your file here, or browse
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Supports <strong>PDF, DOCX, TXT</strong> (Max 10 MB)
                </p>
              </div>
            )}
          </div>

          {/* Metadata Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                Document Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Data Structures Chapter 3 - Trees"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                Target Subject
              </label>
              <select
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="CS301">CS301 - Data Structures</option>
                <option value="CS303">CS303 - Database Management</option>
                <option value="CS304">CS304 - Computer Networks</option>
                <option value="CS302">CS302 - Operating Systems</option>
                <option value="CS305">CS305 - Software Engineering</option>
                <option value="GEN101">GEN101 - General Studies</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {uploading ? (
              <>
                <RefreshCw size={16} className="spin-anim" />
                <span>Extracting Text & Processing...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload & Extract Text</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Document Repository List */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} style={{ color: 'var(--secondary)' }} />
              <span>Document Repository ({materials.length})</span>
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Persisted in SQLite
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--primary)' }} />
              Loading documents from backend...
            </div>
          ) : materials.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              margin: 'auto 0'
            }}>
              <FileText size={32} style={{ color: 'var(--text-light)', margin: '0 auto 0.5rem', display: 'block' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.25rem' }}>No documents uploaded yet</p>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>
                Upload your first syllabus notes, PDF, or DOCX document using the panel on the left.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '420px', paddingRight: '0.2rem' }}>
              {materials.map((item) => {
                const isReady = item.status === 'ready';
                const fileTypeUpper = (item.file_type || 'TXT').toUpperCase();
                return (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {/* Left: Icon & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: fileTypeUpper === 'PDF' ? '#fee2e2' : fileTypeUpper === 'DOCX' ? '#e0e7ff' : '#f1f5f9',
                        color: fileTypeUpper === 'PDF' ? '#dc2626' : fileTypeUpper === 'DOCX' ? '#4f46e5' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        flexShrink: 0
                      }}>
                        {fileTypeUpper}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                            {item.title}
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                            {item.subject_code}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                          <span>{item.extracted_char_count?.toLocaleString() || 0} chars</span>
                          <span>•</span>
                          <span>{formatFileSize(item.file_size_bytes)}</span>
                          <span>•</span>
                          <span style={{ color: isReady ? '#059669' : '#d97706', fontWeight: 600 }}>
                            {isReady ? 'Ready' : item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      <button
                        onClick={() => handleOpenPreview(item)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Preview Extracted Text"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>

                      {deletingId === item.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <button
                            onClick={() => handleDelete(item.id)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              fontSize: '0.75rem',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              borderRadius: 'var(--radius-sm)',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                            title="Confirm delete"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            style={{
                              padding: '0.35rem 0.4rem',
                              fontSize: '0.75rem',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(item.id)}
                          style={{
                            padding: '0.35rem 0.5rem',
                            color: '#94a3b8',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-sm)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                          title="Delete Document"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Extracted Text Preview Modal */}
      {previewMaterial && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-main)'
            }}>
              <div>
                <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem', fontWeight: 700 }}>
                  {previewMaterial.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  File: {previewMaterial.file_name} • {previewMaterial.extracted_char_count?.toLocaleString()} Characters Extracted
                </p>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '1.25rem 1.5rem',
              overflowY: 'auto',
              flex: 1,
              backgroundColor: 'var(--bg-surface)',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              color: 'var(--text-main)'
            }}>
              {loadingPreview ? (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--primary)' }} />
                  Fetching extracted text from server...
                </div>
              ) : (
                previewContent
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.9rem 1.5rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-main)'
            }}>
              <button
                onClick={handleCopyPreview}
                disabled={loadingPreview || !previewContent}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={() => setPreviewMaterial(null)}
                className="btn btn-primary btn-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
