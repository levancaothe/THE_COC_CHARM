import { useState, useEffect } from "react";
import api from "../services/api";

const formatVND = (value) =>
  `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)} VND`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function DiscountUsageModal({ discount, onClose }) {
  const [usageList, setUsageList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const token = localStorage.getItem("adminJwt");
        const response = await api.get(`/discounts/${discount._id}/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsageList(response.data.usage || []);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sử dụng mã giảm giá:", error);
        alert("Không thể tải thông tin sử dụng mã giảm giá.");
      } finally {
        setLoading(false);
      }
    };

    if (discount?._id) {
      fetchUsage();
    }
  }, [discount]);

  if (!discount) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-large"
        style={{
          width: "min(100% - 32px, 1100px)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0 }}>Chi Tiết Sử Dụng Khuyến Mãi</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "var(--admin-muted)" }}>
              Sự kiện: <strong>{discount.name}</strong> 
              {discount.code && (
                <span>
                  {" "}
                  (Mã: <code style={{ fontFamily: "monospace", padding: "2px 6px", background: "rgba(10, 46, 79, 0.08)", borderRadius: "4px", fontWeight: "bold", color: "#0a2e4f" }}>{discount.code}</code>)
                </span>
              )}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--admin-muted)" }}>
              Đang tải danh sách...
            </div>
          ) : usageList.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--admin-muted)",
                background: "var(--admin-panel-soft)",
                borderRadius: "8px",
                border: "1px dashed var(--admin-border)",
              }}
            >
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "12px" }}>🎫</span>
              Chưa có khách hàng nào sử dụng mã giảm giá này cho đơn hàng của họ.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "14px", fontWeight: "bold", fontSize: "0.95rem" }}>
                Tổng cộng có {usageList.length} lượt sử dụng:
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: "50px" }}>STT</th>
                      <th>Khách Hàng</th>
                      <th>Số Điện Thoại</th>
                      <th>Email</th>
                      <th>Địa Chỉ Nhận Hàng</th>
                      <th>Mã Đơn Hàng</th>
                      <th className="text-right">Tổng Tiền</th>
                      <th className="text-right">Đã Giảm</th>
                      <th>Trạng Thái Đơn</th>
                      <th>Ngày Dùng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageList.map((item, idx) => (
                      <tr key={item.orderId || idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td style={{ fontWeight: "600" }}>{item.customerName || "N/A"}</td>
                        <td>{item.customerPhone || "N/A"}</td>
                        <td style={{ fontSize: "0.85rem", color: "var(--admin-muted)" }}>
                          {item.customerEmail || "N/A"}
                        </td>
                        <td style={{ fontSize: "0.85rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.customerAddress}>
                          {item.customerAddress || "N/A"}
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                          {item.orderCode || item.orderId?.slice(-8) || "N/A"}
                        </td>
                        <td className="text-right" style={{ fontWeight: "600" }}>
                          {formatVND(item.totalPrice)}
                        </td>
                        <td className="text-right" style={{ color: "#d95c14", fontWeight: "600" }}>
                          -{formatVND(item.discountAmount)}
                        </td>
                        <td>
                          <span className={`badge badge-${(item.status || "Pending").toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.85rem" }}>{formatDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="modal-actions" style={{ padding: "16px 24px", borderTop: "1px solid var(--admin-border)", background: "#f8fafc", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
