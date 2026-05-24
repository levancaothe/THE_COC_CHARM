import './OrderDetailModal.css';

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { 
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chi Tiết Đơn Hàng #{order._id?.slice(-8)}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="order-detail-content">
          <div className="order-detail-section">
            <h4>📋 Thông Tin Khách Hàng</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Họ tên:</span>
                <span className="detail-value">{order.customerInfo?.name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">{order.customerInfo?.phone || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{order.customerInfo?.email || 'N/A'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Địa chỉ:</span>
                <span className="detail-value">{order.customerInfo?.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="order-detail-section">
            <h4>📦 Thông Tin Đơn Hàng</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Mã đơn:</span>
                <span className="detail-value order-id">{order._id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạng thái:</span>
                <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày đặt:</span>
                <span className="detail-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng tiền:</span>
                <span className="detail-value price">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="order-detail-section">
              <h4>🛍️ Sản Phẩm ({order.items.length})</h4>
              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-card">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="order-item-image" />
                    )}
                    <div className="order-item-info">
                      <h5>{item.name}</h5>
                      <p>Số lượng: <strong>{item.quantity}</strong></p>
                      <p className="item-price">${item.price?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.notes && (
            <div className="order-detail-section">
              <h4>📝 Ghi Chú</h4>
              <p className="order-notes">{order.notes}</p>
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
