import './AboutUsPage.css';

const pillars = [
  {
    icon: '👤',
    title: 'Độc Bản & Cá Nhân Hóa Cực Cao',
    text: 'Mỗi thiết kế được ghép từ câu chuyện, màu sắc và phong cách riêng của bạn để tạo ra một chiếc vòng mang dấu ấn cá nhân rõ ràng.',
  },
  {
    icon: '🔒',
    title: 'Lưu Giữ Hành Trình Sáng Tạo',
    text: 'Chúng tôi lưu lại các mẫu yêu thích, bộ charm đã chọn và những thiết kế bạn từng tạo để việc quay lại chỉnh sửa luôn dễ dàng.',
  },
  {
    icon: '🛡️',
    title: 'Cam Kết Bền Vững',
    text: 'Từ chất liệu đến đóng gói, The Cóc Charm ưu tiên độ bền, tính thẩm mỹ và trải nghiệm sử dụng lâu dài cho từng sản phẩm.',
  },
];

const AboutUsPage = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <p className="about-kicker">The Cóc Charm</p>
        <h1>Tầm Nhìn & Sứ Mệnh</h1>
        <p className="about-intro">
          Tại The Cóc Charm, chúng tôi tin rằng trang sức không chỉ là phụ kiện
          làm đẹp đơn thuần, mà là nơi gửi gắm cảm xúc, kỷ niệm và dấu ấn cá nhân
          của mỗi người. Mỗi chiếc vòng là một phiên bản rất riêng, được tạo ra
          để đồng hành cùng bạn trong những khoảnh khắc đáng nhớ.
        </p>
      </section>

      <section className="about-section about-values" aria-labelledby="about-values-title">
        <h2 id="about-values-title">Ba Giá Trị Nền Tảng Làm Nên Khác Biệt</h2>
        <div className="about-pillar-grid">
          {pillars.map((pillar) => (
            <article className="about-pillar" key={pillar.title}>
              <span className="about-pillar__icon" aria-hidden="true">
                {pillar.icon}
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-commitment" aria-labelledby="about-commitment-title">
        <h2 id="about-commitment-title">Lời Hứa Từ The Cóc Charm</h2>
        <div className="about-commitment__body">
          <p>
            Chúng tôi không ngừng hoàn thiện để mang lại trải nghiệm đẹp nhất từ lúc bạn
            bắt đầu chọn charm, trong quá trình chế tác, cho đến khi nhận sản phẩm cuối cùng.
            Từ khâu kiểm tra chất lượng, đóng gói đến hỗ trợ sau bán, mọi chi tiết đều được
            xử lý chỉn chu.
          </p>
          <p className="about-quote">
            “The Cóc Charm không chỉ bán vòng tay, mà còn lưu giữ những câu chuyện mà bạn muốn trân trọng.”
          </p>
          <p>
            Hãy cùng chúng tôi tạo nên một món trang sức phản chiếu cá tính của riêng bạn,
            giản dị nhưng có chiều sâu, tinh tế nhưng vẫn rất riêng.
          </p>
        </div>
      </section>

      <section className="about-showcase" aria-label="Không gian thương hiệu">
        <div className="about-showcase__panel">
          <div className="about-showcase__content">
            <span>Crafted with care</span>
            <strong>The Cóc Charm</strong>
            <p>Trang sức cá nhân hóa được chế tác để kể câu chuyện của bạn.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
