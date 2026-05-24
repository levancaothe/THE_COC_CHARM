import { useEffect, useState, useCallback } from 'react';
import OrderDetailModal from '../components/OrderDetailModal';
import api from '../services/api';
import './AdminDashboard.css';

const formatVND = (value) => `${new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0
}).format(Number(value) || 0)} VND`;

function StatCard({ title, value, icon, tone }) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className={`stat-content ${tone === 'dark' ? 'stat-content-revenue' : ''}`}>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function CharmModal({ charm, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: charm?.name || '',
    image: charm?.image || '',
    price: charm?.price || '',
    stock: charm?.stock || 0,
    category: charm?.category?._id || charm?.category || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{charm ? 'Chỉnh Sửa Charm' : 'Thêm Charm Mới'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên Charm *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>URL Hình Ảnh *</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Số Lượng</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Danh Mục *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ category, onSave, onClose }) {
  const [name, setName] = useState(category?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{category ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminJwt') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '', limit: 10, page: 1 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Charms state
  const [charms, setCharms] = useState([]);
  const [totalCharms, setTotalCharms] = useState(0);
  const [charmFilters, setCharmFilters] = useState({ search: '', limit: 10, page: 1 });
  const [editingCharm, setEditingCharm] = useState(null);
  const [showCharmModal, setShowCharmModal] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'orders') fetchOrders(1);
    if (token && activeTab === 'charms') fetchCharms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch stats');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      const res = await api.get('/admin/orders', { headers: { Authorization: `Bearer ${token}` }, params });
      setOrders(res.data.orders || []);
      setTotalOrders(res.data.total || 0);
      setFilters(prev => ({ ...prev, page }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCharms = async (page = 1, nextFilters = charmFilters) => {
    setLoading(true);
    try {
      const params = { ...nextFilters, page };
      console.log('Fetching charms with params:', params);
      const res = await api.get('/admin/charms', { 
        headers: { Authorization: `Bearer ${token}` }, 
        params 
      });
      console.log('Charms response:', res.data);
      setCharms(res.data.charms || []);
      setTotalCharms(res.data.total || 0);
      setCharmFilters(prev => ({ ...prev, ...nextFilters, page }));
    } catch (err) {
      console.error('Error fetching charms:', err);
      alert(err.response?.data?.message || 'Failed to fetch charms');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const res = await api.get('/admin/categories', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      console.log('Categories response:', res.data);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      alert(err.response?.data?.message || 'Failed to fetch categories');
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter username and password');
      return;
    }
    try {
      const res = await api.post('/admin/login', { username, password });
      const t = res.data.token;
      localStorage.setItem('adminJwt', t);
      localStorage.setItem('adminRole', res.data.role || 'admin');
      setToken(t);
      setUsername('');
      setPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminJwt');
    localStorage.removeItem('adminRole');
    setToken('');
  };

  const handleSaveCharm = async (formData) => {
    try {
      console.log('Saving charm:', formData);
      if (editingCharm) {
        const res = await api.put(`/admin/charms/${editingCharm._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update response:', res.data);
        alert('Charm đã được cập nhật');
      } else {
        const res = await api.post('/admin/charms', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Create response:', res.data);
        alert('Charm đã được thêm');
      }
      setShowCharmModal(false);
      setEditingCharm(null);
      fetchCharms(charmFilters.page);
      fetchStats();
    } catch (err) {
      console.error('Error saving charm:', err);
      alert(err.response?.data?.message || 'Failed to save charm');
    }
  };

  const handleDeleteCharm = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa charm này?')) return;
    try {
      await api.delete(`/admin/charms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Charm đã được xóa');
      fetchCharms(charmFilters.page);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete charm');
    }
  };

  const handleCharmSearchChange = (e) => {
    const nextFilters = { ...charmFilters, search: e.target.value };
    setCharmFilters(nextFilters);
    fetchCharms(1, nextFilters);
  };

  const handleSaveCategory = async (formData) => {
    try {
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Danh mục đã được cập nhật');
      } else {
        await api.post('/admin/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Danh mục đã được thêm');
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      fetchCategories();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await api.delete(`/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Danh mục đã được xóa');
      fetchCategories();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleExportExcel = async () => {
    if (orders.length === 0) {
      alert('Không có dữ liệu để export');
      return;
    }

    try {
      // Dynamic import xlsx
      const XLSX = await import('xlsx');

      // Prepare data for Excel
      const excelData = orders.map((order, idx) => ({
        'STT': (filters.page - 1) * filters.limit + idx + 1,
        'Mã đơn hàng': order._id,
        'Khách hàng': order.customerInfo?.name || 'N/A',
        'Số điện thoại': order.customerInfo?.phone || 'N/A',
        'Email': order.customerInfo?.email || 'N/A',
        'Địa chỉ': order.customerInfo?.address || 'N/A',
        'Tổng tiền (VND)': formatVND(order.totalPrice),
        'Trạng thái': order.status,
        'Ngày đặt': new Date(order.createdAt).toLocaleString('vi-VN')
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 25 }, // Mã đơn hàng
        { wch: 20 }, // Khách hàng
        { wch: 15 }, // SĐT
        { wch: 25 }, // Email
        { wch: 30 }, // Địa chỉ
        { wch: 12 }, // Tổng tiền
        { wch: 12 }, // Trạng thái
        { wch: 20 }  // Ngày đặt
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Đơn hàng');

      // Generate filename with current date
      const filename = `DonHang_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      alert(`Đã export ${orders.length} đơn hàng ra file ${filename}`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Lỗi khi export Excel. Vui lòng cài đặt: npm install xlsx');
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
      const res = await api.put(`/admin/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedOrder = res.data.order;
      setSelectedOrder(updatedOrder);
      setOrders((prev) => prev.map((order) => (order._id === orderId ? updatedOrder : order)));
      alert('Đã cập nhật trạng thái đơn hàng');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { 
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
  });

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
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button className="btn btn-primary btn-login" onClick={handleLogin}>Đăng Nhập</button>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = activeTab === 'orders' 
    ? Math.ceil(totalOrders / filters.limit)
    : Math.ceil(totalCharms / charmFilters.limit);

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
            <button className="btn btn-danger" onClick={logout}>Đăng Xuất</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-hero">
          <div>
            <p className="admin-eyebrow">Tổng quan vận hành</p>
            <h2>Quản lý đơn hàng, charms và danh mục</h2>
          </div>
          <button className="btn btn-primary" onClick={fetchStats} disabled={loading}>
            Làm mới dữ liệu
          </button>
        </section>

        <section className="stats-section">
          <div className="section-heading">
            <h2>Thống Kê Chung</h2>
            <span>{loading ? 'Đang đồng bộ...' : 'Dữ liệu mới nhất'}</span>
          </div>
          <div className="stats-grid">
            <StatCard title="Charms" value={stats?.charmsCount ?? '...'} icon="◇" tone="blue" />
            <StatCard title="Danh Mục" value={stats?.categoriesCount ?? '...'} icon="▦" tone="amber" />
            <StatCard title="Thiết Kế" value={stats?.designsCount ?? '...'} icon="✦" tone="pink" />
            <StatCard title="Đơn Hàng" value={stats?.ordersCount ?? '...'} icon="▣" tone="green" />
            <StatCard title="Doanh Thu" value={stats ? formatVND(stats.totalRevenue) : '...'} icon="VND" tone="dark" />
          </div>
        </section>

        <section className="tabs-section">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span>Đơn Hàng</span>
              <strong>{totalOrders}</strong>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'charms' ? 'active' : ''}`}
              onClick={() => setActiveTab('charms')}
            >
              <span>Charms</span>
              <strong>{totalCharms || stats?.charmsCount || 0}</strong>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <span>Danh Mục</span>
              <strong>{categories.length}</strong>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'orders' && (
              <div className="orders-tab">
                <div className="content-title">
                  <div>
                    <h3>Danh sách đơn hàng</h3>
                    <p>Lọc và theo dõi đơn hàng theo trạng thái, thời gian.</p>
                  </div>
                  <button className="btn btn-success btn-export" onClick={handleExportExcel} disabled={loading || orders.length === 0}>
                    Export to Excel
                  </button>
                </div>
                <div className="filters-container">
                  <div className="filter-group">
                    <label>Trạng Thái</label>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                      <option value="">Tất Cả</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Từ Ngày</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Đến Ngày</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Số Hàng/Trang</label>
                    <input
                      type="number"
                      value={filters.limit}
                      onChange={(e) => setFilters({ ...filters, limit: Math.max(1, parseInt(e.target.value, 10)) })}
                      min="1"
                      max="100"
                    />
                  </div>
                  <button className="btn btn-primary btn-apply" onClick={() => fetchOrders(1)}>Áp Dụng</button>
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
                            orders.map((order, idx) => (
                              <tr key={order._id} className={`status-${order.status.toLowerCase()}`}>
                                <td className="text-center">{(filters.page - 1) * filters.limit + idx + 1}</td>
                                <td>{order.customerInfo?.name || 'N/A'}</td>
                                <td>{order.customerInfo?.phone || 'N/A'}</td>
                                <td className="text-right">{formatVND(order.totalPrice)}</td>
                                <td><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td className="actions-cell">
                                  <button
                                    className="btn-icon btn-view"
                                    onClick={() => handleViewOrderDetail(order)}
                                    title="Xem chi tiết"
                                  >
                                    👁
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="7" className="text-center">Không có đơn hàng nào</td></tr>
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
                      <span className="page-info">Trang {filters.page} / {totalPages || 1}</span>
                      <button
                        className="btn btn-small"
                        disabled={filters.page >= totalPages}
                        onClick={() => fetchOrders(filters.page + 1)}
                      >
                        Tiếp →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'charms' && (
              <div className="charms-tab">
                <div className="tab-actions">
                  <div>
                    <h3>Kho charms</h3>
                    <p>Quản lý thông tin, giá và tồn kho từng charm.</p>
                  </div>
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Tìm kiếm charm..."
                      value={charmFilters.search}
                      onChange={handleCharmSearchChange}
                    />
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
                                <td className="text-center">{(charmFilters.page - 1) * charmFilters.limit + idx + 1}</td>
                                <td>
                                  <img src={charm.image} alt={charm.name} className="charm-thumb" />
                                </td>
                                <td>{charm.name}</td>
                                <td>{charm.category?.name || 'N/A'}</td>
                                <td className="text-right">{formatVND(charm.price)}</td>
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
                                    onClick={() => handleDeleteCharm(charm._id)}
                                    title="Xóa"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="7" className="text-center">Không có charm nào</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="pagination">
                      <button
                        className="btn btn-small"
                        disabled={charmFilters.page === 1}
                        onClick={() => fetchCharms(charmFilters.page - 1)}
                      >
                        ← Trước
                      </button>
                      <span className="page-info">Trang {charmFilters.page} / {totalPages || 1}</span>
                      <button
                        className="btn btn-small"
                        disabled={charmFilters.page >= totalPages}
                        onClick={() => fetchCharms(charmFilters.page + 1)}
                      >
                        Tiếp →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="categories-tab">
                <div className="tab-actions">
                  <div>
                    <h3>Quản Lý Danh Mục</h3>
                    <p>Sắp xếp nhóm charm hiển thị trong cửa hàng.</p>
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

                <div className="categories-grid">
                  {categories.map(cat => (
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
          order={selectedOrder}
          onUpdateStatus={handleUpdateOrderStatus}
          updatingStatus={updatingOrderStatus}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
