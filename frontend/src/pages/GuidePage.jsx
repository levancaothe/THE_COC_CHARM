import './GuidePage.css';

const policySections = [
  {
    icon: '🛡️',
    title: '1. Chính sách bảo hành',
    accent: 'blue',
    items: [
      {
        heading: 'Bảo hành trọn đời:',
        text: 'Miễn phí làm sáng, đánh bóng và làm mới sản phẩm vô thời hạn tại tất cả các cửa hàng thuộc hệ thống MyU Memories.',
      },
      {
        heading: '1 đổi 1 trong 7 ngày:',
        text: 'Áp dụng đổi mới ngay lập tức cho các sản phẩm có lỗi từ nhà sản xuất (lỗi khóa chốt, lỗi kỹ thuật khắc/đính charm).',
      },
      {
        heading: 'Hỗ trợ sửa chữa:',
        text: 'Giảm 50% chi phí sửa chữa, làm mới dây, thay thế charm trong trường hợp phát sinh lỗi do quá trình sử dụng của quý khách.',
      },
    ],
  },
  {
    icon: '🚚',
    title: '2. Giao hàng & Chế tác',
    accent: 'orange',
    items: [
      {
        heading: 'Thời gian chế tác đặc bản:',
        text: 'Vì là sản phẩm cá nhân hóa thủ công theo yêu cầu riêng, thời gian hoàn thiện dự kiến từ 2-4 ngày làm việc kể từ thời điểm xác nhận đơn hàng và thanh toán.',
      },
      {
        heading: 'Vận chuyển an toàn:',
        text: 'Từ 1-3 ngày đối với khu vực nội thành và 3-5 ngày đối với các tỉnh thành khác. Sản phẩm được đóng gói niêm phong cẩn thận trong hộp nhung cao cấp.',
      },
      {
        heading: 'Miễn phí vận chuyển:',
        text: 'Áp dụng giao hàng hoàn toàn miễn phí cho toàn bộ các đơn hàng có giá trị từ 1.000.000đ trên toàn quốc.',
      },
    ],
  },
  {
    icon: '🤝',
    title: '3. Thanh toán & Bảo mật',
    accent: 'blue',
    items: [
      {
        heading: 'Quy định thanh toán:',
        text: 'Áp dụng thanh toán chuyển khoản 100% trước khi tiến hành chế tác. Chính sách này nhằm đảm bảo giá trị độc bản cho món trang sức được thiết kế riêng của quý khách.',
      },
      {
        heading: 'Bảo mật thông tin tuyệt đối:',
        text: 'Mọi thông tin cá nhân, hình ảnh và câu chuyện kỷ niệm của quý khách gửi gắm vào sản phẩm đều được bảo mật tuyệt đối, cam kết không sử dụng cho mục đích quảng cáo nếu chưa có sự đồng ý.',
      },
    ],
  },
];

const GuidePage = () => {
  return (
    <div className="guide-page">
      <section className="guide-hero">
        <p className="guide-kicker">Cam kết của chúng tôi</p>
        <h1>Chính Sách & Dịch Vụ</h1>
        <span className="guide-rule" />
        <p className="guide-intro">
          The Cóc Charm luôn đặt trải nghiệm và sự hài lòng của quý khách lên hàng đầu.
          Mỗi sản phẩm không chỉ là trang sức, mà còn là lời cam kết về chất lượng và dịch vụ tận tâm của thương hiệu.
        </p>
      </section>

      <section className="policy-list" aria-label="Chính sách và dịch vụ">
        {policySections.map((section) => (
          <article className={`policy-card policy-card--${section.accent}`} key={section.title}>
            <header>
              <span className="policy-icon" aria-hidden="true">{section.icon}</span>
              <h2>{section.title}</h2>
            </header>
            <div className="policy-items">
              {section.items.map((item) => (
                <div className="policy-item" key={item.heading}>
                  <h3>{item.heading}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default GuidePage;
