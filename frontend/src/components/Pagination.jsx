import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          className={`btn-page ${page === i + 1 ? 'active' : ''}`}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: page === i + 1 ? 'var(--primary-gold)' : 'var(--white)',
            color: page === i + 1 ? 'var(--white)' : 'var(--dark-slate)',
            border: '1px solid var(--primary-gold)'
          }}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
