'use client'

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      style={{ 
        padding: '0.5rem 1rem', 
        background: '#2563eb', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        fontWeight: 500, 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
      }}
    >
      Print Invoice
    </button>
  )
}
