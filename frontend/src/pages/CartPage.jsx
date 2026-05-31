import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import SuccessModal from "../components/SuccessModal";
import { getItemMaxQuantity } from "../utils/inventory";
import "./CartPage.css";

const formatVnd = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(value || 0)} VND`;

const CartPage = () => {
  const {
    cartItems,
    toggleSelection,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
    addToCart,
  } = useCart();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    addressLine: "",
    district: "",
    city: "",
    note: "",
  });

  // 🟢 STATE: Default to PayOS (which we will label as "Chuyển khoản")
  const [paymentMethod, setPaymentMethod] = useState("PayOS");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const checkoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedItems = useMemo(
    () => cartItems.filter((item) => item.selected),
    [cartItems],
  );
  const hasSelectedItems = selectedItems.length > 0;
  const getCanIncreaseQuantity = (item) => {
    const maxQuantity = getItemMaxQuantity(item);
    return !Number.isFinite(maxQuantity) || item.quantity < maxQuantity;
  };

  useEffect(() => {
    if (
      location.state?.focusCheckout &&
      checkoutRef.current &&
      hasSelectedItems
    ) {
      checkoutRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location.state, hasSelectedItems]);

  const shippingAddress = [
    customerInfo.addressLine,
    customerInfo.district,
    customerInfo.city,
    customerInfo.note ? `Ghi chú: ${customerInfo.note}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const buildInventoryImpact = (items = []) => {
    const impactMap = new Map();

    items.forEach((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);

      if (item.type === "design") {
        (item.charms || []).forEach((charm) => {
          const charmId = String(charm?._id ?? charm?.charm?._id ?? "");
          if (!charmId) return;
          impactMap.set(charmId, (impactMap.get(charmId) || 0) + quantity);
        });
        return;
      }

      const charmId = String(item._id || "");
      if (!charmId) return;
      impactMap.set(charmId, (impactMap.get(charmId) || 0) + quantity);
    });

    return [...impactMap.entries()].map(([charmId, quantity]) => ({
      charmId,
      quantity,
    }));
  };

  const handleFieldChange = (field, value) => {
    setCustomerInfo((current) => ({ ...current, [field]: value }));
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (!hasSelectedItems) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    if (
      !customerInfo.name.trim() ||
      !customerInfo.phone.trim() ||
      !customerInfo.addressLine.trim()
    ) {
      alert("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng!");
      return;
    }

    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(customerInfo.phone.trim())) {
      alert("Vui lòng nhập số điện thoại Việt Nam hợp lệ (VD: 0912345678)!");
      return;
    }

    setIsSubmitting(true);
    try {
      const buildDesignCharmDetails = (item) =>
        (item.charms || []).map((charm) => ({
          _id: String(charm?._id ?? charm?.charm?._id ?? ""),
          name: charm?.name || charm?.charm?.name || "",
          image: charm?.image || charm?.charm?.image || "",
          price: Number(charm?.price ?? charm?.charm?.price) || 0,
          stock: Number(charm?.stock ?? charm?.charm?.stock) || 0,
          category: charm?.category || charm?.charm?.category || null,
        }));

      const orderPayload = {
        items: selectedItems.map((item) => ({
          product: String(item._id),
          productType: item.type === "design" ? "BraceletDesign" : "Charm",
          designCharms:
            item.type === "design"
              ? (item.charms || []).map((charm) =>
                  String(charm?._id ?? charm?.charm?._id ?? ""),
                )
              : [],
          designCharmDetails:
            item.type === "design" ? buildDesignCharmDetails(item) : [],
          quantity: item.quantity,
          price: item.price,
        })),
        inventoryImpact: buildInventoryImpact(selectedItems),
        totalPrice,
        customerInfo: {
          name: customerInfo.name.trim(),
          phone: customerInfo.phone.trim(),
          email: customerInfo.email.trim(),
          address: shippingAddress,
          addressLine: customerInfo.addressLine.trim(),
          district: customerInfo.district.trim(),
          city: customerInfo.city.trim(),
          note: customerInfo.note.trim(),
        },
        paymentInfo: {
          method: paymentMethod,
          status: paymentMethod === "Cash" ? "PendingTransfer" : "Unpaid",
        },
      };

      const response = await api.post("/orders", orderPayload);
      console.log("TRẢ VỀ TỪ BACKEND:", response);
      // 🟢 REDIRECT TO PAYOS IF THEY CHOSE CHUYỂN KHOẢN
      if (paymentMethod === "PayOS" && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
        return;
      }

      // If it's Cash, continue normally
      window.dispatchEvent(new Event("inventory-updated"));
      setShowSuccessModal(true);

      selectedItems.forEach((item) => removeFromCart(item._id, item.type));
      setCustomerInfo({
        name: "",
        phone: "",
        email: "",
        addressLine: "",
        district: "",
        city: "",
        note: "",
      });
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert(
        "Lỗi khi đặt hàng: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`cart-page fade-in ${cartItems.length === 0 ? "cart-empty-page" : ""}`}
      >
        {cartItems.length === 0 ? (
          <div className="cart-empty-card">
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Hãy chọn cho mình những hạt charm phù hợp nhất.</p>
            <Link to="/charms">Bắt đầu mua sắm</Link>
          </div>
        ) : (
          <div className="cart-wrap">
            <h1>Giỏ hàng ({cartItems.length} sản phẩm)</h1>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <article
                  key={`${item._id}-${item.type}`}
                  className={`cart-item ${item.selected ? "selected" : ""}`}
                >
                  <div className="item-checkbox">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelection(item._id, item.type)}
                      aria-label={`Chọn ${item.name}`}
                    />
                  </div>

                  <div className="item-image">
                    {item.type === "design" && item.charms ? (
                      <div className="design-preview">
                        {item.charms.map((charm, index) => (
                          <img
                            key={`${charm._id || charm.name}-${index}`}
                            src={
                              charm.image || "https://via.placeholder.com/50"
                            }
                            alt=""
                            className="design-charm-mini"
                            title={charm.name}
                          />
                        ))}
                      </div>
                    ) : (
                      <img
                        src={item.image || "https://via.placeholder.com/100"}
                        alt={item.name}
                      />
                    )}
                  </div>

                  <div className="item-details">
                    <span className="item-type">
                      {item.type === "design"
                        ? "Vòng tay thiết kế"
                        : "Hạt Charm lẻ"}
                    </span>
                    <h3>{item.name}</h3>
                    <p className="item-price-unit">{formatVnd(item.price)}</p>
                  </div>

                  <div className="item-quantity">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id, item.type, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item._id, item.type, item.quantity + 1)
                      }
                      disabled={!getCanIncreaseQuantity(item)}
                      title={
                        getCanIncreaseQuantity(item)
                          ? "Tăng số lượng"
                          : "Đã đạt số lượng tối đa theo tồn kho"
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <p>{formatVnd(item.price * item.quantity)}</p>
                  </div>

                  <div className="item-actions">
                    {item.type === "design" && (
                      <button
                        className="btn-edit"
                        type="button"
                        onClick={() =>
                          navigate("/designer", {
                            state: {
                              editDesign: {
                                _id: item._id,
                                name: item.name,
                                charms: (item.charms || []).map((charm) => ({
                                  charm,
                                })),
                                totalPrice: item.price,
                                isSaved: item.isSaved ?? false,
                              },
                              source: "cart",
                              returnTo: "/cart",
                            },
                          })
                        }
                        title="Sửa mẫu"
                      >
                        ✎
                      </button>
                    )}
                    <button
                      className="btn-remove"
                      type="button"
                      onClick={() => removeFromCart(item._id, item.type)}
                    >
                      &times;
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-list-actions">
              <Link to="/charms" className="continue-shopping">
                &larr; Tiếp tục mua sắm
              </Link>
              <button className="btn-clear" type="button" onClick={clearCart}>
                Xóa toàn bộ giỏ hàng
              </button>
            </div>

            {hasSelectedItems && (
              <section className="checkout-section" ref={checkoutRef}>
                <form className="checkout-form-card" onSubmit={handleCheckout}>
                  <h2>Thông tin đơn hàng</h2>

                  <fieldset>
                    <legend>Thông tin liên hệ</legend>
                    <div className="form-grid form-grid--two">
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        value={customerInfo.name}
                        onChange={(event) =>
                          handleFieldChange("name", event.target.value)
                        }
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Số điện thoại"
                        value={customerInfo.phone}
                        onChange={(event) =>
                          handleFieldChange("phone", event.target.value)
                        }
                        required
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email (Tùy chọn)"
                      value={customerInfo.email}
                      onChange={(event) =>
                        handleFieldChange("email", event.target.value)
                      }
                    />
                  </fieldset>

                  <fieldset>
                    <legend>Địa chỉ nhận hàng</legend>
                    <input
                      type="text"
                      placeholder="Địa chỉ cụ thể (Số nhà, Tên đường, ...)"
                      value={customerInfo.addressLine}
                      onChange={(event) =>
                        handleFieldChange("addressLine", event.target.value)
                      }
                      required
                    />
                    <div className="form-grid form-grid--two">
                      <input
                        type="text"
                        placeholder="Quận / Huyện"
                        value={customerInfo.district}
                        onChange={(event) =>
                          handleFieldChange("district", event.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Tỉnh / Thành phố"
                        value={customerInfo.city}
                        onChange={(event) =>
                          handleFieldChange("city", event.target.value)
                        }
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Ghi chú thêm cho đơn hàng"
                      value={customerInfo.note}
                      onChange={(event) =>
                        handleFieldChange("note", event.target.value)
                      }
                    />
                  </fieldset>

                  {/* 🟢 THE CLEAN 2-OPTION PAYMENT SECTION WITH FIXED CSS */}
                  <fieldset>
                    <legend>Phương thức thanh toán</legend>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        marginBottom: "15px",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "12px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          value="PayOS"
                          checked={paymentMethod === "PayOS"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          // 🟢 THIS STYLE OVERRIDES THE GLOBAL STRETCHING
                          style={{
                            width: "20px",
                            height: "20px",
                            margin: 0,
                            flexShrink: 0,
                            cursor: "pointer",
                          }}
                        />
                        <strong style={{ textAlign: "left", margin: 0 }}>
                          Chuyển khoản ngân hàng (Quét mã QR tự động)
                        </strong>
                      </label>
                    </div>

                    <div className="payment-box">
                      {paymentMethod === "PayOS" && (
                        <p
                          style={{
                            color: "#2a9d8f",
                            margin: 0,
                            lineHeight: "1.5",
                            textAlign: "left",
                          }}
                        >
                          Hệ thống sẽ chuyển hướng bạn đến cổng thanh toán an
                          toàn để quét mã QR ngay sau khi nhấn xác nhận. Trạng
                          thái đơn hàng sẽ được hệ thống cập nhật hoàn toàn tự
                          động!
                        </p>
                      )}
                    </div>
                  </fieldset>

                  <button
                    type="submit"
                    className="confirm-transfer-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng ✓"}
                  </button>
                </form>

                <aside className="checkout-summary-card">
                  <h2>Đặt hàng</h2>
                  <div className="checkout-summary-lines">
                    {selectedItems.map((item) => (
                      <div
                        className="checkout-summary-line"
                        key={`${item._id}-${item.type}`}
                      >
                        <span>{item.name}</span>
                        <span>{item.quantity}</span>
                        <strong>{formatVnd(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                    <div className="checkout-summary-line checkout-summary-line--shipping">
                      <span>Phí vận chuyển</span>
                      <span />
                      <strong>Miễn phí</strong>
                    </div>
                  </div>
                  <div className="checkout-summary-total">
                    <span>Tổng cộng:</span>
                    <strong>{formatVnd(totalPrice)}</strong>
                  </div>
                  <p className="checkout-note">
                    Sản phẩm được chế tác thủ công, đóng gói trong hộp có kèm
                    thẻ bảo hành chính hãng từ The Cóc Charm.
                  </p>
                </aside>
              </section>
            )}
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Đặt Hàng Thành Công!"
        message="Cảm ơn bạn đã lựa chọn The Cốc Charm. Đơn hàng của bạn đang được xử lý."
      />
    </>
  );
};

export default CartPage;
