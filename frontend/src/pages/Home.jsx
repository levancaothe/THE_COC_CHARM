import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import logo from "../assets/logo.png";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import './Home.css';

const processSteps = [
  {
    number: '1',
    title: 'Nhập Số Đo',
    text: 'Xác định kích thước cổ tay và chọn chất liệu dây nền (Bạc, Vàng, Da) để tính toán số lượng hạt vừa vặn.',
  },
  {
    number: '2',
    title: 'Thiết Kế',
    text: 'Kéo thả các khối charm độc đáo từ thư viện vào thiết kế của bạn. Tự do sắp xếp thứ tự các hạt.',
    featured: true,
  },
  {
    number: '3',
    title: 'Hoàn Thiện & Đặt Hàng',
    text: 'Lưu bản phác thảo và tiến hành đặt hàng. Sản phẩm sẽ được ráp thủ công và đóng hộp sang trọng gửi tới bạn.',
  },
];

const craftItems = [
  {
    icon: '✓',
    title: 'Thép Không Gỉ & Titanium',
    text: 'Chống trầy xước, không xin màu và an toàn tuyệt đối cho mọi loại da. Bền bỉ lưu giữ kỷ niệm theo năm tháng.',
  },
  {
    icon: '✦',
    title: 'Chế Tác Thủ Công',
    text: 'Từng chi tiết tráng men, đính đá hay khắc laser đều được thực hiện tỉ mỉ bởi những nghệ nhân trang sức lành nghề nhất.',
  },
  {
    icon: '↔',
    title: 'Cơ Chế Khóa Thông Minh',
    text: 'Thiết kế móc ngàm chuẩn Ý titanium Charm giúp bạn dễ dàng tự tháo lắp, thay đổi vị trí các hạt charm chỉ trong vài giây.',
  },
];

const testimonials = [
  {
    name: 'Linh Linh',
    text: '"Tuyệt vời! Tôi đã tự sắp xếp một chiếc vòng mang theo con gái mình. Các màu sắc và khắc tên rất đúng, nhân viên gói hàng còn trang trí rất xinh."',
  },
  {
    name: 'Trần Đồng',
    text: '"Mình thấy vòng giữ được độ sáng khá lâu. Trải nghiệm tự tay chọn từng hạt charm rất ý nghĩa. Bạn gái mình cực kỳ thích món quà này."',
  },
  {
    name: 'Mai Anh',
    text: '"Không gian đặt charm khá thương hiệu và cao cấp. Mình chọn chủ đề hành trình cho du lịch, charm chắc chắn và lên màu rất nhã."',
  },
];

