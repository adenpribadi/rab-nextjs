"use client";

export default function DeleteSupplierButton() {
  return (
    <button 
      type="submit" 
      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }} 
      title="Delete" 
      onClick={(e) => { 
        if(!confirm('Delete this supplier? Related expense connections will be removed, but the expenses themselves will not be deleted.')) {
          e.preventDefault(); 
        }
      }}
    >
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
