import React from 'react';

export const PriceSummary = ({ totalPrice, count }) => {
  const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} VND`;
  const unitPrice = count > 0 ? Math.round(totalPrice / count) : 0;

  return (
    <div className="designer-summary">
      <div className="designer-summary-grid designer-summary-grid--head">
        <span>Vòng Bạc Khóa Tròn</span>
        <span>Số lượng</span>
        <span>Giá</span>
        <span>Tổng cộng</span>
      </div>
      <div className="designer-summary-grid">
        <span>Vòng cơ bản</span>
        <span>1</span>
        <span>{formatPrice(totalPrice - unitPrice * count)}</span>
        <strong>{formatPrice(totalPrice)}</strong>
      </div>
      <div className="designer-summary-grid">
        <span>Số lượng Charm</span>
        <span>{count}</span>
        <span>{formatPrice(unitPrice)}</span>
        <span />
      </div>
    </div>
  );
};

export const DesignerToolbar = ({ onSave, onAddToCart, onBuyNow, onDownload, onClear, disabled }) => {
  return (
    <div className="designer-toolbar">
      <div className="designer-toolbar-row">
        <button
          className="designer-action designer-action--outline"
          type="button"
          onClick={onDownload}
          disabled={disabled}
        >
          <span>▣</span> Tải ảnh thiết kế
        </button>
        <button
          className="designer-action designer-action--outline"
          type="button"
          onClick={onSave}
          disabled={disabled}
        >
          <span>▣</span> {disabled ? 'Đang lưu...' : 'Lưu thiết kế'}
        </button>
        <button
          className="designer-action designer-action--outline"
          type="button"
          onClick={onClear}
          disabled={disabled}
        >
          <span>♲</span> Làm mới
        </button>
      </div>
      <div className="designer-toolbar-row designer-toolbar-row--actions">
        <button
          className="designer-action designer-action--outline"
          type="button"
          onClick={onBuyNow}
          disabled={disabled}
        >
          <span>→</span> Mua ngay
        </button>
        <button
          className="designer-action designer-action--primary"
          type="button"
          onClick={onAddToCart}
          disabled={disabled}
        >
          {disabled ? 'Đang xử lý...' : 'Lưu vào giỏ hàng'}
        </button>
      </div>
    </div>
  );
};
