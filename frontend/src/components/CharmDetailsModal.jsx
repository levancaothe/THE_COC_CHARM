import React from 'react';
import './Modal.css';

const CharmDetailsModal = ({ isOpen, onClose, charm }) => {
  if (!isOpen || !charm) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px', position: 'relative' }}>
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '15px', 
            right: '20px', 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem', 
            cursor: 'pointer', 
            color: 'var(--text-color)' 
          }}
        >
          &times;
        </button>
        <img src={charm.image} alt={charm.name} style={{ width: '100%', maxWidth: '250px', height: '250px', borderRadius: 'var(--radius-md)', objectFit: 'cover', marginBottom: '20px', boxShadow: 'var(--shadow-md)' }} />
        <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>{charm.name}</h2>
        <p style={{ color: 'var(--primary-gold)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', currencyDisplay: 'code' }).format(charm.price)}</p>
        <div style={{ width: '100%', textAlign: 'left', marginTop: '10px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ marginBottom: '8px' }}><strong>Danh mục:</strong> {charm.category?.name || 'Không có'}</p>
          <p><strong>Còn lại:</strong> {charm.stock} sản phẩm</p>
        </div>
      </div>
    </div>
  );
};

export default CharmDetailsModal;
