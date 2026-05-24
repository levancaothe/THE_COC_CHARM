import { useEffect, useState } from 'react';
import './OrderDetailModal.css';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const formatVND = (value) => `${new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0
}).format(Number(value) || 0)} VND`;

export default function OrderDetailModal({ order, onClose, onUpdateStatus, updatingStatus = false }) {
  if (!order) return null;
  const [status, setStatus] = useState(order.status || 'Pending');

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { 
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
  });

  useEffect(() => {
    setStatus(order.status || 'Pending');
  }, [order]);

  const handleSaveStatus = () => {
    if (status === (order.status || 'Pending')) return;
    onUpdateStatus?.(order._id, status);
  };

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
                <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày đặt:</span>
                <span className="detail-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng tiền:</span>
                <span className="detail-value price">{formatVND(order.totalPrice)}</span>
              </div>
            </div>

            <div className="status-editor">
              <label htmlFor="order-status">Cập nhật trạng thái</label>
              <div className="status-editor-row">
                <select
                  id="order-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveStatus}
                  disabled={updatingStatus || status === (order.status || 'Pending')}
                  type="button"
                >
                  {updatingStatus ? 'Đang lưu...' : 'Lưu trạng thái'}
                </button>
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
                      <p className="item-price">{formatVND(item.price)}</p>
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
