import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, toggleSelection, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('CartPage mounted, cartItems:', cartItems);
  }, [cartItems]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    const selectedItems = cartItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      alert('Vui lòng nhập số điện thoại Việt Nam hợp lệ (VD: 0912345678)!');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: selectedItems.map(item => ({
          product: item._id,
          productType: item.type === 'design' ? 'BraceletDesign' : 'Charm',
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice,
        customerInfo
      };

      await api.post('/orders', orderData);
      alert('Đặt hàng thành công!');
      
      // Remove selected items from cart
      selectedItems.forEach(item => removeFromCart(item._id, item.type));
      
      // Reset form
      setCustomerInfo({
        name: '',
        phone: '',
        address: ''
      });
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert('Lỗi khi đặt hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page container fade-in" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '60px', borderRadius: '24px' }}>
          <h2 style={{ marginBottom: '20px' }}>Giỏ hàng của bạn đang trống</h2>
          <p style={{ color: 'var(--text)', marginBottom: '30px' }}>Hãy chọn cho mình những hạt charm tuyệt vời nhất nhé!</p>
          <Link to="/charms" className="btn-premium" style={{ textDecoration: 'none' }}>
            Bắt đầu mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // Debug rendering
  console.log('Rendering cart with items:', cartItems.length);

  return (
    <div className="cart-page container fade-in" style={{ padding: '60px 20px', minHeight: '100vh', backgroundColor: '#fff' }}>
      <h1 className="section-title" style={{ marginBottom: '40px', color: '#000' }}>Giỏ hàng ({cartItems.length} items)</h1>
      
      {/* Debug Panel */}
      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '12px', display: process.env.NODE_ENV === 'development' ? 'block' : 'none' }}>
        <strong>Debug Info:</strong>
        <pre style={{ margin: '10px 0 0 0' }}>
          Items: {cartItems.length}
          Total Price: ${totalPrice.toFixed(2)}
          localStorage: {typeof localStorage !== 'undefined' ? 'available' : 'unavailable'}
        </pre>
      </div>
      
      <div className="cart-content">
        <div className="cart-left">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={`${item._id}-${item.type}`} className={`cart-item glass ${item.selected ? 'selected' : ''}`}>
                <div className="item-checkbox">
                  <input 
                    type="checkbox" 
                    checked={item.selected} 
                    onChange={() => toggleSelection(item._id, item.type)}
                  />
                </div>
                <div className="item-image">
                  {item.type === 'design' && item.charms ? (
                    <div className="design-preview">
                      {item.charms.map((charm, idx) => (
                        <img 
                          key={idx} 
                          src={charm.image || 'https://via.placeholder.com/50'} 
                          alt="" 
                          className="design-charm-mini"
                          title={charm.name}
                        />
                      ))}
                    </div>
                  ) : (
                    <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} />
                  )}
                </div>
                <div className="item-details">
                  <span className="item-type">{item.type === 'design' ? 'Vòng tay thiết kế' : 'Hạt Charm lẻ'}</span>
                  <h3>{item.name}</h3>
                  <p className="item-price-unit">${item.price}</p>
                </div>
                <div className="item-quantity">
                  <button onClick={() => updateQuantity(item._id, item.type, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.type, item.quantity + 1)}>+</button>
                </div>
                <div className="item-total">
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button className="btn-remove" onClick={() => removeFromCart(item._id, item.type)}>
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div className="checkout-form glass" style={{ marginTop: '40px', padding: '30px' }}>
            <h3>Thông tin khách hàng</h3>
            <form onSubmit={handleCheckout} style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
              <input 
                type="text" 
                placeholder="Họ và tên" 
                value={customerInfo.name} 
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                required
              />
              <input 
                type="tel" 
                placeholder="Số điện thoại" 
                value={customerInfo.phone} 
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                required
              />
              <textarea 
                placeholder="Địa chỉ nhận hàng" 
                value={customerInfo.address} 
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                required
                rows="3"
              />
              <button 
                type="submit"
                className="btn-premium checkout-btn" 
                disabled={isSubmitting}
                style={{ marginTop: '10px' }}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}
              </button>
            </form>
          </div>
        </div>

        <div className="cart-summary glass">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="summary-row">
            <span>Tạm tính</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div className="summary-total">
            <span>Tổng cộng</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button className="btn-clear" onClick={clearCart}>
            Xóa toàn bộ giỏ hàng
          </button>
          <Link to="/charms" className="continue-shopping">
            &larr; Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
