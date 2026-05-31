import React from "react";
import logo from "../assets/ic.png";
import "./Footer.css";

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61590667133720',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8.5V7c0-.8.5-1.5 1.6-1.5H18V2h-2.8C12.4 2 11 3.6 11 6.3v2.2H8v3.5h3V22h3.5v-10h2.8l.7-3.5H14z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10A4.5 4.5 0 0 1 17 21.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5zm0 2A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10A2.5 2.5 0 0 0 19.5 17V7A2.5 2.5 0 0 0 17 4.5H7z" fill="currentColor" />
        <path d="M12 7.2A4.8 4.8 0 1 1 12 16.8A4.8 4.8 0 0 1 12 7.2zm0 2A2.8 2.8 0 1 0 12 14.8A2.8 2.8 0 0 0 12 9.2zm5.1-2.65a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0z" fill="currentColor" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <img src={logo} alt="The Cóc Charm" />
          <p>
            Định cao trang sức cá nhân hóa. Chế tác tinh xảo, lưu giữ những câu
            chuyện và kỷ niệm quý giá qua từng mắt xích.
          </p>
        </div>

        <div className="footer-column">
          <h3>Thông Tin Liên Hệ</h3>
          <p>
            Đại học FPT, Khu CNC
            <br />
            Hòa Lạc, Thạch Thất, Hà Nội
          </p>
          <p>0976 924 958</p>
          <p>Thecoccharm@gmail.com</p>
        </div>

        <div className="footer-column">
          <h3>Chính Sách</h3>
          <ul>
            <li>Bảo hành 1 đổi 1</li>
            <li>Miễn phí vận chuyển</li>
          </ul>
        </div>

        <div className="footer-column">
          <div className="footer-social-head">
            <h3>Kết Nối Với Chúng Tôi</h3>
            <div className="footer-socials" aria-label="Kênh mạng xã hội">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  className="footer-social-link"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 The Cóc Charm. All rights reserved. Designed with ♥.
      </div>
    </footer>
  );
};

export default Footer;
