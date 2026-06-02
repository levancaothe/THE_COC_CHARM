import React, { useState } from "react";

export default function CollectionModal({ collection, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    image: collection?.image || "",
    price: collection?.price || "",
    description: collection?.description || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{collection ? "Chỉnh Sửa Bộ Sưu Tập" : "Thêm Bộ Sưu Tập Mới"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên Bộ Sưu Tập / Mẫu Vòng *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Bản phối Happy Birthday"
              required
            />
          </div>

          <div className="form-group">
            <label>URL Hình Ảnh *</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://..."
              required
            />
          </div>

          <div className="form-group">
            <label>Giá Bán (VND) *</label>
            <input
              type="number"
              step="1000"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="250000"
              required
            />
          </div>

          <div className="form-group">
            <label>Mô tả ngắn gọn</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ý nghĩa của bản phối này..."
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
