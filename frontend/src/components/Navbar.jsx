import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import logo from "../assets/ic.png";
import "./Navbar.css";

const Navbar = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="logo-container">
          <img src={logo} alt="The Cóc Charm" className="navbar-logo" />
          <span className="logo-text">The Cóc Charm</span>
        </Link>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
          </li>
          <li>
            <NavLink to="/charms">Sản phẩm</NavLink>
          </li>
          <li>
            <NavLink to="/collections">Bộ Sưu Tập</NavLink>
          </li>
          <li>
            <NavLink to="/about-us">About us</NavLink>
          </li>
          <li>
            <NavLink to="/policy">Chính sách</NavLink>
          </li>
          <li>
            <NavLink to="/orders">Tra cứu</NavLink>
          </li>
          <li>
            <NavLink to="/designer">Thiết kế ngay</NavLink>
          </li>
          <li>
            <NavLink to="/my-designs">Mẫu của tôi</NavLink>
          </li>
        </ul>
        <div className="nav-actions">
          <button className="cart-icon-btn" onClick={() => navigate("/cart")}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="cart-svg"
            >
              <path
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
