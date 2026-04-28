import { prisma } from "@/lib/prisma";
import { createProject } from "@/app/actions/project";
import Link from "next/link";

export default async function NewProjectPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' }});

  return (
    <div style={{ padding: '1rem 0' }}>
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            Initialize New RAB Project
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Fill in the required project details to start generating cost estimations.
          </p>
        </div>
      </header>

      <form action={createProject} className="responsive-form-layout">
        {/* Left Column: Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* General Info Card */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontWeight: 600 }}>
              General Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Project Title <span style={{ color: 'var(--error)' }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="e.g. Renovasi Fasad dan Interior Kantor Pusat"
                  required
                />
              </div>

              <div className="responsive-grid" style={{ gap: '1rem' }}>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Client / Owner</label>
                  {clients.length > 0 ? (
                    <select name="clientId" className="input-field">
                      <option value="">-- Select Client --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="clientName"
                      className="input-field"
                      placeholder="e.g. PT. Maju Mundur"
                    />
                  )}
                  {clients.length > 0 && <input type="hidden" name="clientName" value="" />}
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Project Location</label>
                  <input
                    type="text"
                    name="location"
                    className="input-field"
                    placeholder="Kawasan SCBD, Jakarta Selatan"
                  />
                </div>
              </div>

              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Project Description & Scope</label>
                <textarea
                  name="description"
                  className="input-field"
                  placeholder="Provide comprehensive details regarding the scope of work..."
                  rows={5}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Schedule & Timing Card */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontWeight: 600 }}>
              Project Schedule
            </h2>

            <div className="responsive-grid" style={{ gap: '1rem' }}>
              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Estimated Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="input-field"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Estimated End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="input-field"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Financials & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(59, 130, 246, 0.3)', paddingBottom: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
              Financial Baseline
            </h2>

            <div>
              <label className="input-label" style={{ fontWeight: 600 }}>Target Budget (Rp) <span style={{ color: 'var(--error)' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>Rp</span>
                <input
                  type="number"
                  name="budget"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', fontSize: '1.1rem', fontWeight: 600 }}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Set the ceiling budget. Cost items added later will be validated against this baseline.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontWeight: 600 }}>
              Actions
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '1rem', fontWeight: 600, width: '100%' }}>
                Create Project
              </button>
              <Link href="/" style={{
                padding: '1rem',
                textAlign: 'center',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}>
                Cancel & Return
              </Link>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
