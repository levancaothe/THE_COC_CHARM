import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';
import './MyDesignsPage.css';

const formatVnd = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} VND`;

const MyDesignsPage = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
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
    <div className="my-designs-page fade-in">
      <div className="my-designs-wrap">
        <div className="my-designs-header">
          <p>Mẫu đã lưu</p>
          <h1>Thiết kế của tôi</h1>
        </div>

        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="my-designs-grid">
            {designs.map((design) => (
              <article key={design._id} className="my-design-card">
                <div className="my-design-card__head">
                  <div>
                    <h2>{design.name}</h2>
                    <p>Ngày lưu: {new Date(design.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <span>{design.charms.length} hạt</span>
                </div>

                <div className="my-design-preview" aria-label={`Preview ${design.name}`}>
                  <div className="my-design-band">
                    {design.charms.map((item, index) => (
                      <img
                        key={`${item.charm?._id || item.charm?.name || 'charm'}-${index}`}
                        src={item.charm?.image}
                        alt=""
                      />
                    ))}
                  </div>
                </div>

                <div className="my-design-card__foot">
                  <strong>{formatVnd(design.totalPrice)}</strong>
                  <div className="my-design-actions">
                    <button
                      className="my-design-add"
                      type="button"
                      onClick={() => {
                        addToCart({
                          _id: design._id,
                          name: design.name,
                          price: design.totalPrice,
                          charms: design.charms.map((c) => c.charm),
                          isSaved: true,
                        }, 'design');
                        alert('Đã thêm thiết kế vào giỏ hàng!');
                      }}
                    >
                      Thêm vào giỏ hàng
                    </button>
                    <button
                      className="my-design-edit"
                      type="button"
                      onClick={() => navigate('/designer', {
                        state: {
                          editDesign: design,
                          source: 'designs',
                          returnTo: '/my-designs',
                        }
                      })}
                    >
                      Sửa mẫu
                    </button>
                    <button
                      className="my-design-delete"
                      type="button"
                      onClick={() => {
                        setDeleteId(design._id);
                        setIsModalOpen(true);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {designs.length === 0 && (
              <div className="my-design-empty">
                <p>Bạn chưa có thiết kế nào được lưu.</p>
              </div>
            )}
          </div>
        )}
      </div>

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
