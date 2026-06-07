import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminDiscounts() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
  });

  const fetchEvents = async () => {
    try {
      const res = await api.get("/discounts");
      setEvents(res.data);
    } catch (error) {
      console.error("Lỗi tải sự kiện:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/discounts", formData);
      alert("Tạo sự kiện thành công!");
      fetchEvents();
      setFormData({
        name: "",
        discountPercent: "",
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      alert("Lỗi khi tạo sự kiện!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sự kiện này?")) return;
    try {
      await api.delete(`/discounts/${id}`);
      fetchEvents();
    } catch (error) {
      alert("Lỗi khi xóa!");
    }
  };

  return (
    <div>
      <h2>Quản Lý Khuyến Mãi</h2>

      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>Tạo Sự Kiện Mới</h3>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label>Tên Sự Kiện</label> <br />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="VD: Black Friday"
            />
          </div>
          <div>
            <label>Phần trăm giảm (%)</label> <br />
            <input
              type="number"
              required
              min="1"
              max="100"
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({ ...formData, discountPercent: e.target.value })
              }
            />
          </div>
          <div>
            <label>Ngày bắt đầu</label> <br />
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <label>Ngày kết thúc</label> <br />
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Thêm Sự Kiện
          </button>
        </form>
      </div>

      <table
        className="admin-table"
        style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th>Tên Sự Kiện</th>
            <th>Giảm giá</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{event.name}</td>
              <td>{event.discountPercent}%</td>
              <td>{new Date(event.startDate).toLocaleDateString("vi-VN")}</td>
              <td>{new Date(event.endDate).toLocaleDateString("vi-VN")}</td>
              <td>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="btn btn-danger"
                  style={{ padding: "5px 10px" }}
                >
                  🗑️ Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
