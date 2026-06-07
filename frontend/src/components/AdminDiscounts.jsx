import React, { useState } from "react";

const AdminDiscounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="admin-tab-content">
      {/* HEADER & ADD BUTTON */}
      <div
        className="tab-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3>Quản lý Khuyến Mãi</h3>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Thêm Sự Kiện
        </button>
      </div>

      {/* MAIN TABLE */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên Sự Kiện</th>
              <th>Giảm giá</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Chưa có sự kiện nào
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* THE MODAL OVERLAY */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              background: "var(--bg-surface, #fff)",
              position: "relative",
            }}
          >
            {/* Close 'X' Button */}
            <button
              onClick={() => setIsModalOpen(false)}
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

            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
              Tạo Sự Kiện Mới
            </h3>

            {/* The Form */}
            <form style={{ textAlign: "left" }}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Tên Sự Kiện</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Black Friday"
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Phần trăm giảm (%)</label>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </div>

              <div
                style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
              >
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  />
                </div>
              </div>

              {/* ACTION BUTTONS USING YOUR CSS */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="button" className="btn-confirm">
                  Thêm Sự Kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;
