import infoIcon from '../assets/ic.png';
import './SuccessModal.css';

export default function CollectionInfoModal({ isOpen, onClose, collection }) {
  if (!isOpen || !collection) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div
        className="success-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderTop: '5px solid #d95c14',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          borderRadius: '12px',
          padding: '40px 30px',
        }}
      >
        <div
          className="success-icon"
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            animation: 'scaleIn 0.3s ease both',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={infoIcon}
            alt="Info"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        <h2 className="success-title">{collection.name}</h2>

        <p
          className="success-message"
          style={{
            textAlign: 'justify',
            maxHeight: '200px',
            overflowY: 'auto',
            paddingRight: '5px',
            whiteSpace: 'pre-wrap'
          }}
        >
          {collection.description || 'Bộ sưu tập sắp ra mắt, vui lòng quay lại sau!'}
        </p>

        <button
          className="success-btn"
          onClick={onClose}
          style={{
            width: '100%',
            maxWidth: '180px',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          ĐÓNG
        </button>
      </div>
    </div>
  );
}
