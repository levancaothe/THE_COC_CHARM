import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import './MyDesignsPage.css';

const SAVED_DESIGNS_KEY = 'charmify_saved_designs';

const formatVnd = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} VND`;

const readSavedDesigns = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(SAVED_DESIGNS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading saved designs:', error);
    return [];
  }
};

const writeSavedDesigns = (designs) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(designs));
  } catch (error) {
    console.error('Error saving designs:', error);
  }
};

const MyDesignsPage = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const loadDesigns = () => {
      setDesigns(readSavedDesigns());
      setLoading(false);
    };

    loadDesigns();

    const handleStorage = (event) => {
      if (event.key === SAVED_DESIGNS_KEY) {
        loadDesigns();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleDelete = async () => {
    try {
      const nextDesigns = designs.filter((design) => design._id !== deleteId);
      writeSavedDesigns(nextDesigns);
      setDesigns(nextDesigns);
      setIsModalOpen(false);
      setDeleteId(null);
    } catch {
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
          <LoadingSpinner message="Đang tải thiết kế của bạn..." minHeight="300px" />
        ) : (
          <div className="my-designs-grid">
            {designs.map((design) => (
              <article key={design._id} className="my-design-card">
                <div className="my-design-card__head">
                  <div>
                    <h2>{design.name}</h2>
                    <p>
                      Ngày lưu: {new Date(design.createdAt || design.updatedAt || Date.now()).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span>{design.charms?.length || 0} hạt</span>
                </div>

                <div className="my-design-preview" aria-label={`Preview ${design.name}`}>
                  <div className="my-design-band">
                    {(design.charms || []).map((item, index) => (
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
                          charms: (design.charms || []).map((c) => c.charm),
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
