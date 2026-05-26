import React from "react";
import logo from "../assets/ic.png";
import "./Footer.css";

const socialLinks = [
  {
    name: 'Facebook',
    href: '#',
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
  {
    name: 'TikTok',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 3.5c.4 2.5 1.8 4.1 4 4.4V11c-1.5 0-2.8-.4-4-1.2V17a5.5 5.5 0 1 1-5.5-5.5c.2 0 .4 0 .5.1V15a2.5 2.5 0 1 0 1.8 2.4V3.5H14z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 9H3v12h3.5V9zM4.75 3.5A2.25 2.25 0 1 0 4.75 8a2.25 2.25 0 0 0 0-4.5zM21 21h-3.5v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.3-.1.2-.1.5-.1.8V21h-3.5V9H14v1.7c.5-.8 1.5-1.9 3.6-1.9 2.6 0 4.4 1.7 4.4 5.3V21z" fill="currentColor" />
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
          <h3>Kết Nối Với Chúng Tôi</h3>
          <div className="footer-socials" aria-label="Kênh mạng xã hội">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                className="footer-social-link"
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
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
