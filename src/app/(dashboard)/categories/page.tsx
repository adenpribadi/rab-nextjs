import { prisma } from '@/lib/prisma';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/category';
import Link from 'next/link';

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string, add?: string }>
}) {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { items: true }
      }
    },
    orderBy: {
      id: 'desc'
    }
  });

  const resolvedParams = await searchParams;
  const isEditing = !!resolvedParams.edit;
  const isAdding = !!resolvedParams.add;
  
  let editCategory = null;
  if (isEditing) {
    editCategory = categories.find(c => c.id === parseInt(resolvedParams.edit as string));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>Master Categories</h1>
          <p className="page-subtitle">Manage the work categories used to classify RAB cost items.</p>
        </div>
        <Link href="/categories?add=true" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Add Category
        </Link>
      </header>

      <div className="glass-card">
        <div className="table-responsive-wrapper">
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', width: '60px' }}>ID</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Description</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', width: '120px' }}>Used By</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right', width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={category.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td data-label="ID" style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>#{category.id}</td>
                    <td data-label="Name" style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{category.name}</td>
                    <td data-label="Description" style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{category.description || '-'}</td>
                    <td data-label="Used By" style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <span style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                        {category._count.items} items
                      </span>
                    </td>
                    <td data-label="Action" style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div className="table-actions-mobile" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link href={`/categories?edit=${category.id}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59,130,246,0.1)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Edit
                        </Link>
                        {category._count.items === 0 ? (
                          <form action={deleteCategory}>
                            <input type="hidden" name="id" value={category.id} />
                            <button type="submit" style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>
                              Delete
                            </button>
                          </form>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.5 }} title="In Use">
                            Locked
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Category */}
      {(isAdding || isEditing) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-card" style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '480px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
              <Link href="/categories" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '1.5rem' }}>&times;</Link>
            </div>
            
            <form action={isEditing ? updateCategory : createCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {isEditing && <input type="hidden" name="id" value={editCategory?.id} />}
              
              <div>
                <label className="input-label">Category Name *</label>
                <input type="text" name="name" defaultValue={editCategory?.name} className="input-field" required placeholder="e.g. Pekerjaan Pondasi" />
              </div>
              
              <div>
                <label className="input-label">Description (Optional)</label>
                <textarea name="description" defaultValue={editCategory?.description || ''} className="input-field" rows={3} placeholder="Describe what this category covers..."></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link href="/categories" style={{ padding: '0.5rem 1.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '4px', fontSize: '0.9rem' }}>
                  Cancel
                </Link>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                  {isEditing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
