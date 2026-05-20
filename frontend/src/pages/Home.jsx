import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page container fade-in">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>The Cóc Charm</h1>
          <p className="hero-subtitle">
            Nơi lưu giữ những kỷ niệm qua từng hạt charm tinh xảo.
            Thiết kế vòng tay độc bản mang đậm dấu ấn cá nhân của riêng bạn.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/designer" className="btn-premium" style={{ textDecoration: 'none', padding: '15px 40px' }}>
              Bắt đầu thiết kế
            </Link>
            <Link to="/charms" className="btn-secondary" style={{ textDecoration: 'none', padding: '15px 40px' }}>
              Khám phá bộ sưu tập
            </Link>
          </div>
        </div>
      </header>

      {/* Featured Collections Section */}
      <section className="featured-section" style={{ padding: '80px 0' }}>
        <h2 className="section-title">Bộ Sưu Tập Nổi Bật</h2>
        <div className="featured-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginTop: '40px'
        }}>
          <div className="featured-card glass" style={{ padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ height: '250px', background: 'var(--bg)', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '4rem' }}>🌸</span>
            </div>
            <h3>Bộ Sưu Tập Mùa Xuân</h3>
            <p style={{ opacity: 0.7 }}>Mang hơi thở thiên nhiên vào chiếc vòng tay của bạn với những hạt charm hoa cỏ nhẹ nhàng.</p>
          </div>
          <div className="featured-card glass" style={{ padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ height: '250px', background: 'var(--bg)', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '4rem' }}>💎</span>
            </div>
            <h3>Ánh Sáng Ban Mai</h3>
            <p style={{ opacity: 0.7 }}>Sự kết hợp giữa bạc cao cấp và đá quý lấp lánh, tạo nên vẻ đẹp sang trọng và quý phái.</p>
          </div>
          <div className="featured-card glass" style={{ padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ height: '250px', background: 'var(--bg)', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '4rem' }}>🐚</span>
            </div>
            <h3>Ký Ức Đại Dương</h3>
            <p style={{ opacity: 0.7 }}>Những hạt charm lấy cảm hứng từ biển cả, mang lại cảm giác bình yên và tự do.</p>
          </div>
        </div>
      </section>

      {/* Brand Values Section */}
      <section className="values-section" style={{ padding: '60px 0', background: 'var(--accent-bg)', borderRadius: '40px', marginBottom: '80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title">Tại Sao Chọn The Cóc Charm?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginTop: '50px' }}>
            <div>
              <h4 style={{ color: 'var(--accent)', fontSize: '1.2rem', marginBottom: '10px' }}>Chất Lượng Cao Cấp</h4>
              <p style={{ fontSize: '0.9rem' }}>Sử dụng bạc 925 và đá quý tự nhiên, đảm bảo độ bền và sáng bóng theo thời gian.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent)', fontSize: '1.2rem', marginBottom: '10px' }}>Thiết Kế Độc Bản</h4>
              <p style={{ fontSize: '0.9rem' }}>Mỗi chiếc vòng là một câu chuyện riêng biệt, do chính bạn sáng tạo nên.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent)', fontSize: '1.2rem', marginBottom: '10px' }}>Dịch Vụ Tận Tâm</h4>
              <p style={{ fontSize: '0.9rem' }}>Chúng tôi luôn lắng nghe và hỗ trợ bạn tìm kiếm những hạt charm ý nghĩa nhất.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
