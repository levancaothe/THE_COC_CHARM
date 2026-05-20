import React from 'react';

export const PriceSummary = ({ totalPrice, count }) => {
  return (
    <div className="price-summary glass" style={{ padding: '30px', borderRadius: '24px', textAlign: 'right', minWidth: '250px' }}>
      <p style={{ color: 'var(--text)', opacity: 0.7, marginBottom: '10px', fontSize: '1.1rem', fontWeight: 500 }}>
        Số lượng: <span style={{ color: 'var(--text-h)', fontWeight: '700' }}>{count} hạt</span>
      </p>
      <h2 style={{ color: 'var(--text-h)', fontFamily: 'var(--heading)', margin: 0 }}>
        Tổng cộng: <span style={{ color: 'var(--accent)', fontSize: '2.5rem', display: 'block', marginTop: '5px' }}>${totalPrice.toFixed(2)}</span>
      </h2>
    </div>
  );
};

export const DesignerToolbar = ({ onSave, onAddToCart, onDownload, onClear, disabled }) => {
  return (
    <div className="designer-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <button
        className="btn-premium"
        onClick={onAddToCart}
        style={{ width: '100%', padding: '22px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        disabled={disabled}
      >
        <span>🛒</span> {disabled ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
      </button>
      
      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          className="btn-secondary"
          onClick={onSave}
          style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid var(--primary-gold)', background: 'white', color: 'var(--primary-gold)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          disabled={disabled}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-gold)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--primary-gold)'; }}
        >
          💾 {disabled ? 'Đang lưu...' : 'Lưu thiết kế'}
        </button>
        <button
          className="btn-secondary"
          onClick={onDownload}
          style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid var(--secondary)', background: 'white', color: 'var(--secondary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          disabled={disabled}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--secondary)'; }}
        >
          🖼️ Tải ảnh thiết kế
        </button>
        <button
          className="btn-clear"
          onClick={onClear}
          style={{ padding: '15px 25px', borderRadius: '15px', border: '1px solid #ff4757', background: 'rgba(255, 71, 87, 0.05)', color: '#ff4757', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
          disabled={disabled}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ff4757'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 71, 87, 0.05)'; e.currentTarget.style.color = '#ff4757'; }}
        >
          🗑️ Làm mới
        </button>
      </div>
    </div>
  );
};
