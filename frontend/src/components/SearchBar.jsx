import React from 'react';

const SearchBar = ({ onSearch }) => {
  return (
    <div className="search-bar">
      <input 
        type="text" 
        placeholder="Tìm kiếm charm..." 
        className="glass"
        style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)', width: '100%', outline: 'none', border: '1px solid rgba(212, 175, 55, 0.3)' }}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
