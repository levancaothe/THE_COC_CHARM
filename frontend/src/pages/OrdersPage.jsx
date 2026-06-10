import { useState } from 'react';
import api from '../services/api';
import './OrdersPage.css';

const ORDER_STATUS_MAP = {
  Pending: 'Chờ xử lý',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao hàng',
  Delivered: 'Đã giao hàng',
  Cancelled: 'Đã hủy',
};

const formatVnd = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} VND`;

const getDesignCharms = (item) => {
  const snapshotCharms = Array.isArray(item.designCharmDetails) ? item.designCharmDetails : [];
  if (snapshotCharms.length > 0) return snapshotCharms;

  return Array.isArray(item.designCharms)
    ? item.designCharms.map((charm) => ({
        _id: charm,
        name: 'Charm',
        image: '',
      }))
    : [];
};

const getCharmImage = (charm) => charm?.image || charm?.thumbnail || charm?.photo || '';

const getCharmName = (charm) => charm?.name || charm?.title || charm?.charmName || 'Charm';

const OrdersPage = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const renderBraceletPreview = (item) => {
    const charms = getDesignCharms(item);

    return (
      <div className="lookup-design-preview">
        <div className="lookup-design-preview__title">
          <strong>Vòng charm</strong>
          <span>{charms.length} hạt</span>
        </div>
        <div className="lookup-design-strip" role="list" aria-label="Danh sách charm trong vòng">
          {charms.length > 0 ? (
            charms.map((charm, index) => {
              const charmName = getCharmName(charm);
              const charmImage = getCharmImage(charm);

              return (
                <div
                  key={`${charm?._id || charmName || 'charm'}-${index}`}
                  className="lookup-design-chip"
                  role="listitem"
                  title={charmName}
                >
                  {charmImage ? (
                    <img src={charmImage} alt={charmName} className="lookup-design-chip__image" />
                  ) : (
                    <span className="lookup-design-chip__image lookup-design-chip__image--empty">?</span>
                  )}
                  <span className="lookup-design-chip__name">{charmName}</span>
                </div>
              );
            })
          ) : (
            <div className="lookup-design-empty">Không có dữ liệu hạt charm.</div>
          )}
        </div>
      </div>
    );
  };

  const handleLookup = async (event) => {
    event.preventDefault();
    const normalizedPhone = phone.trim();

    if (!normalizedPhone) {
      setError('Vui lòng nhập số điện thoại để tra cứu.');
      setOrders([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const { data } = await api.get('/orders', {
        params: { phone: normalizedPhone },
      });
      setOrders(data.data || []);
    } catch (fetchError) {
      console.error('Error fetching orders:', fetchError);
      setError('Không thể tra cứu đơn hàng. Vui lòng thử lại sau.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lookup-page fade-in">
      <section className="lookup-shell">
        <div className="lookup-panel">
          <div className="lookup-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" role="img">
              <path d="M14 21.5 32 12l18 9.5-18 9.8L14 21.5Z" />
              <path d="M14 25.5 30 34v18L14 43.4V25.5Z" />
              <path d="M50 25.5 34 34v18l16-8.6V25.5Z" />
              <path d="M22.5 17.1 41 27" />
            </svg>
          </div>

          <h1>Tra Cứu Đơn Hàng</h1>
          <p className="lookup-intro">
            Nhập số điện thoại của bạn để theo dõi tiến độ sản xuất và tình trạng vận chuyển.
          </p>

          <form className="lookup-form" onSubmit={handleLookup}>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Số điện thoại của bạn"
              aria-label="Số điện thoại của bạn"
            />
            {error && <p className="lookup-error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Đang tra cứu...' : 'Tra cứu ngay'}
            </button>
          </form>
        </div>
      </section>

      {hasSearched && !loading && !error && (
        <section className="lookup-results">
          {orders.length > 0 ? (
            orders.map((order) => (
              <article key={order._id} className="lookup-order-card">
                <div className="lookup-order-head">
                  <div>
                    <h2>Mã đơn: #{order._id.slice(-6).toUpperCase()}</h2>
                    <p>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <span>{ORDER_STATUS_MAP[order.status] || order.status || 'Chờ xử lý'}</span>
                </div>

                 <div className="lookup-order-items">
                  {order.items.map((item, index) => (
                    <div
                      key={`${order._id}-${index}`}
                      className={`lookup-order-item ${(item.productType === 'BraceletDesign' || item.productType === 'Collection') ? 'lookup-order-item--design' : ''}`}
                    >
                      {(item.productType === 'BraceletDesign' || item.productType === 'Collection') && renderBraceletPreview(item)}
                      <div className={`lookup-order-item__main ${(item.productType === 'BraceletDesign' || item.productType === 'Collection') ? 'lookup-order-item__main--design' : ''}`}>
                        <span>
                          {item.productType === 'BraceletDesign'
                            ? 'Vòng tay thiết kế'
                            : item.productType === 'Collection'
                            ? 'Bộ sưu tập'
                            : 'Hạt Charm lẻ'}
                        </span>
                        <span>Số lượng: {item.quantity}</span>
                        <strong>{formatVnd(item.price * item.quantity)}</strong>
                      </div>
                      {(item.productType === 'BraceletDesign' || item.productType === 'Collection') && (
                        <p className="lookup-design-summary">
                          Vòng tay được ghép từ {(getDesignCharms(item)).length} hạt charm
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="lookup-order-foot">
                  <div>
                    <p><strong>Người nhận:</strong> {order.customerInfo.name}</p>
                    <p><strong>Số điện thoại:</strong> {order.customerInfo.phone}</p>
                    <p><strong>Địa chỉ:</strong> {order.customerInfo.address}</p>
                  </div>
                  <div className="lookup-total">
                    {order.discountAmount > 0 && (
                      <div className="lookup-discount-line" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', marginBottom: '8px', borderBottom: '1px dashed #eee', paddingBottom: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          Tạm tính: {formatVnd(order.totalPrice + order.discountAmount)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#e63946', fontWeight: 'bold' }}>
                          Khuyến mãi {order.discountCode ? `(${order.discountCode})` : ""}: -{formatVnd(order.discountAmount)}
                        </div>
                      </div>
                    )}
                    <span>Tổng thanh toán</span>
                    <strong>{formatVnd(order.totalPrice)}</strong>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="lookup-empty">
              Không tìm thấy đơn hàng nào với số điện thoại này.
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default OrdersPage;
