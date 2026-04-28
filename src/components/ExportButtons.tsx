'use client';

import * as XLSX from 'xlsx';
import Link from 'next/link';

export default function ExportButtons({ project, estimateTotal, realizedTotal }: { project: any, estimateTotal: number, realizedTotal: number }) {
  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // 1. Prepare data for Excel
    const rows = project.items.map((item: any, index: number) => {
      const itemEstimate = Number(item.totalPrice);
      const itemRealized = item.expenses ? item.expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) : 0;
      const variance = itemEstimate - itemRealized;
      
      return {
        'No': index + 1,
        'Work Category': item.category.name,
        'Item Description': item.name,
        'Qty': Number(item.quantity),
        'Unit': item.unit,
        'Unit Price (Rp)': Number(item.unitPrice),
        'Estimate Total (Rp)': itemEstimate,
        'Realized Total (Rp)': itemRealized,
        'Variance (Rp)': variance,
        'Status': variance < 0 ? 'OVER BUDGET' : (itemRealized > 0 ? 'OK' : 'PLANNING')
      };
    });

    // Add empty row
    rows.push({});
    // Add Grand Total row
    rows.push({
      'No': '',
      'Work Category': '',
      'Item Description': 'GRAND TOTAL',
      'Qty': '',
      'Unit': '',
      'Unit Price (Rp)': '',
      'Estimate Total (Rp)': estimateTotal,
      'Realized Total (Rp)': realizedTotal,
      'Variance (Rp)': estimateTotal - realizedTotal,
      'Status': (estimateTotal - realizedTotal) < 0 ? 'OVER BUDGET' : 'OK'
    });

    // 2. Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Realization_Report');

    // 3. Customize column widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 20 }, // Work Category
      { wch: 35 }, // Item Description
      { wch: 8 },  // Qty
      { wch: 8 },  // Unit
      { wch: 15 }, // Unit Price
      { wch: 18 }, // Estimate Total
      { wch: 18 }, // Realized Total
      { wch: 15 }, // Variance
      { wch: 15 }, // Status
    ];

    // 4. Generate and download Excel file
    XLSX.writeFile(workbook, `Report_${project.name.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
      <button 
        onClick={handleExportExcel} 
        style={{ 
          padding: '0.4rem 0.75rem', 
          fontSize: '0.8rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          background: 'rgba(16, 185, 129, 0.15)', 
          color: '#34d399', 
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500
        }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Excel
      </button>
      <Link 
        href={`/projects/${project.id}/invoice`} 
        style={{ 
          padding: '0.4rem 0.75rem', 
          fontSize: '0.8rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          background: 'rgba(59, 130, 246, 0.15)', 
          color: 'var(--accent-primary)', 
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
          textDecoration: 'none'
        }}
        target="_blank"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Invoice
      </Link>
      <Link 
        href={`/projects/${project.id}/realization`} 
        style={{ 
          padding: '0.4rem 0.75rem', 
          fontSize: '0.8rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          background: 'rgba(139, 92, 246, 0.15)', 
          color: '#a78bfa', 
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500,
          textDecoration: 'none'
        }}
        target="_blank"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Report
      </Link>
    </div>
  );
}
