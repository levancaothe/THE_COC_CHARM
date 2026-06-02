import { useState } from "react";
import "./OrderDetailModal.css";

const STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const formatVND = (value) =>
  `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)} VND`;

export default function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  updatingStatus = false,
}) {
  // This state is just for the Order Status dropdown editor
  const [status, setStatus] = useState(() => order?.status || "Pending");

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!order) return null;

  const formatItemTitle = (item) => {
    if (item.productType === "BraceletDesign") {
      return item.productDetail?.name || "Vòng tay thiết kế";
    }
    return item.productDetail?.name || item.name || "Hạt Charm lẻ";
  };

  const handleSaveStatus = () => {
    if (status === (order.status || "Pending")) return;
    onUpdateStatus?.(order._id, status);
  };

  const renderBraceletPreview = (item, idx) => {
    const snapshotCharms = Array.isArray(item.designCharmDetails)
      ? item.designCharmDetails
      : [];
    const fallbackCharms = Array.isArray(item.productDetail?.charms)
      ? item.productDetail.charms.map((entry) => entry?.charm).filter(Boolean)
      : [];
    const charms =
      snapshotCharms.length > 0
        ? snapshotCharms
        : item.charmDetails && item.charmDetails.length > 0
          ? item.charmDetails
          : fallbackCharms;
    return (
      <div className="order-bracelet-preview">
        <div
          className="order-bracelet-strip"
          role="list"
          aria-label="Danh sách charm trong vòng"
        >
          {charms.map((charm, charmIndex) => (
            <div
              key={`${idx}-${charm?._id || charmIndex}`}
              className="order-bracelet-chip"
              role="listitem"
              title={charm?.name || "Charm đã bị xóa"}
            >
              {charm?.image ? (
                <img
                  src={charm.image}
                  alt={charm.name || "Charm"}
                  className="order-bracelet-chip__image"
                />
              ) : (
                <span className="order-bracelet-chip__image order-bracelet-chip__image--empty">
                  ?
                </span>
              )}
              <span className="order-bracelet-chip__name">
                {charm?.name || "Charm đã bị xóa"}
              </span>
            </div>
          ))}
        </div>
        <div className="order-bracelet-summary">
          <strong>{item.productDetail?.name || "Vòng tay thiết kế"}</strong>
          <span>{charms.length || 0} hạt charm</span>
        </div>
      </div>
    );
  };

  // 🟢 Extract the payment status safely
  const paymentStatus = order.paymentInfo?.status || "Unpaid";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Chi Tiết Đơn Hàng #{order._id?.slice(-8)}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="order-detail-content">
          <div className="order-detail-section">
            <h4>📋 Thông Tin Khách Hàng</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Họ tên:</span>
                <span className="detail-value">
                  {order.customerInfo?.name || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số điện thoại:</span>
                <span className="detail-value">
                  {order.customerInfo?.phone || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">
                  {order.customerInfo?.email || "N/A"}
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Địa chỉ:</span>
                <span className="detail-value">
                  {order.customerInfo?.address || "N/A"}
                </span>
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
              {/* 🟢 CHANGED: Now displays Payment Status instead of general Order Status */}
              <div className="detail-item">
                <span className="detail-label">TT Thanh toán:</span>
                <span className={`badge badge-${paymentStatus.toLowerCase()}`}>
                  {paymentStatus}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày đặt:</span>
                <span className="detail-value">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng tiền:</span>
                <span className="detail-value price">
                  {formatVND(order.totalPrice)}
                </span>
              </div>
            </div>

            <div className="status-editor">
              <label htmlFor="order-status">Cập nhật trạng thái đơn hàng</label>
              <div className="status-editor-row">
                <select
                  id="order-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveStatus}
                  disabled={
                    updatingStatus || status === (order.status || "Pending")
                  }
                  type="button"
                >
                  {updatingStatus ? "Đang lưu..." : "Lưu trạng thái"}
                </button>
              </div>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="order-detail-section">
              <h4>🛍️ Sản Phẩm ({order.items.length})</h4>
              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`order-item-card ${item.productType === "BraceletDesign" ? "order-item-card--design" : ""}`}
                  >
                    <div
                      className={`order-item-media ${item.productType === "BraceletDesign" ? "order-item-media--design" : ""}`}
                    >
                      {item.productType === "BraceletDesign" &&
                      (item.designCharmDetails?.length ||
                        item.charmDetails?.length ||
                        item.productDetail?.charms?.length) ? (
                        renderBraceletPreview(item, idx)
                      ) : item.productDetail?.image ? (
                        <img
                          src={item.productDetail.image}
                          alt={item.productDetail?.name || item.name || "Charm"}
                          className="order-item-image"
                        />
                      ) : item.image ? (
                        <img
                          src={item.image}
                          alt={item.name || "Item"}
                          className="order-item-image"
                        />
                      ) : (
                        <div className="order-item-image order-item-image--empty">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="order-item-info">
                      <div className="order-item-head">
                        <h5>{formatItemTitle(item)}</h5>
                        <span
                          className={`item-type-badge ${item.productType === "BraceletDesign" ? "item-type-badge--design" : "item-type-badge--charm"}`}
                        >
                          {item.productType === "BraceletDesign"
                            ? "Thiết kế"
                            : "Charm"}
                        </span>
                      </div>
                      <p>
                        Số lượng: <strong>{item.quantity}</strong>
                      </p>
                      <p className="item-price">{formatVND(item.price)}</p>
                      {item.productType === "Charm" && item.productDetail && (
                        <div className="order-item-meta">
                          <span>
                            Danh mục:{" "}
                            {item.productDetail.category?.name || "N/A"}
                          </span>
                          <span>
                            Tồn kho: {item.productDetail.stock ?? "N/A"}
                          </span>
                        </div>
                      )}
                      {item.productType === "BraceletDesign" && (
                        <p className="order-design-summary">
                          Vòng tay được ghép từ{" "}
                          {item.designCharmDetails &&
                          item.designCharmDetails.length > 0
                            ? item.designCharmDetails.length
                            : item.charmDetails && item.charmDetails.length > 0
                              ? item.charmDetails.length
                              : Array.isArray(item.productDetail?.charms)
                                ? item.productDetail.charms.filter(
                                    (entry) => entry?.charm,
                                  ).length
                                : 0}{" "}
                          hạt charm
                        </p>
                      )}
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
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
