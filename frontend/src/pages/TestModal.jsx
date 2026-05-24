import { useState } from 'react';
import SuccessModal from '../components/SuccessModal';

export default function TestModal() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Test Success Modal</h1>
      <button 
        onClick={() => setShowModal(true)}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          background: '#d95c14',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Show Success Modal
      </button>

      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Test Modal"
        message="This is a test message"
      />
    </div>
  );
}
