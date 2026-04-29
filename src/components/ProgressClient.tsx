'use client'

import { useState } from 'react'
import { updateProgress, deleteProgress } from '@/app/actions/progress'
import Link from 'next/link'

interface Project {
  id: number
  name: string
  clientName: string | null
  items: CostItem[]
}

interface CostItem {
  id: number
  name: string
  categoryName: string
  unit: string | null
  actualProgress: number
  quantity: number
  totalPrice: number
  progressUpdates: ProgressUpdate[]
}

interface ProgressUpdate {
  id: number
  percentage: number
  description: string | null
  updateDate: Date | string
  updatedBy: string | null
}

export default function ProgressClient({ projects }: { projects: any[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projects[0]?.id || null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [updateMode, setUpdateMode] = useState<'simple' | 'detailed'>('simple')
  const [viewingHistoryId, setViewingHistoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // Calculate Weighted Project Progress
  const totalRAB = selectedProject?.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0) || 1
  const weightedProgress = selectedProject?.items.reduce((sum: number, item: any) => {
    return sum + (item.actualProgress / 100 * item.totalPrice)
  }, 0) || 0
  const totalProjectPercentage = (weightedProgress / totalRAB) * 100

  // Collect all updates for the activity feed
  const allUpdates = selectedProject?.items.flatMap((item: any) => 
    item.progressUpdates.map((up: any) => ({
      ...up,
      itemName: item.name,
      itemUnit: item.unit
    }))
  ).sort((a: any, b: any) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime()) || []

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateProgress(formData)
      setUpdatingId(null)
    } catch (err) {
      alert("Failed to update progress")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this progress update? The project progress will be rolled back.")) return
    setLoading(true)
    try {
      await deleteProgress(id)
    } catch (err) {
      alert("Failed to delete update")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Project Selector */}
      <div className="glass-card" style={{ padding: '1rem' }}>
        <label className="input-label">Select Project to Track</label>
        <select 
          className="input-field" 
          value={selectedProjectId || ''} 
          onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
          style={{ maxWidth: '400px' }}
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name} {p.clientName ? `(${p.clientName})` : ''}</option>
          ))}
        </select>
      </div>

      {!selectedProject ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No active projects found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }} className="responsive-grid-detail">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Project Completion</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Weighted average based on item values</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>{totalProjectPercentage.toFixed(1)}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>Overall Progress</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Work Items Progress</h3>
              <Link href={`/projects/${selectedProject.id}`} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View Full RAB</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Original Items Section */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Original RAB Items
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {selectedProject.items.filter((item: any) => !item.isVO).map((item: any) => (
                    <div key={item.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>{item.category.name}</div>
                        <h4 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>{item.name}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.quantity} {item.unit}</div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Item Progress</span>
                          <span style={{ fontWeight: 700, color: item.actualProgress >= 100 ? 'var(--success)' : 'var(--text-primary)' }}>{Number(item.actualProgress).toFixed(1)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${item.actualProgress}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.5s ease' }}></div>
                        </div>
                      </div>

                      {updatingId === item.id ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <input type="hidden" name={item.isVO ? "voItemId" : "costItemId"} value={item.id} />
                          <input type="hidden" name="updateType" value={updateMode} />
                          <input type="hidden" name="targetVolume" value={item.quantity} />
                          
                          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '2px' }}>
                            <button type="button" onClick={() => setUpdateMode('simple')} style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem', borderRadius: '4px', background: updateMode === 'simple' ? 'var(--accent-primary)' : 'transparent', color: updateMode === 'simple' ? 'white' : 'var(--text-muted)' }}>Simple (%)</button>
                            <button type="button" onClick={() => setUpdateMode('detailed')} style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem', borderRadius: '4px', background: updateMode === 'detailed' ? 'var(--accent-primary)' : 'transparent', color: updateMode === 'detailed' ? 'white' : 'var(--text-muted)' }}>Detailed (Vol)</button>
                          </div>

                          {updateMode === 'simple' ? (
                            <div>
                              <label className="input-label" style={{ fontSize: '0.75rem' }}>Completion (%)</label>
                              <input type="number" name="percentage" defaultValue={Number(item.actualProgress)} min="0" max="100" step="0.1" className="input-field" required />
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: <b>{item.quantity} {item.unit}</b></div>
                              <input type="number" name="volume" defaultValue={Number(item.actualVolume) || 0} max={item.quantity} step="0.01" className="input-field" required />
                            </div>
                          )}

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <select name="weather" className="input-field" style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                              <option value="Sunny">☀️ Sunny</option>
                              <option value="Cloudy">☁️ Cloudy</option>
                              <option value="Rainy">🌧️ Rainy</option>
                            </select>
                            <input type="text" name="staffName" className="input-field" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Mandor" />
                          </div>

                          <textarea name="description" className="input-field" placeholder="Notes..." rows={2} style={{ fontSize: '0.8rem' }}></textarea>
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" onClick={() => setUpdatingId(null)} className="btn-secondary" style={{ flex: 1, padding: '0.4rem' }}>Cancel</button>
                            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '0.4rem' }}>{loading ? 'Saving...' : 'Save'}</button>
                          </div>
                        </form>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => setUpdatingId(item.id)} className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}>Update</button>
                          <button onClick={() => setViewingHistoryId(item.id)} className="btn-secondary" style={{ padding: '0.5rem' }} title="View History">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* VO Items Section */}
              {selectedProject.items.some((item: any) => item.isVO) && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Approved Variation Orders
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {selectedProject.items.filter((item: any) => item.isVO).map((item: any) => (
                      <div key={item.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--warning)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>VO: {item.category.name}</div>
                          <h4 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>{item.name.replace('(VO) ', '')}</h4>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.quantity} {item.unit}</div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>VO Progress</span>
                            <span style={{ fontWeight: 700, color: item.actualProgress >= 100 ? 'var(--success)' : 'var(--warning)' }}>{Number(item.actualProgress).toFixed(1)}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.actualProgress}%`, height: '100%', background: 'var(--warning)', transition: 'width 0.5s ease' }}></div>
                          </div>
                        </div>

                        {updatingId === item.id ? (
                          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <input type="hidden" name={item.isVO ? "voItemId" : "costItemId"} value={item.id} />
                            <input type="hidden" name="updateType" value={updateMode} />
                            <input type="hidden" name="targetVolume" value={item.quantity} />
                            
                            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '2px' }}>
                              <button type="button" onClick={() => setUpdateMode('simple')} style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem', borderRadius: '4px', background: updateMode === 'simple' ? 'var(--warning)' : 'transparent', color: updateMode === 'simple' ? 'black' : 'var(--text-muted)' }}>Simple (%)</button>
                              <button type="button" onClick={() => setUpdateMode('detailed')} style={{ flex: 1, padding: '0.3rem', fontSize: '0.75rem', borderRadius: '4px', background: updateMode === 'detailed' ? 'var(--warning)' : 'transparent', color: updateMode === 'detailed' ? 'black' : 'var(--text-muted)' }}>Detailed (Vol)</button>
                            </div>

                            {updateMode === 'simple' ? (
                              <div>
                                <label className="input-label" style={{ fontSize: '0.75rem' }}>Completion (%)</label>
                                <input type="number" name="percentage" defaultValue={Number(item.actualProgress)} min="0" max="100" step="0.1" className="input-field" required />
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: <b>{item.quantity} {item.unit}</b></div>
                                <input type="number" name="volume" defaultValue={Number(item.actualVolume) || 0} max={item.quantity} step="0.01" className="input-field" required />
                              </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <select name="weather" className="input-field" style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                                <option value="Sunny">☀️ Sunny</option>
                                <option value="Cloudy">☁️ Cloudy</option>
                                <option value="Rainy">🌧️ Rainy</option>
                              </select>
                              <input type="text" name="staffName" className="input-field" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Mandor" />
                            </div>

                            <textarea name="description" className="input-field" placeholder="Notes..." rows={2} style={{ fontSize: '0.8rem' }}></textarea>
                            
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button type="button" onClick={() => setUpdatingId(null)} className="btn-secondary" style={{ flex: 1, padding: '0.4rem' }}>Cancel</button>
                              <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '0.4rem', background: 'var(--warning)', color: 'black' }}>{loading ? 'Saving...' : 'Save Update'}</button>
                            </div>
                          </form>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setUpdatingId(item.id)} className="btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: 'var(--warning)', color: 'black' }}>Update VO</button>
                            <button onClick={() => setViewingHistoryId(item.id)} className="btn-secondary" style={{ padding: '0.5rem' }} title="View History">
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed / Reports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Activity Reports</h3>
            <div className="glass-card" style={{ padding: '1rem', flex: 1, overflowY: 'auto', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allUpdates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No updates recorded yet.
                </div>
              ) : (
                allUpdates.map((up: any, i: number) => (
                  <div key={i} style={{ paddingBottom: '1rem', borderBottom: i === allUpdates.length - 1 ? 'none' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{up.itemName}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>{Number(up.percentage)}%</div>
                    </div>
                    {up.volume && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        Volume: {Number(up.volume)} {up.itemUnit}
                      </div>
                    )}
                    {up.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px', fontStyle: 'italic' }}>
                        "{up.description}"
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <span>Reported by <b>{up.updatedBy || 'Unknown'}</b></span>
                        {up.staffName && <span>Mandor: <b style={{ color: 'var(--text-primary)' }}>{up.staffName}</b></span>}
                        <span>{new Date(up.updateDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <button 
                        onClick={() => handleDelete(up.id)} 
                        disabled={loading}
                        style={{ color: 'var(--error)', padding: '0.2rem', opacity: 0.6 }}
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Modal Overlay */}
      {viewingHistoryId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '1rem'
        }}>
          <div className="glass-card" style={{
            background: 'var(--bg-secondary)', width: '100%', maxWidth: '500px',
            padding: '1.5rem', border: '1px solid var(--border-color)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Progress History</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  {selectedProject?.items.find((i: any) => i.id === viewingHistoryId)?.name}
                </p>
              </div>
              <button onClick={() => setViewingHistoryId(null)} style={{ color: 'var(--text-muted)', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
              {(() => {
                const currentItem = selectedProject?.items.find((i: any) => i.id === viewingHistoryId);
                if (!currentItem || currentItem.progressUpdates.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      No history found for this item.
                    </div>
                  );
                }
                return currentItem.progressUpdates.map((up: any, idx: number) => (
                  <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>{Number(up.percentage)}%</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(up.updateDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <button 
                          onClick={() => handleDelete(up.id)} 
                          disabled={loading}
                          className="btn-icon"
                          style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px', borderRadius: '4px' }}
                        >
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {up.volume && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        Volume: {Number(up.volume)} {currentItem.unit}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {up.weather && <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-muted)' }}>{up.weather}</span>}
                    </div>
                    {up.description && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{up.description}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span>Reported by: <b>{up.updatedBy || 'System'}</b></span>
                         <span>{new Date(up.updateDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {up.staffName && (
                        <div style={{ color: 'var(--text-primary)' }}>
                          Mandor Lapangan: <b>{up.staffName}</b>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setViewingHistoryId(null)} className="btn-primary" style={{ padding: '0.5rem 2rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
