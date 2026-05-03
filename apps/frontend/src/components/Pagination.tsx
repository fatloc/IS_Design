import React, { useState, useEffect } from 'react';

export interface PaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const displayPage = currentPage + 1;
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalElements);

  const [jumpValue, setJumpValue] = useState("");
  useEffect(() => { setJumpValue(""); }, [currentPage]);

  const handleJump = () => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= (totalPages || 1)) {
      onPageChange(page - 1);
      setJumpValue("");
    }
  };

  if (totalElements === 0) return null;

  const A = "#4F46E5";

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '1rem 0', borderTop: '1px solid #eaeaea' }}>
      {/* Result info */}
      <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
        Hiển thị{' '}
        <strong style={{ color: '#1E293B' }}>{startItem}</strong>–<strong style={{ color: '#1E293B' }}>{endItem}</strong>
        {' '}/ <strong style={{ color: '#1E293B' }}>{totalElements}</strong> kết quả
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Page size selector */}
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748B' }}>
            <span>Số dòng:</span>
            <select
              value={pageSize}
              onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(0); }}
              style={{ padding: '0.3rem 0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          style={{
            padding: '0.4rem 0.8rem', cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            border: '1px solid #E2E8F0', borderRadius: '10px',
            background: currentPage === 0 ? '#f8fafc' : 'white',
            color: currentPage === 0 ? '#CBD5E1' : '#374151',
            fontSize: '0.78rem', fontWeight: 600,
            boxShadow: currentPage === 0 ? 'none' : '0 1px 4px rgba(79,70,229,0.10)',
          }}
        >
          ‹ Trước
        </button>

        {/* Page indicator */}
        <span style={{ padding: '0.4rem 0.75rem', background: '#F1F5F9', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', color: '#1E293B', whiteSpace: 'nowrap' }}>
          {displayPage} / {totalPages || 1}
        </span>

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min((totalPages || 1) - 1, currentPage + 1))}
          disabled={displayPage >= totalPages}
          style={{
            padding: '0.4rem 0.8rem', cursor: displayPage >= totalPages ? 'not-allowed' : 'pointer',
            border: '1px solid #E2E8F0', borderRadius: '10px',
            background: displayPage >= totalPages ? '#f8fafc' : 'white',
            color: displayPage >= totalPages ? '#CBD5E1' : '#374151',
            fontSize: '0.78rem', fontWeight: 600,
            boxShadow: displayPage >= totalPages ? 'none' : '0 1px 4px rgba(79,70,229,0.10)',
          }}
        >
          Sau ›
        </button>

        {/* Jump to page — only show when there are multiple pages */}
        {(totalPages || 1) > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderLeft: '1px solid #E2E8F0', paddingLeft: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>Đến trang</span>
            <input
              type="number"
              min={1}
              max={totalPages || 1}
              value={jumpValue}
              onChange={e => setJumpValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleJump(); }}
              placeholder={String(currentPage + 1)}
              style={{
                width: '52px', padding: '0.35rem 0.5rem', borderRadius: '8px',
                border: '1.5px solid #E2E8F0', background: 'white',
                fontSize: '0.78rem', textAlign: 'center', outline: 'none',
                color: '#1E293B', fontWeight: 600,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = A; e.currentTarget.style.boxShadow = `0 0 0 3px ${A}18`; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              onClick={handleJump}
              style={{
                padding: '0.35rem 0.65rem', borderRadius: '8px',
                background: `linear-gradient(135deg,${A},#7C3AED)`,
                color: 'white', fontSize: '0.78rem', fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: `0 2px 8px ${A}35`,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.filter = ''}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
