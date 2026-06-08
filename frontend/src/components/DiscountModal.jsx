import React, { useState, useEffect } from "react";

const DiscountModal = ({ discount, onSave, onClose }) => {
  // Local state for the form
  const [formData, setFormData] = useState({
    name: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    code: "",
    maxUsers: "",
  });

  // If we are editing, fill the form with existing data
  useEffect(() => {
    if (discount) {
      setFormData({
        name: discount.name || "",
        discountPercent: discount.discountPercent || "",
        // Dates need to be formatted to YYYY-MM-DD for <input type="date" />
        startDate: discount.startDate
          ? new Date(discount.startDate).toISOString().split("T")[0]
          : "",
        endDate: discount.endDate
          ? new Date(discount.endDate).toISOString().split("T")[0]
          : "",
        code: discount.code || "",
        maxUsers: discount.maxUsers !== undefined && discount.maxUsers !== null ? discount.maxUsers : "",
      });
    }
  }, [discount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      code: formData.code.trim() || null,
      maxUsers: formData.maxUsers ? parseInt(formData.maxUsers, 10) : 1,
    };
    onSave(dataToSave);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          background: "var(--bg-surface, #fff)",
          position: "relative",
          textAlign: "left",
        }}
      >
        {/* Close 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          ×
        </button>

        <h3 style={{ textAlign: "center", marginTop: 0, marginBottom: "20px" }}>
          {discount ? "Chỉnh sửa Sự Kiện" : "Tạo Sự Kiện Mới"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label>Tên Sự Kiện</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Black Friday"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label>Phần trăm giảm (%)</label>
            <input
              type="number"
              className="form-control"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({ ...formData, discountPercent: e.target.value })
              }
              required
              min="1"
              max="100"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label>Mã giảm giá (Code)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Tự chọn mã code (VD: CHAOMUNG2026) - Để trống nếu áp dụng tự động"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
            <small style={{ display: "block", marginTop: "6px", color: "#666", fontStyle: "italic" }}>
              ℹ️ Mã code phải khớp chính xác (case-sensitive) kể cả chữ hoa, chữ thường. VD: "SUMMER2026" khác "summer2026"
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label>Số người tối đa được áp dụng</label>
            <input
              type="number"
              className="form-control"
              placeholder="Để trống nếu không giới hạn"
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              value={formData.maxUsers}
              onChange={(e) =>
                setFormData({ ...formData, maxUsers: e.target.value })
              }
              min="1"
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                className="form-control"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Ngày kết thúc</label>
              <input
                type="date"
                className="form-control"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {discount ? "Cập nhật" : "Thêm Sự Kiện"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal;
