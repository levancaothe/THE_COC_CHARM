import React from "react";
import logo from "../assets/ic.png";
import "./Footer.css";

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
          <p>Fbrickss@gmail.com</p>
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
            <span>f</span>
            <span>t</span>
            <span>◎</span>
            <span>in</span>
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
