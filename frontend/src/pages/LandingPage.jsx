import React, { useState, useEffect } from "react";
import "./LandingPage.css";
import logo from "../assets/logo.png"; // 👈 put your frog logo here

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (n) => n.toLocaleString("vi-VN") + "đ";

const BRACELETS = [
  {
    id: "happy-birthday",
    name: "Happy Birthday",
    desc: "Món quà nhỏ gửi trọn yêu thương và lời chúc sinh nhật ý nghĩa.",
    price: 250000,
  },
  {
    id: "my-love",
    name: "My Love",
    desc: "Vòng tay nhỏ thay lời yêu thương ngọt ngào dành cho người đặc biệt.",
    price: 250000,
  },
  {
    id: "graduation",
    name: "Graduation",
    desc: "Món quà ý nghĩa lưu giữ dấu mốc trưởng thành và chúc cho hành trình mới luôn thành công.",
    price: 250000,
  },
];

const SIZES = ["15 Charm / 18cm", "17 Charm / 20cm", "19 Charm / 22cm"];
const GIFT_PRICE = 50000;
const SHIPPING_PRICE = 30000;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  // Countdown (starting at 2h 45m 30s — swap with real deadline)
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 45 * 60 + 30);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const mm = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  // Order form state
  const [selected, setSelected] = useState("happy-birthday");
  const [size, setSize] = useState("17 Charm / 20cm");
  const [giftAddon, setGiftAddon] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const braceletPrice =
    BRACELETS.find((b) => b.id === selected)?.price ?? 250000;
  const total = braceletPrice + (giftAddon ? GIFT_PRICE : 0) + SHIPPING_PRICE;

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const scrollToOrder = () =>
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="lp">
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <a href="/" className="lp-nav__logo">
          <img src={logo} alt="The Cóc Charm" className="lp-nav__img" />
          <span className="lp-nav__name">
            <em>The </em>Cóc Charm
          </span>
        </a>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero__countdown">
          <span>⏱</span>
          <span>
            ƯU ĐÃI GIẢM 25% KẾT THÚC SAU:&nbsp;
            <strong>
              {hh} : {mm} : {ss}
            </strong>
          </span>
        </div>

        <h1 className="lp-hero__heading">
          <span className="lp-hero__heading--navy">Kể Câu Chuyện Của Bạn</span>
          <span className="lp-hero__heading--orange">Qua Từng Hạt Charm</span>
        </h1>

        <p className="lp-hero__sub">
          <strong>The Cóc Charm</strong> sẽ giúp bạn lựa chọn vòng tay cơ bản và
          thoả sức kéo thả các hạt charm mang ý nghĩa riêng. Tạo nên một món
          trang sức mang đậm dấu ấn cá nhân của chính bạn hoặc người thương.
        </p>

        <button className="lp-btn lp-btn--primary" onClick={scrollToOrder}>
          KHÁM PHÁ NGAY
        </button>
      </section>

      {/* ── PRODUCT CARDS ──────────────────────────────────────────────────── */}
      <section className="lp-products">
        <h2 className="lp-section-title">
          Mẫu Vòng <span>HOT</span>
        </h2>
        <p className="lp-section-sub">Mỗi hạt Charm chứa đựng một câu chuyện</p>

        <div className="lp-products__grid">
          {BRACELETS.map((b, i) => (
            <div
              key={b.id}
              className={`lp-card ${i === 0 ? "lp-card--featured" : ""}`}
            >
              {i === 0 && <span className="lp-card__badge">BÁN CHẠY NHẤT</span>}
              <div className="lp-card__img-placeholder" />
              <div className="lp-card__body">
                <h3 className="lp-card__name">{b.name}</h3>
                <p className="lp-card__desc">{b.desc}</p>
                <div className="lp-card__pricing">
                  <span className="lp-card__old-price">350.000đ</span>
                  <span className="lp-card__new-price">
                    {formatCurrency(b.price)}
                  </span>
                </div>
                <button
                  className="lp-btn lp-btn--outline"
                  onClick={() => {
                    setSelected(b.id);
                    scrollToOrder();
                  }}
                >
                  CHỌN MẪU NÀY
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom design strip */}
        <div className="lp-products__custom">
          <p className="lp-products__custom-text">
            Bạn cũng có thể <strong>tự tay lựa chọn từng chiếc Charm</strong>
            <br />
            để trang trí lên chiếc vòng tay của mình!
          </p>
          <button className="lp-btn lp-btn--primary">TỰ THIẾT KẾ</button>
        </div>
      </section>

      {/* ── WHY US ─────────────────────────────────────────────────────────── */}
      <section className="lp-why">
        <div className="lp-why__inner">
          <div className="lp-why__content">
            <h2 className="lp-why__title">
              Tại sao phụ kiện truyền thống không còn đủ?
            </h2>

            <div className="lp-why__features">
              <div className="lp-why__feature">
                <span className="lp-why__icon">👤</span>
                <div>
                  <h4>Cá Nhân Hóa Cực Cao</h4>
                  <p>
                    Không có hai chiếc vòng nào giống hệt nhau. Bạn tự do lắp
                    ghép các "mắt xích" đại diện cho đam mê, ngành học, hay câu
                    lạc bộ của chính mình.
                  </p>
                </div>
              </div>

              <div className="lp-why__feature">
                <span className="lp-why__icon">🛡</span>
                <div>
                  <h4>Chất Liệu Cao Cấp, Bền Bỉ</h4>
                  <p>
                    Sử dụng Thép Không Gỉ (Stainless Steel) chống nước, chống mờ
                    hỏi. Khác biệt hoàn toàn với trang sức mỳ ký dễ han gỉ trên
                    thị trường.
                  </p>
                </div>
              </div>

              <div className="lp-why__feature">
                <span className="lp-why__icon">🏠</span>
                <div>
                  <h4>Bản Sắc Cộng Đồng</h4>
                  <p>
                    Các thiết kế charm độc quyền như logo trường, linh vật Cóc,
                    hay thuật ngữ nội bộ. Một "chứng nhận" đích thực của thần
                    dân nhà F.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lp-why__img-placeholder" />
        </div>
      </section>

      {/* ── ORDER FORM ─────────────────────────────────────────────────────── */}
      <section className="lp-order" id="order">
        <h2 className="lp-section-title">
          Bắt Đầu <span>Hành Trình</span> Của Bạn
        </h2>
        <p className="lp-section-sub">
          🔥 Điền thông tin ngay để giữ ưu đãi giảm 25%
        </p>

        <div className="lp-order__stock-badge">
          CHỈ CÒN DUY NHẤT 27 BỘ CUỐI CÙNG
        </div>

        <div className="lp-order__card">
          <div className="lp-order__cols">
            {/* Left col */}
            <div className="lp-order__col">
              <h3 className="lp-order__col-title">1. CHỌN MẪU VÒNG</h3>

              <label className="lp-order__field-label">Chọn mẫu vòng</label>
              <div className="lp-order__radios">
                {BRACELETS.map((b) => (
                  <label
                    key={b.id}
                    className={`lp-order__radio-row ${selected === b.id ? "lp-order__radio-row--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="bracelet"
                      value={b.id}
                      checked={selected === b.id}
                      onChange={() => setSelected(b.id)}
                    />
                    <span className="lp-order__radio-name">{b.name}</span>
                    <span className="lp-order__radio-price">
                      {formatCurrency(b.price)}
                    </span>
                  </label>
                ))}
              </div>

              <label
                className="lp-order__field-label"
                style={{ marginTop: "1rem" }}
              >
                Kích cỡ vòng (Size)
              </label>
              <select
                className="lp-order__select"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <label
                className="lp-order__field-label"
                style={{ marginTop: "1rem" }}
              >
                Mua kèm hộp da
              </label>
              <label
                className={`lp-order__checkbox-row ${giftAddon ? "lp-order__checkbox-row--active" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={giftAddon}
                  onChange={(e) => setGiftAddon(e.target.checked)}
                />
                <span>Gói quà + thiệp</span>
                <span className="lp-order__addon-price">
                  + {formatCurrency(GIFT_PRICE)}
                </span>
              </label>
            </div>

            {/* Right col */}
            <div className="lp-order__col">
              <h3 className="lp-order__col-title">2. THÔNG TIN NHẬN HÀNG</h3>

              <label className="lp-order__field-label">
                Họ và tên người nhận{" "}
                <span className="lp-order__required">*</span>
              </label>
              <input
                className="lp-order__input"
                type="text"
                name="name"
                placeholder="Ví dụ: Trần Văn A"
                value={form.name}
                onChange={handleFormChange}
              />

              <label className="lp-order__field-label">
                Số điện thoại <span className="lp-order__required">*</span>
              </label>
              <input
                className="lp-order__input"
                type="tel"
                name="phone"
                placeholder="Ví dụ: 012345679"
                value={form.phone}
                onChange={handleFormChange}
              />

              <label className="lp-order__field-label">
                Địa chỉ nhận hàng <span className="lp-order__required">*</span>
              </label>
              <input
                className="lp-order__input"
                type="text"
                name="address"
                placeholder="Địa chỉ sau khi sắp nhập"
                value={form.address}
                onChange={handleFormChange}
              />

              <label className="lp-order__field-label">
                Ghi chú thêm <span className="lp-order__required">*</span>
              </label>
              <input
                className="lp-order__input"
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
              />

              {/* Price summary */}
              <div className="lp-order__summary">
                <div className="lp-order__summary-row">
                  <span>Vòng tay</span>
                  <span>{formatCurrency(braceletPrice)}</span>
                </div>
                {giftAddon && (
                  <div className="lp-order__summary-row">
                    <span>Gói quà + thiệp</span>
                    <span>{formatCurrency(GIFT_PRICE)}</span>
                  </div>
                )}
                <div className="lp-order__summary-row">
                  <span>Phí vận chuyển COD</span>
                  <span>{formatCurrency(SHIPPING_PRICE)}</span>
                </div>
                <div className="lp-order__summary-row lp-order__summary-row--total">
                  <span>TỔNG THANH TOÁN</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button className="lp-btn lp-btn--primary lp-btn--full">
                THÊM VÀO GIỎ HÀNG
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
