import { useEffect, useState, useCallback } from "react";
import OrderDetailModal from "../components/OrderDetailModal";
import CollectionModal from "../components/CollectionModal";
import api from "../services/api";
import "./AdminDashboard.css";
import "./MyDesignsPage.css";
import DiscountModal from "../components/DiscountModal";
import DiscountUsageModal from "../components/DiscountUsageModal";
import CollectionCharmPreview from "../components/CollectionCharmPreview";
import { isPendantCharm } from "../utils/imageProxy";
const formatVND = (value) =>
  `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)} VND`;

const ORDER_STATUS_MAP = {
  Pending: "Chờ xử lý",
  Processing: "Đang xử lý",
  Shipped: "Đang giao hàng",
  Delivered: "Đã giao hàng",
  Cancelled: "Đã hủy",
};

function StatCard({ title, value, icon, tone }) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div
        className={`stat-content ${tone === "dark" ? "stat-content-revenue" : ""}`}
      >
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function CharmModal({ charm, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: charm?.name || "",
    image: charm?.image || "",
    price: charm?.price || "",
    stock: charm?.stock || 0,
    category: charm?.category?._id || charm?.category || "",
    isPendant: charm?.isPendant || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{charm ? "Chỉnh Sửa Charm" : "Thêm Charm Mới"}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên Charm *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>URL Hình Ảnh *</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Giá (VND) *</label>
            <input
              type="number"
              step="1000"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Số Lượng</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Danh Mục *</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group form-group--toggle">
            <label className="toggle-checkbox">
              <input
                type="checkbox"
                checked={Boolean(formData.isPendant)}
                onChange={(e) =>
                  setFormData({ ...formData, isPendant: e.target.checked })
                }
              />
              <span>Charm rơi / charm đặc biệt</span>
            </label>
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

function CategoryModal({ category, onSave, onClose }) {
  const [name, setName] = useState(category?.name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-small"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{category ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên Danh Mục *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem("adminJwt") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    limit: 10,
    page: 1,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Charms state
  const [charms, setCharms] = useState([]);
  const [totalCharms, setTotalCharms] = useState(0);
  const [charmFilters, setCharmFilters] = useState({
    search: "",
    limit: 50,
    page: 1,
  });
  const [editingCharm, setEditingCharm] = useState(null);
  const [showCharmModal, setShowCharmModal] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoryFilters, setCategoryFilters] = useState({ limit: 8, page: 1 });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Collections state
  const [collections, setCollections] = useState([]);
  const [totalCollections, setTotalCollections] = useState(0);
  const [collectionFilters, setCollectionFilters] = useState({
    search: "",
    limit: 10,
    page: 1,
  });
  const [editingCollection, setEditingCollection] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const [discounts, setDiscounts] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [selectedDiscountForUsage, setSelectedDiscountForUsage] = useState(null);
  const [showDiscountUsageModal, setShowDiscountUsageModal] = useState(false);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function logout() {
    localStorage.removeItem("adminJwt");
    localStorage.removeItem("adminRole");
    setToken("");
  }

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await api.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch stats");
      logout();
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders(page = 1) {
    setLoading(true);
    try {
      const params = { ...filters, page };
      const res = await api.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setOrders(res.data.orders || []);
      setTotalOrders(res.data.total || 0);
      setFilters((prev) => ({ ...prev, page }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCharms(page = 1, nextFilters = charmFilters) {
    setLoading(true);
    try {
      const params = { ...nextFilters, page };
      const res = await api.get("/admin/charms", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setCharms(res.data.charms || []);
      setTotalCharms(res.data.total || 0);
      setCharmFilters((prev) => ({ ...prev, ...nextFilters, page }));
    } catch (err) {
      console.error("Error fetching charms:", err);
      alert(err.response?.data?.message || "Failed to fetch charms");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await api.get("/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      alert(err.response?.data?.message || "Failed to fetch categories");
    }
  }

  async function fetchDiscounts() {
    setLoading(true);
    try {
      const res = await api.get("/discounts");
      setDiscounts(res.data || []);
    } catch (err) {
      console.error("Error fetching discounts:", err);
      alert(err.response?.data?.message || "Failed to fetch discounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchCategories();
    }
  }, [token]);

  useEffect(() => {
    if (token && activeTab === "orders") fetchOrders(1);
    if (token && activeTab === "charms") fetchCharms(1);
    if (token && activeTab === "collections") fetchCollections();
    if (token && activeTab === "discounts") fetchDiscounts();
  }, [activeTab, token]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }
    try {
      const res = await api.post("/admin/login", { username, password });
      const t = res.data.token;
      localStorage.setItem("adminJwt", t);
      localStorage.setItem("adminRole", res.data.role || "admin");
      setToken(t);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleSaveCharm = async (formData) => {
    try {
      if (editingCharm) {
        await api.put(`/admin/charms/${editingCharm._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Charm đã được cập nhật");
      } else {
        await api.post("/admin/charms", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Charm đã được thêm");
      }
      setShowCharmModal(false);
      setEditingCharm(null);
      fetchCharms(charmFilters.page);
      fetchStats();
    } catch (err) {
      console.error("Error saving charm:", err);
      alert(err.response?.data?.message || "Failed to save charm");
    }
  };

  const handleDeleteCharm = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa charm này?")) return;
    try {
      await api.delete(`/admin/charms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Charm đã được xóa");
      fetchCharms(charmFilters.page);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete charm");
    }
  };

  const handleCharmSearchChange = (e) => {
    const nextFilters = { ...charmFilters, search: e.target.value };
    setCharmFilters(nextFilters);
    fetchCharms(1, nextFilters);
  };

  const handleCharmLimitChange = (e) => {
    const nextFilters = {
      ...charmFilters,
      limit: Math.max(1, parseInt(e.target.value, 10) || 10),
    };
    setCharmFilters(nextFilters);
    fetchCharms(1, nextFilters);
  };

  const handleCategoryLimitChange = (e) => {
    const limit = Math.max(1, parseInt(e.target.value, 10) || 8);
    setCategoryFilters({ limit, page: 1 });
  };

  const handleSaveCategory = async (formData) => {
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Danh mục đã được cập nhật");
      } else {
        await api.post("/admin/categories", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Danh mục đã được thêm");
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      fetchCategories();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Danh mục đã được xóa");
      fetchCategories();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  const handleExportExcel = async () => {
    if (orders.length === 0) {
      alert("Không có dữ liệu để export");
      return;
    }

    try {
      const XLSX = await import("xlsx");

      const excelData = orders.map((order, idx) => ({
        STT: (filters.page - 1) * filters.limit + idx + 1,
        "Mã đơn hàng": order._id,
        "Khách hàng": order.customerInfo?.name || "N/A",
        "Số điện thoại": order.customerInfo?.phone || "N/A",
        Email: order.customerInfo?.email || "N/A",
        "Địa chỉ": order.customerInfo?.address || "N/A",
        "Tổng tiền (VND)": formatVND(order.totalPrice),
        "Trạng thái": ORDER_STATUS_MAP[order.status] || order.status || "Chờ xử lý",
        "Ngày đặt": new Date(order.createdAt).toLocaleString("vi-VN"),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      ws["!cols"] = [
        { wch: 5 }, // STT
        { wch: 25 }, // Mã đơn hàng
        { wch: 20 }, // Khách hàng
        { wch: 15 }, // SĐT
        { wch: 25 }, // Email
        { wch: 30 }, // Địa chỉ
        { wch: 12 }, // Tổng tiền
        { wch: 12 }, // Trạng thái
        { wch: 20 }, // Ngày đặt
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Đơn hàng");

      const filename = `DonHang_${new Date().toISOString().split("T")[0]}.xlsx`;

      XLSX.writeFile(wb, filename);
      alert(`Đã export ${orders.length} đơn hàng ra file ${filename}`);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Lỗi khi export Excel. Vui lòng cài đặt: npm install xlsx");
    }
  };

  const handleViewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    if (!orderId || !status) return;

    setUpdatingOrderStatus(true);
    try {
      const res = await api.put(
        `/admin/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const updatedOrder = res.data.order;
      setSelectedOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updatedOrder : order)),
      );
      alert("Đã cập nhật trạng thái đơn hàng");
    } catch (err) {
      alert(
        err.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng",
      );
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  // --- DISCOUNT MANAGEMENT HANDLERS ---

  // Handle Saving (Both Create and Update)
  const handleSaveDiscount = async (discountData) => {
    try {
      if (editingDiscount) {
        // 1. UPDATE EXISTING DISCOUNT IN DATABASE
        await api.put(`/discounts/${editingDiscount._id}`, discountData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update local state so UI changes instantly
        setDiscounts(
          discounts.map((d) =>
            d._id === editingDiscount._id ? { ...d, ...discountData } : d,
          ),
        );
      } else {
        // 2. CREATE NEW DISCOUNT IN DATABASE
        const response = await api.post("/discounts", discountData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Get the real data (with the real MongoDB _id) from the backend response
        // Note: adjust 'response.data.data' based on exactly how your backend formats the response
        const newDiscount =
          response.data.data || response.data.discount || response.data;

        setDiscounts([...discounts, newDiscount]);
      }

      // Close modal and clear editing state
      setShowDiscountModal(false);
      setEditingDiscount(null);
    } catch (error) {
      console.error("Lỗi khi lưu khuyến mãi (Error saving discount):", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu sự kiện!");
    }
  };

  // Handle Deleting
  const handleDeleteDiscount = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        // 3. DELETE DISCOUNT FROM DATABASE
        await api.delete(`/discounts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove from local state
        setDiscounts(discounts.filter((d) => d._id !== id));
      } catch (error) {
        console.error(
          "Lỗi khi xóa khuyến mãi (Error deleting discount):",
          error,
        );
        alert("Lỗi khi xóa sự kiện!");
      }
    }
  };

  // --- COLLECTION FUNCTIONS ---

  // 1. Fetch Collections from Backend
  const fetchCollections = async () => {
    try {
      // Assuming your api prefix handles the /api part
      const response = await api.get("/collections");
      setCollections(response.data.collections || []);
      setTotalCollections(response.data.total || 0);
    } catch (error) {
      console.error("Lỗi khi tải bộ sưu tập:", error);
    }
  };

  // 2. Create or Update Collection
  const handleSaveCollection = async (collectionData) => {
    try {
      if (editingCollection && editingCollection._id) {
        // UPDATE (PUT request)
        await api.put(`/collections/${editingCollection._id}`, collectionData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Cập nhật thành công!");
      } else {
        // CREATE (POST request)
        await api.post("/collections", collectionData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Thêm mới thành công!");
      }
      setShowCollectionModal(false);
      setEditingCollection(null);
      fetchCollections(); // Refresh the table
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert("Có lỗi xảy ra khi lưu dữ liệu!");
    }
  };

  // 3. Delete Collection
  const handleDeleteCollection = async (id) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa bộ sưu tập này không? Hành động này không thể hoàn tác.",
      )
    ) {
      try {
        await api.delete(`/collections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Đã xóa thành công!");
        fetchCollections(); // Refresh the table
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Có lỗi xảy ra khi xóa!");
      }
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const charmTotalPages = Math.max(
    1,
    Math.ceil(totalCharms / charmFilters.limit),
  );
  const categoryTotalPages = Math.max(
    1,
    Math.ceil(categories.length / categoryFilters.limit),
  );
  const categoryCurrentPage = Math.min(
    categoryFilters.page,
    categoryTotalPages,
  );
  const charmRangeStart = totalCharms
    ? (charmFilters.page - 1) * charmFilters.limit + 1
    : 0;
  const categoryRangeStart = categories.length
    ? (categoryCurrentPage - 1) * categoryFilters.limit + 1
    : 0;
  const categoryPageItems = categories.slice(
    (categoryCurrentPage - 1) * categoryFilters.limit,
    categoryCurrentPage * categoryFilters.limit,
  );

  if (!token) {
    return (
      <div className="admin-login-page">
        <div className="login-container">
          <div className="login-box">
            <div className="login-brand">
              <span className="login-mark">CC</span>
              <div>
                <h1>Admin Dashboard</h1>
                <p className="login-subtitle">Quản lý cửa hàng The Coc Charm</p>
              </div>
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Nhập tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <button className="btn btn-primary btn-login" onClick={handleLogin}>
              Đăng Nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  const orderTotalPages = Math.max(1, Math.ceil(totalOrders / filters.limit));

  return (
    <div className="admin-dashboard-page">
      <header className="admin-header">
        <div className="header-content">
          <div>
            <p className="admin-eyebrow">The Coc Charm</p>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="header-actions">
            <span className="admin-status">Đang hoạt động</span>
            <button className="btn btn-danger" onClick={logout}>
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-hero">
          <div>
            <p className="admin-eyebrow">Tổng quan vận hành</p>
            <h2>Quản lý đơn hàng, charms và danh mục</h2>
          </div>
          <button
            className="btn btn-primary"
            onClick={fetchStats}
            disabled={loading}
          >
            Làm mới dữ liệu
          </button>
        </section>

        <section className="stats-section">
          <div className="section-heading">
            <h2>Thống Kê Chung</h2>
            <span>{loading ? "Đang đồng bộ..." : "Dữ liệu mới nhất"}</span>
          </div>
          <div className="stats-grid">
            <StatCard
              title="Charms"
              value={stats?.charmsCount ?? "..."}
              icon="◇"
              tone="blue"
            />
            <StatCard
              title="Danh Mục"
              value={stats?.categoriesCount ?? "..."}
              icon="▦"
              tone="amber"
            />
            <StatCard
              title="Thiết Kế"
              value={stats?.designsCount ?? "..."}
              icon="✦"
              tone="pink"
            />
            <StatCard
              title="Đơn Hàng"
              value={stats?.ordersCount ?? "..."}
              icon="▣"
              tone="green"
            />
            <StatCard
              title="Doanh Thu"
              value={stats ? formatVND(stats.totalRevenue) : "..."}
              icon="VND"
              tone="dark"
            />
          </div>
        </section>

        <section className="tabs-section">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <span>Đơn Hàng</span>
              <strong>{totalOrders}</strong>
            </button>
            <button
              className={`tab-btn ${activeTab === "charms" ? "active" : ""}`}
              onClick={() => setActiveTab("charms")}
            >
              <span>Charms</span>
              <strong>{totalCharms || stats?.charmsCount || 0}</strong>
            </button>
            <button
              className={`tab-btn ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              <span>Danh Mục</span>
              <strong>{categories.length}</strong>
            </button>
            <button
              className={`tab-btn ${activeTab === "collections" ? "active" : ""}`}
              onClick={() => setActiveTab("collections")}
            >
              <span>Bộ Sưu Tập</span>
              <strong>{totalCollections || stats?.designsCount || 0}</strong>
            </button>
            <button
              className={`tab-btn ${activeTab === "discounts" ? "active" : ""}`}
              onClick={() => setActiveTab("discounts")}
            >
              <span>Khuyến Mãi</span>
              <strong>%</strong>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "orders" && (
              <div className="orders-tab">
                <div className="content-title">
                  <div>
                    <h3>Danh sách đơn hàng</h3>
                    <p>Lọc và theo dõi đơn hàng theo trạng thái, thời gian.</p>
                  </div>
                  <button
                    className="btn btn-success btn-export"
                    onClick={handleExportExcel}
                    disabled={loading || orders.length === 0}
                  >
                    Export to Excel
                  </button>
                </div>
                <div className="filters-container">
                  <div className="filter-group">
                    <label>Trạng Thái</label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <option value="">Tất Cả</option>
                      <option value="Pending">Chờ xử lý</option>
                      <option value="Processing">Đang xử lý</option>
                      <option value="Shipped">Đang giao hàng</option>
                      <option value="Delivered">Đã giao hàng</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Từ Ngày</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters({ ...filters, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="filter-group">
                    <label>Đến Ngày</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters({ ...filters, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="filter-group">
                    <label>Số Hàng/Trang</label>
                    <input
                      type="number"
                      value={filters.limit}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          limit: Math.max(1, parseInt(e.target.value, 10)),
                        })
                      }
                      min="1"
                      max="100"
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-apply"
                    onClick={() => fetchOrders(1)}
                  >
                    Áp Dụng
                  </button>
                </div>

                {loading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Khách Hàng</th>
                            <th>Số Điện Thoại</th>
                            <th>Tổng Tiền</th>
                            <th>Trạng Thái</th>
                            <th>Ngày</th>
                            <th>Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length > 0 ? (
                            orders.map((order, idx) => {
                              const orderStatus = order.status || "Pending";
                              const normalizedStatus =
                                orderStatus.toLowerCase();

                              return (
                                <tr
                                  key={order._id}
                                  className={`status-${normalizedStatus}`}
                                >
                                  <td className="text-center">
                                    {(filters.page - 1) * filters.limit +
                                      idx +
                                      1}
                                  </td>
                                  <td>{order.customerInfo?.name || "N/A"}</td>
                                  <td>{order.customerInfo?.phone || "N/A"}</td>
                                  <td className="text-right">
                                    {formatVND(order.totalPrice)}
                                  </td>
                                  <td>
                                    <span
                                      className={`badge badge-${normalizedStatus}`}
                                    >
                                      {ORDER_STATUS_MAP[orderStatus] || orderStatus}
                                    </span>
                                  </td>
                                  <td>{formatDate(order.createdAt)}</td>
                                  <td className="actions-cell">
                                    <button
                                      className="btn-icon btn-view"
                                      onClick={() =>
                                        handleViewOrderDetail(order)
                                      }
                                      title="Xem chi tiết"
                                    >
                                      👁
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center">
                                Không có đơn hàng nào
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="pagination">
                      <button
                        className="btn btn-small"
                        disabled={filters.page === 1}
                        onClick={() => fetchOrders(filters.page - 1)}
                      >
                        ← Trước
                      </button>
                      <span className="page-info">
                        Trang {filters.page} / {orderTotalPages}
                      </span>
                      <button
                        className="btn btn-small"
                        disabled={filters.page >= orderTotalPages}
                        onClick={() => fetchOrders(filters.page + 1)}
                      >
                        Tiếp →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "charms" && (
              <div className="charms-tab">
                <div className="tab-actions">
                  <div>
                    <h3>Kho charms</h3>
                    <p>Quản lý thông tin, giá và tồn kho từng charm.</p>
                  </div>
                  <div className="toolbar-inline">
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="Tìm kiếm charm..."
                        value={charmFilters.search}
                        onChange={handleCharmSearchChange}
                      />
                    </div>
                    <div className="filter-group compact">
                      <label>Số Hàng/Trang</label>
                      <select
                        value={charmFilters.limit}
                        onChange={handleCharmLimitChange}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setEditingCharm(null);
                      setShowCharmModal(true);
                    }}
                  >
                    + Thêm Charm
                  </button>
                </div>

                {loading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Hình</th>
                            <th>Tên</th>
                            <th>Danh Mục</th>
                            <th>Giá</th>
                            <th>Tồn Kho</th>
                            <th>Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {charms.length > 0 ? (
                            charms.map((charm, idx) => (
                              <tr key={charm._id}>
                                <td className="text-center">
                                  {(charmFilters.page - 1) *
                                    charmFilters.limit +
                                    idx +
                                    1}
                                </td>
                                <td>
                                  <img
                                    src={charm.image}
                                    alt={charm.name}
                                    className={`charm-thumb ${isPendantCharm(charm) ? "charm-thumb--pendant" : ""}`}
                                  />
                                </td>
                                <td>{charm.name}</td>
                                <td>{charm.category?.name || "N/A"}</td>
                                <td className="text-right">
                                  {formatVND(charm.price)}
                                </td>
                                <td className="text-center">{charm.stock}</td>
                                <td className="actions-cell">
                                  <button
                                    className="btn-icon btn-edit"
                                    onClick={() => {
                                      setEditingCharm(charm);
                                      setShowCharmModal(true);
                                    }}
                                    title="Chỉnh sửa"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDeleteCharm(col._id)}
                                    title="Xóa"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center">
                                Không có charm nào
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-footer">
                      <span>
                        Hiển thị {charmRangeStart}-
                        {Math.min(
                          charmFilters.page * charmFilters.limit,
                          totalCharms,
                        )}{" "}
                        / {totalCharms} charm
                      </span>
                      <span>{charmFilters.limit} hàng/trang</span>
                    </div>
                    <div className="pagination">
                      <button
                        className="btn btn-small"
                        disabled={charmFilters.page === 1}
                        onClick={() => fetchCharms(charmFilters.page - 1)}
                      >
                        ← Trước
                      </button>
                      <span className="page-info">
                        Trang {charmFilters.page} / {charmTotalPages}
                      </span>
                      <button
                        className="btn btn-small"
                        disabled={charmFilters.page >= charmTotalPages}
                        onClick={() => fetchCharms(charmFilters.page + 1)}
                      >
                        Tiếp →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "categories" && (
              <div className="categories-tab">
                <div className="tab-actions">
                  <div>
                    <h3>Quản Lý Danh Mục</h3>
                    <p>Sắp xếp nhóm charm hiển thị trong cửa hàng.</p>
                  </div>
                  <div className="toolbar-inline">
                    <div className="filter-group compact">
                      <label>Số Hàng/Trang</label>
                      <select
                        value={categoryFilters.limit}
                        onChange={handleCategoryLimitChange}
                      >
                        <option value={4}>4</option>
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        setEditingCategory(null);
                        setShowCategoryModal(true);
                      }}
                    >
                      + Thêm Danh Mục
                    </button>
                  </div>
                </div>

                <div className="categories-grid">
                  {categoryPageItems.map((cat) => (
                    <div key={cat._id} className="category-card">
                      <div className="category-info">
                        <h4>{cat.name}</h4>
                        <p className="category-id">ID: {cat._id}</p>
                      </div>
                      <div className="category-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => {
                            setEditingCategory(cat);
                            setShowCategoryModal(true);
                          }}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteCategory(cat._id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="table-footer">
                  <span>
                    Hiển thị {categoryRangeStart}-
                    {Math.min(
                      categoryCurrentPage * categoryFilters.limit,
                      categories.length,
                    )}{" "}
                    / {categories.length} danh mục
                  </span>
                  <span>{categoryFilters.limit} hàng/trang</span>
                </div>
                <div className="pagination">
                  <button
                    className="btn btn-small"
                    disabled={categoryCurrentPage === 1}
                    onClick={() =>
                      setCategoryFilters((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                  >
                    ← Trước
                  </button>
                  <span className="page-info">
                    Trang {categoryCurrentPage} / {categoryTotalPages || 1}
                  </span>
                  <button
                    className="btn btn-small"
                    disabled={categoryCurrentPage >= categoryTotalPages}
                    onClick={() =>
                      setCategoryFilters((prev) => ({
                        ...prev,
                        page: Math.min(categoryTotalPages, prev.page + 1),
                      }))
                    }
                  >
                    Tiếp →
                  </button>
                </div>
              </div>
            )}
            {activeTab === "collections" && (
              <div className="collections-tab">
                <div className="tab-actions">
                  <div>
                    <h3>Quản lý Bộ Sưu Tập</h3>
                    <p>
                      Các mẫu vòng tay thiết kế sẵn dành cho khách hàng mua
                      nhanh.
                    </p>
                  </div>
                  <div className="toolbar-inline">
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="Tìm kiếm mẫu vòng..."
                        value={collectionFilters.search}
                        onChange={(e) =>
                          setCollectionFilters({
                            ...collectionFilters,
                            search: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setEditingCollection(null);
                      setShowCollectionModal(true);
                    }}
                  >
                    + Thêm Mẫu Mới
                  </button>
                </div>

                {loading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <>
                    <div className="my-designs-grid" style={{ marginTop: "20px" }}>
                      {collections.map((col, idx) => {
                        return (
                        <article key={col._id || idx} className="my-design-card">
                          <div className="my-design-card__head">
                            <div>
                              <h2>{col.name}</h2>
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "var(--admin-muted)",
                                  margin: "4px 0 0",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {col.description || "Không có mô tả"}
                              </p>
                            </div>
                            <span>{col.charms?.length || 0} hạt</span>
                          </div>

                          <CollectionCharmPreview charms={col.charms || []} ariaLabel={`Preview ${col.name}`} />

                          <div className="my-design-card__foot">
                            <strong style={{ color: "#d95c14", fontSize: "1.15rem" }}>
                              {formatVND(col.price)}
                            </strong>
                            <div className="my-design-actions">
                              <button
                                className="my-design-edit"
                                type="button"
                                onClick={() => {
                                  setEditingCollection(col);
                                  setShowCollectionModal(true);
                                }}
                              >
                                Sửa mẫu
                              </button>
                              <button
                                className="my-design-delete"
                                type="button"
                                onClick={() => handleDeleteCollection(col._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </article>
                        );
                      })}
                    </div>

                    {collections.length === 0 && (
                      <div className="my-design-empty">
                        <p>Chưa có bộ sưu tập nào. Hãy thêm mẫu mới!</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {activeTab === "discounts" && (
              <div className="discounts-tab">
                <div className="tab-actions">
                  <div>
                    <h3>Quản lý Khuyến Mãi</h3>
                    <p>
                      Cài đặt các sự kiện giảm giá toàn trang theo phần trăm.
                    </p>
                  </div>
                  {/* Assuming you don't need a search bar for discounts right now, just the add button */}
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setEditingDiscount(null);
                      setShowDiscountModal(true);
                    }}
                  >
                    + Thêm Sự Kiện
                  </button>
                </div>

                {loading ? (
                  <div className="loading">Đang tải...</div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="data-table admin-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Tên Sự Kiện</th>
                            <th>Mã Code</th>
                            <th>Giảm giá (%)</th>
                            <th>Bắt đầu</th>
                            <th>Kết thúc</th>
                            <th>Lượt áp dụng (Đã dùng / Tối đa)</th>
                            <th>Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {discounts && discounts.length > 0 ? (
                            discounts.map((discount, idx) => (
                              <tr key={discount._id || idx}>
                                <td className="text-center">{idx + 1}</td>
                                <td>
                                  <strong>{discount.name}</strong>
                                </td>
                                <td>
                                  {discount.code ? (
                                    <span style={{ fontFamily: "monospace", padding: "2px 6px", background: "rgba(10, 46, 79, 0.08)", borderRadius: "4px", fontWeight: "bold", color: "#0a2e4f" }}>
                                      {discount.code}
                                    </span>
                                  ) : (
                                    <em style={{ color: "#86868b" }}>Tự động</em>
                                  )}
                                </td>
                                <td>{discount.discountPercent}%</td>
                                {/* Formatting dates nicely for display */}
                                <td>
                                  {new Date(
                                    discount.startDate,
                                  ).toLocaleDateString("vi-VN")}
                                </td>
                                <td>
                                  {new Date(
                                    discount.endDate,
                                  ).toLocaleDateString("vi-VN")}
                                </td>
                                <td>
                                  {discount.maxUsers !== undefined && discount.maxUsers !== null ? (
                                    <span>
                                      {discount.usedUsers || 0} / {discount.maxUsers}
                                    </span>
                                  ) : (
                                    <span style={{ color: "#2a9d8f", fontWeight: "600" }}>Không giới hạn</span>
                                  )}
                                </td>
                                <td className="actions-cell" style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                                  <button
                                    className="btn-icon btn-view"
                                    onClick={() => {
                                      setSelectedDiscountForUsage(discount);
                                      setShowDiscountUsageModal(true);
                                    }}
                                    title="Xem chi tiết người sử dụng"
                                  >
                                    👁️
                                  </button>
                                  <button
                                    className="btn-icon btn-edit"
                                    onClick={() => {
                                      setEditingDiscount(discount);
                                      setShowDiscountModal(true);
                                    }}
                                    title="Chỉnh sửa"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn-icon btn-delete"
                                    onClick={() =>
                                      handleDeleteDiscount(discount._id)
                                    }
                                    title="Xóa"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center">
                                Chưa có sự kiện nào. Hãy thêm sự kiện mới!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
        >
          ↑
        </button>
      )}

      {showCharmModal && (
        <CharmModal
          charm={editingCharm}
          categories={categories}
          onSave={handleSaveCharm}
          onClose={() => {
            setShowCharmModal(false);
            setEditingCharm(null);
          }}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      )}

      {showOrderDetail && (
        <OrderDetailModal
          key={`${selectedOrder?._id || "order"}-${selectedOrder?.status || "status"}`}
          order={selectedOrder}
          onUpdateStatus={handleUpdateOrderStatus}
          updatingStatus={updatingOrderStatus}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {showCollectionModal && (
        <CollectionModal
          collection={editingCollection}
          onSave={handleSaveCollection}
          onClose={() => {
            setShowCollectionModal(false);
            setEditingCollection(null);
          }}
        />
      )}
      {showDiscountModal && (
        <DiscountModal
          discount={editingDiscount}
          onSave={handleSaveDiscount}
          onClose={() => {
            setShowDiscountModal(false);
            setEditingDiscount(null);
          }}
        />
      )}
      {showDiscountUsageModal && (
        <DiscountUsageModal
          discount={selectedDiscountForUsage}
          onClose={() => {
            setShowDiscountUsageModal(false);
            setSelectedDiscountForUsage(null);
          }}
        />
      )}
    </div>
  );
}
