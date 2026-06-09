import { useState, useEffect } from "react";

const DiscountModal = ({ discount, onSave, onClose }) => {
  // Local state for the form
  const [formData, setFormData] = useState({
    name: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    code: "",
    maxUsers: "1",
  });
  const [discountMode, setDiscountMode] = useState("auto");

  // If we are editing, fill the form with existing data
  useEffect(() => {
    if (discount) {
      const hasCode = Boolean(discount.code && String(discount.code).trim());
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
        maxUsers:
          discount.maxUsers !== undefined && discount.maxUsers !== null
            ? String(discount.maxUsers)
            : "1",
      });
      setDiscountMode(hasCode ? "code" : "auto");
    } else {
      setDiscountMode("auto");
      setFormData((prev) => ({
        ...prev,
        code: "",
        maxUsers: "1",
      }));
    }
  }, [discount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      code:
        discountMode === "code" ? formData.code.trim() || null : null,
      maxUsers: formData.maxUsers ? parseInt(formData.maxUsers, 10) : 1,
    };
    onSave(dataToSave);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content discount-modal"
      >
        <button
          type="button"
          onClick={onClose}
          className="discount-modal__close"
        >
          ×
        </button>

        <h3 className="discount-modal__title">
          {discount ? "Chỉnh sửa Sự Kiện" : "Tạo Sự Kiện Mới"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên Sự Kiện</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Black Friday"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Phần trăm giảm (%)</label>
            <input
              type="number"
              className="form-control"
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({ ...formData, discountPercent: e.target.value })
              }
              required
              min="1"
              max="100"
            />
          </div>

          <div className="form-group discount-modal__mode-group">
            <label>Kiểu áp dụng</label>
            <div className="discount-modal__mode-options">
              <label className="discount-modal__mode-option">
                <input
                  type="radio"
                  name="discountMode"
                  value="auto"
                  checked={discountMode === "auto"}
                  onChange={() => {
                    setDiscountMode("auto");
                    setFormData((prev) => ({ ...prev, code: "" }));
                  }}
                />
                <span>Áp dụng cho toàn bộ</span>
              </label>
              <label className="discount-modal__mode-option">
                <input
                  type="radio"
                  name="discountMode"
                  value="code"
                  checked={discountMode === "code"}
                  onChange={() => setDiscountMode("code")}
                />
                <span>Tạo code</span>
              </label>
            </div>
          </div>

          {discountMode === "code" && (
            <div className="form-group discount-modal__code-group">
              <label>Mã giảm giá (Code)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tự chọn mã code (VD: CHAOMUNG2026)"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required={discountMode === "code"}
              />
              <small className="discount-modal__hint">
                ℹ️ Mã code phải khớp chính xác (case-sensitive) kể cả chữ hoa, chữ thường. VD: "SUMMER2026" khác "summer2026"
              </small>
            </div>
          )}

          <div className="form-group discount-modal__users-group">
            <label>Số người tối đa được áp dụng</label>
            <input
              type="number"
              className="form-control"
              placeholder="Mặc định: 1"
              value={formData.maxUsers}
              onChange={(e) =>
                setFormData({ ...formData, maxUsers: e.target.value })
              }
              min="1"
            />
          </div>

          <div className="discount-modal__dates">
            <div className="form-group discount-modal__date-field">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                className="form-control"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                className="form-control"
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
