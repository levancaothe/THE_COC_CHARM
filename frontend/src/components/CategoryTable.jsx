import React from 'react';

const CategoryTable = ({ categories, onEdit, onDelete }) => {
  return (
    <div className="table-responsive glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--primary-gold)' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
            <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <td style={{ padding: '12px' }}>{cat.name}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button onClick={() => onEdit(cat)} style={{ color: 'var(--primary-gold)', marginRight: '10px' }}>Edit</button>
                <button onClick={() => onDelete(cat._id)} style={{ color: '#ff4757' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
