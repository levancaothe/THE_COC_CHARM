import React from 'react';

const CharmTable = ({ charms, onEdit, onDelete }) => {
  return (
    <div className="table-responsive glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--primary-gold)' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Image</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Price</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Stock</th>
            <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {charms.map(charm => (
            <tr key={charm._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <td style={{ padding: '12px' }}>
                <img src={charm.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              </td>
              <td style={{ padding: '12px' }}>{charm.name}</td>
              <td style={{ padding: '12px' }}>{charm.category?.name}</td>
              <td style={{ padding: '12px' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', currencyDisplay: 'code' }).format(charm.price)}</td>
              <td style={{ padding: '12px' }}>{charm.stock}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button onClick={() => onEdit(charm)} style={{ color: 'var(--primary-gold)', marginRight: '10px' }}>Edit</button>
                <button onClick={() => onDelete(charm._id)} style={{ color: '#ff4757' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CharmTable;