const Home = () => {
  const [popularCharms, setPopularCharms] = useState([]);
  const [loadingThemes, setLoadingThemes] = useState(true);

  useEffect(() => {
    const fetchPopularThemes = async () => {
      try {
        const res = await api.get('/charms/popular?limit=3');
        setPopularCharms(res.data.data || []);
      } catch (error) {
        console.error('Error fetching popular charms:', error);
        setPopularCharms([]);
      } finally {
        setLoadingThemes(false);
      }
    };

    fetchPopularThemes();
  }, []);

  return (
    <div className="home-page fade-in">
      <header className="home-hero">
        <div className="home-hero__content">
          <h1>
            Kể Câu Chuyện Của Bạn
            <span>Qua Từng Hạt Charm</span>
          </h1>
          <p>
            The Cóc Charm sẽ giúp bạn lựa chọn vòng tay cơ bản và thỏa sức kéo thả các hạt charm mang ý nghĩa riêng. Tạo nên một món trang sức mang đậm dấu ấn cá nhân của chính bạn hoặc người thương.
          </p>
          <div className="home-hero__actions">
            <Link to="/designer" className="home-btn home-btn--primary">Bắt đầu thiết kế <span>→</span></Link>
            <Link to="/charms" className="home-btn home-btn--accent">Xem bộ sưu tập <span>→</span></Link>
          </div>
        </div>
        <div className="home-hero__visual" aria-hidden="true">
          <div className="hero-frame hero-frame--orange">
            <img src={img1} alt="" />
          </div>
          <div className="hero-frame hero-frame--blue">
            <img src={img2} alt="" />
          </div>
        </div>
      </header>

      <section className="home-section process-section">
        <p className="home-kicker">Quy trình</p>
        <h2>Dấu Ấn Cá Nhân Trong 3 Bước</h2>
        <div className="process-grid">
          {processSteps.map((step) => (
            <article className={`process-card${step.featured ? ' process-card--featured' : ''}`} key={step.number}>
              <span className="process-card__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section products-section">
        <p className="home-kicker">Sản phẩm nổi bật</p>
        <h2>Charm hot trên hệ thống</h2>
        <span className="section-rule" />
        <p className="section-intro">
          Khám phá những charm được chọn nhiều nhất trên toàn hệ thống. Khi chưa có đủ dữ liệu mua hàng, hệ thống sẽ tạm hiển thị các charm mới nhất.
        </p>
        <div className="product-grid">
          {loadingThemes ? (
            <article className="product-card">
              <span className="product-badge">ĐANG TẢI</span>
              <div className="product-card__image product-card__image--placeholder" />
              <div className="product-card__body">
                <h3>Đang tải charm hot</h3>
                <p>Hệ thống đang tổng hợp các charm được chọn nhiều nhất từ toàn bộ đơn hàng.</p>
                <strong>...</strong>
              </div>
            </article>
          ) : popularCharms.length > 0 ? (
            popularCharms.map((charm, index) => (
              <article className="product-card" key={charm._id}>
                <span className="product-badge">{index === 0 ? 'HOT' : charm.badge}</span>
                <div className="product-card__image">
                  {charm.image ? <img src={charm.image} alt={charm.name} /> : null}
                </div>
                <div className="product-card__body">
                  <h3>{charm.name}</h3>
                  <p>{charm.category?.name ? `Danh mục: ${charm.category.name}` : 'Charm hot toàn hệ thống.'}</p>
                  <strong>{charm.count} lượt chọn</strong>
                </div>
              </article>
            ))
          ) : (
            <article className="product-card product-card--empty">
              <span className="product-badge">NEW</span>
              <div className="product-card__image product-card__image--placeholder" />
              <div className="product-card__body">
                <h3>Chưa có dữ liệu mua hàng</h3>
                <p>Hệ thống đang hiển thị các charm mới nhất để bạn vẫn có nội dung nổi bật.</p>
                <strong>0 lượt chọn</strong>
              </div>
            </article>
          )}
        </div>
        <Link to="/charms" className="view-all-link">Xem tất cả charm <span>→</span></Link>
      </section>

      <section className="craft-section">
        <div className="craft-emblem">
          <div className="craft-emblem__rings">
            <img src={logo} alt="" />
            <strong>Mỗi Charm là một</strong>
            <em>hộp quà kí ức</em>
          </div>
        </div>
        <div className="craft-content">
          <p className="home-kicker">Nghệ Thuật Chế Tác</p>
          <h2>Chất Liệu Cao Cấp & Kỹ Thuật Tinh Xảo</h2>
          <div className="craft-list">
            {craftItems.map((item) => (
              <div className="craft-item" key={item.title}>
                <span>{item.icon}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/charms" className="outline-link">Khám phá bộ sưu tập Charm</Link>
        </div>
      </section>

      <section className="home-section testimonials-section">
        <p className="home-kicker">Đánh giá thực tế</p>
        <h2>Khách hàng nói về chúng tôi</h2>
        <span className="section-rule" />
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <span className="avatar" />
              <div>
                <h3>{testimonial.name}</h3>
                <div className="stars">★★★★★</div>
                <p>{testimonial.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
