import React, { useState, useEffect } from 'react';
import api from '../services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-page container fade-in" style={{ padding: '60px 20px' }}>
      <h1 className="section-title" style={{ marginBottom: '40px' }}>Đơn hàng của tôi</h1>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {orders.map((order) => (
            <div key={order._id} className="order-card glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                <div>
                  <h3 style={{ color: 'var(--accent)' }}>Mã đơn: #{order._id.slice(-6).toUpperCase()}</h3>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '6px 15px', 
                    borderRadius: '20px', 
                    background: 'var(--accent-bg)', 
                    color: 'var(--accent)', 
                    fontSize: '0.8rem', 
                    fontWeight: 700 
                  }}>
                    Đang xử lý
                  </span>
                </div>
              </div>

              <div className="order-items" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <span style={{ fontSize: '1.2rem' }}>✨</span>
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{item.productType === 'BraceletDesign' ? 'Vòng tay thiết kế' : 'Hạt Charm lẻ'}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem' }}>
                  <p><strong>Người nhận:</strong> {order.customerInfo.name}</p>
                  <p><strong>Số điện thoại:</strong> {order.customerInfo.phone}</p>
                  <p><strong>Địa chỉ:</strong> {order.customerInfo.address}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Tổng thanh toán:</p>
                  <h2 style={{ color: 'var(--text-h)' }}>${order.totalPrice.toFixed(2)}</h2>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="empty-state glass" style={{ padding: '60px', textAlign: 'center', borderRadius: '24px' }}>
              <p>Bạn chưa có đơn hàng nào.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
