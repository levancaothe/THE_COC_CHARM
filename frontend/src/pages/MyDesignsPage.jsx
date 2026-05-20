import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';

const MyDesignsPage = () => {
  const { addToCart } = useCart();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const { data } = await api.get('/bracelets');
      setDesigns(data.data);
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/bracelets/${deleteId}`);
      setIsModalOpen(false);
      fetchDesigns();
    } catch (error) {
      alert('Lỗi khi xóa thiết kế');
    }
  };

  return (
    <div className="my-designs-page container fade-in" style={{ padding: '40px 0' }}>
      <h1 style={{ marginBottom: '30px' }}>Thiết kế của tôi</h1>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {designs.map(design => (
            <div key={design._id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <h3>{design.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Ngày lưu: {new Date(design.createdAt).toLocaleDateString()}
              </p>

              <div style={{ display: 'flex', gap: '5px', margin: '15px 0', overflowX: 'auto', padding: '10px 0' }}>
                {design.charms.map((item, idx) => (
                  <img
                    key={idx}
                    src={item.charm?.image}
                    alt=""
                    style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-gold)', fontSize: '1.2rem' }}>
                  ${design.totalPrice}
                </span>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button
                    className="btn-premium"
                    style={{ padding: '8px 15px', fontSize: '0.9rem' }}
                    onClick={() => {
                      addToCart({
                        _id: design._id,
                        name: design.name,
                        price: design.totalPrice,
                        charms: design.charms.map(c => c.charm)
                      }, 'design');
                      alert('Đã thêm thiết kế vào giỏ hàng!');
                    }}
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={() => { setDeleteId(design._id); setIsModalOpen(true); }}
                    style={{ color: '#ff4757', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}

          {designs.length === 0 && (
            <div className="empty-state">
              <p>Bạn chưa có thiết kế nào được lưu.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title="Xóa thiết kế"
        message="Bạn có chắc chắn muốn xóa thiết kế này không?"
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MyDesignsPage;
