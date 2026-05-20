import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border)', padding: '40px 0', marginTop: '60px' }}>
      <div className="container">
        <div className="footer-content">
          <p style={{ fontWeight: 600 }}>&copy; 2026 The Cóc Charm. Lưu giữ ký niệm qua từng hạt charm.</p>
          <div className="socials" style={{ marginTop: '10px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <span>Instagram</span>
            <span>Facebook</span>
            <span>TikTok</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
