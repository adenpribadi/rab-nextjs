import { prisma } from '@/lib/prisma';
import { createCategory, deleteCategory } from '@/app/actions/category';

export default async function CategoriesPage() {
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

  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%' }}>
      <header className="page-header mobile-header-wrap" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Master Categories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Manage the work categories used to classify RAB cost items.</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        
        {/* Create Form */}
        <div className="glass-card" style={{ padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Add New Category</h2>
          
          <form action={createCategory} className="responsive-inline-form" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ flex: '1' }}>
              <input 
                type="text" 
                name="name" 
                className="input-field" 
                required 
                placeholder="Category Name (e.g., Pekerjaan Pondasi)" 
                style={{ padding: '0.6rem 0.75rem', fontSize: '0.9rem' }} 
              />
            </div>
            
            <div style={{ flex: '2' }}>
              <input 
                type="text" 
                name="description" 
                className="input-field" 
                placeholder="Description (Optional)" 
                style={{ padding: '0.6rem 0.75rem', fontSize: '0.9rem' }} 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem', height: '40px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              + Create
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', width: '60px' }}>ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', width: '30%' }}>Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Description</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', width: '120px' }}>Used By</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No categories found. Create one above.
                    </td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <tr key={category.id} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{category.id}</td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{category.name}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{category.description || '-'}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <span style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                          {category._count.items} items
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        {category._count.items === 0 ? (
                          <form action={deleteCategory}>
                            <input type="hidden" name="id" value={category.id} />
                            <button type="submit" style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                              Delete
                            </button>
                          </form>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'not-allowed' }} title="Cannot delete category in use">
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
