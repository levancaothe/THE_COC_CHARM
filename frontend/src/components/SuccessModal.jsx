import { useNavigate } from 'react-router-dom';
import './SuccessModal.css';

export default function SuccessModal({ isOpen, onClose, title, message }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">
          <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="25" fill="#d95c14"/>
            <path 
              fill="none" 
              stroke="#fff" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27l7.5 7.5L38 18"
            />
          </svg>
        </div>
        
        <h2 className="success-title">{title || 'Đặt Hàng Thành Công!'}</h2>
        
        <p className="success-message">
          {message || 'Cảm ơn bạn đã lựa chọn The Cốc Charm. Đơn hàng của bạn đang được xử lý.'}
        </p>
        
        <button className="success-btn" onClick={handleGoHome}>
          TRỞ VỀ TRANG CHỦ
        </button>
      </div>
    </div>
  );
}
