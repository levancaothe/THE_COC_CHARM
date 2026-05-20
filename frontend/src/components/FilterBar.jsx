import React from 'react';

const FilterBar = ({ categories, onFilter, onSort }) => {
  return (
    <div className="filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <select 
        className="glass"
        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', outline: 'none' }}
        onChange={(e) => onFilter(e.target.value)}
      >
        <option value="">Tất cả chủ đề</option>
        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>

      <select 
        className="glass"
        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', outline: 'none' }}
        onChange={(e) => onSort(e.target.value)}
      >
        <option value="-createdAt">Mới nhất</option>
        <option value="price">Giá: Thấp đến Cao</option>
        <option value="-price">Giá: Cao đến Thấp</option>
      </select>
    </div>
  );
};

export default FilterBar;
