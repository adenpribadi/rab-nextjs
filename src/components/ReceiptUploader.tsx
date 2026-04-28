'use client';

import { useState, useRef } from 'react';

interface ReceiptUploaderProps {
  expenseId: number;
  currentImageUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
}

export default function ReceiptUploader({ expenseId, currentImageUrl, onUploadSuccess }: ReceiptUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('expenseId', expenseId.toString());

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setPreview(currentImageUrl || null);
      } else {
        setPreview(data.url);
        onUploadSuccess?.(data.url);
      }
    } catch {
      setError('Network error. Please try again.');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  }

  const isPdf = preview?.endsWith('.pdf');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {preview ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {isPdf ? (
            <a
              href={preview}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '4px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none'
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              View PDF Receipt
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setShowViewer(true)}
              style={{ display: 'block', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }}
            >
              <img
                src={preview}
                alt="Receipt"
                style={{
                  width: '80px', height: '60px', objectFit: 'cover',
                  borderRadius: '4px', border: '1px solid var(--border-color)'
                }}
              />
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              position: 'absolute', top: '-6px', right: '-6px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              borderRadius: '50%', width: '18px', height: '18px',
              fontSize: '10px', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Replace"
          >↑</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)',
            borderRadius: '4px', padding: '0.35rem 0.6rem', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.75rem'
          }}
        >
          {uploading ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attach Receipt
            </>
          )}
        </button>
      )}
      {error && <span style={{ fontSize: '0.7rem', color: 'var(--error)' }}>{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      {/* Full-size image viewer modal */}
      {showViewer && preview && !isPdf && (
        <div
          onClick={() => setShowViewer(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out', padding: '2rem'
          }}
        >
          <img
            src={preview}
            alt="Receipt full view"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
          />
          <button
            onClick={() => setShowViewer(false)}
            style={{
              position: 'fixed', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%',
              width: '36px', height: '36px', color: 'white', fontSize: '1.2rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >×</button>
        </div>
      )}
    </div>
  );
}
