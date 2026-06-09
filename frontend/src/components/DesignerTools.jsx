export const PriceSummary = ({ selectedCharms = [], selectedBaseCharm }) => {
  const formatPrice = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} VND`;

  // 1. Identify which charms are base/default charms
  const baseCharmId = selectedBaseCharm?._id;
  const baseCharms = selectedCharms.filter(
    (c) => c.isDefault || (baseCharmId && c._id === baseCharmId)
  );
  const baseCharmCount = baseCharms.length;
  const baseCharmUnitPrice = selectedBaseCharm?.price || (baseCharms[0]?.price || 0);
  const baseCharmTotal = baseCharmCount * baseCharmUnitPrice;

  // 2. Identify and group custom/theme charms
  const customCharms = selectedCharms.filter(
    (c) => !c.isDefault && !(baseCharmId && c._id === baseCharmId)
  );

  const groupedCustomCharms = customCharms.reduce((acc, charm) => {
    const key = charm._id;
    if (!acc[key]) {
      acc[key] = {
        name: charm.name,
        price: charm.price || 0,
        count: 0,
      };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const customCharmRows = Object.values(groupedCustomCharms);

  // 3. Calculate overall total
  const overallTotal = baseCharmTotal + customCharms.reduce((sum, c) => sum + (c.price || 0), 0);

  return (
    <div className="designer-summary">
      {/* Header Row */}
      <div className="designer-summary-grid designer-summary-grid--head">
        <span>SẢN PHẨM</span>
        <span>SL</span>
        <span>GIÁ</span>
        <span style={{ textAlign: 'right' }}>TỔNG</span>
      </div>

      {/* Base Charm Row */}
      {baseCharmCount > 0 && (
        <div className="designer-summary-grid">
          <span>{selectedBaseCharm?.name || "Trơn Bạc (Charm gốc)"}</span>
          <span>{baseCharmCount}</span>
          <span>{formatPrice(baseCharmUnitPrice)}</span>
          <strong style={{ fontSize: '0.92rem', fontWeight: 'bold' }}>{formatPrice(baseCharmTotal)}</strong>
        </div>
      )}

      {/* Custom Charm Rows */}
      {customCharmRows.map((item, idx) => (
        <div className="designer-summary-grid" key={idx}>
          <span>{item.name}</span>
          <span>{item.count}</span>
          <span>{formatPrice(item.price)}</span>
          <strong style={{ fontSize: '0.92rem', fontWeight: 'bold' }}>{formatPrice(item.count * item.price)}</strong>
        </div>
      ))}

      {/* Total Row */}
      <div 
        className="designer-summary-grid" 
        style={{ 
          borderTop: '2.5px solid #0a2e4f', 
          marginTop: '14px', 
          paddingTop: '14px',
          fontWeight: 'bold'
        }}
      >
        <span style={{ textTransform: 'uppercase', fontSize: '0.92rem', fontWeight: 900 }}>TỔNG CỘNG</span>
        <span />
        <span />
        <strong style={{ fontSize: '1.15rem', color: '#d95c14', textAlign: 'right' }}>{formatPrice(overallTotal)}</strong>
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
          {disabled ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}
        </button>
      </div>
    </div>
  );
};
