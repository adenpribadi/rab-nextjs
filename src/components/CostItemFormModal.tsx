'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CostItemFormModal({ 
  projectId, 
  itemToEdit, 
  categories, 
  materials, 
  action 
}: { 
  projectId: number, 
  itemToEdit: any, 
  categories: any[], 
  materials: any[], 
  action: any 
}) {
  const [name, setName] = useState(itemToEdit?.name || '')
  const [unit, setUnit] = useState(itemToEdit?.unit || '')
  const [unitPrice, setUnitPrice] = useState(itemToEdit ? Number(itemToEdit.unitPrice) : '')
  const [categoryId, setCategoryId] = useState(itemToEdit?.categoryId || '')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)

    // Check if it matches a master material
    const matchedMaterial = materials.find(m => m.name.toLowerCase() === val.toLowerCase())
    if (matchedMaterial) {
      setUnit(matchedMaterial.unit)
      setUnitPrice(Number(matchedMaterial.unitPrice))
      if (matchedMaterial.categoryId) {
        setCategoryId(matchedMaterial.categoryId)
      }
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        background: 'var(--bg-secondary)',
        width: '100%',
        maxWidth: '500px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
            {itemToEdit ? 'Edit Cost Item' : 'Add New Cost Item'}
          </h3>
          <Link href={`/projects/${projectId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.2rem', lineHeight: 1 }}>&times;</Link>
        </div>
        
        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {itemToEdit && <input type="hidden" name="id" value={itemToEdit.id} />}
          <input type="hidden" name="projectId" value={projectId} />
          
          <datalist id="materials-list">
            {materials.map(m => <option key={m.id} value={m.name} />)}
          </datalist>

          <div>
            <label className="input-label">Work Category</label>
            <select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field" required>
              <option value="">-- Select Category --</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          
          <div>
            <label className="input-label">Item Name (Type to search Master Materials)</label>
            <input 
              type="text" 
              name="name" 
              value={name}
              onChange={handleNameChange}
              list="materials-list"
              className="input-field" 
              required 
              placeholder="e.g. Semen Portland 50kg" 
              autoComplete="off"
            />
          </div>
          
          <div>
            <label className="input-label">Description (Optional)</label>
            <input type="text" name="description" defaultValue={itemToEdit?.description || ''} className="input-field" placeholder="Remarks or spec details" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">Quantity</label>
              <input type="number" step="0.01" name="quantity" defaultValue={itemToEdit ? Number(itemToEdit.quantity) : ''} className="input-field" required placeholder="e.g. 10" />
            </div>
            <div>
              <label className="input-label">Unit</label>
              <input 
                type="text" 
                name="unit" 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)}
                className="input-field" 
                required 
                placeholder="e.g. Zak, M2" 
              />
            </div>
          </div>
          
          <div>
            <label className="input-label">Unit Price (Rp)</label>
            <input 
              type="number" 
              name="unitPrice" 
              value={unitPrice} 
              onChange={(e) => setUnitPrice(e.target.value)}
              className="input-field" 
              required 
              placeholder="e.g. 75000" 
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Link href={`/projects/${projectId}`} className="btn-secondary" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
              Cancel
            </Link>
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
              {itemToEdit ? 'Save Changes' : '+ Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
