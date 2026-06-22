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
    clearCart,
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

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [selectedItems],
  );

  // Discount states
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const appliedDiscountMode = useMemo(() => {
    if (!appliedDiscount) return null;
    return appliedDiscount.code ? "code" : "auto";
  }, [appliedDiscount]);

  const validateDiscount = async (codeToValidate) => {
    if (!hasSelectedItems) {
      setAppliedDiscount(null);
      setDiscountAmount(0);
      setDiscountError("");
      return;
    }
    setIsApplying(true);
    setDiscountError("");
    try {
      const response = await api.post("/discounts/validate", {
        code: codeToValidate,
        subtotal: subtotal,
      });
      if (response.data.valid) {
        setAppliedDiscount(response.data.discount);
        setDiscountAmount(response.data.discountAmount);
      } else {
        if (codeToValidate) {
          setDiscountError(response.data.message || "Mã giảm giá không hợp lệ");
          setAppliedDiscount(null);
          setDiscountAmount(0);
        } else {
          setAppliedDiscount(null);
          setDiscountAmount(0);
        }
      }
    } catch (err) {
      console.error("Lỗi xác thực mã giảm giá:", err);
      setDiscountError(err.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng");
      setAppliedDiscount(null);
      setDiscountAmount(0);
    } finally {
      setIsApplying(false);
    }
  };

  useEffect(() => {
    if (appliedDiscount && appliedDiscount.code) {
      validateDiscount(appliedDiscount.code);
    } else {
      validateDiscount("");
    }
  }, [subtotal, hasSelectedItems]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      alert("Vui lòng nhập đúng mã giảm giá, bao gồm cả chữ hoa/chữ thường.");
      return;
    }
    validateDiscount(couponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    validateDiscount("");
  };

  const getCanIncreaseQuantity = (item) => {
    const maxQuantity = getItemMaxQuantity(item);
    return !Number.isFinite(maxQuantity) || item.quantity < maxQuantity;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isCancelled = params.get("cancel") === "true";
    const orderCode = params.get("orderCode");

    if (isCancelled && orderCode) {
      alert("Bạn đã hủy thanh toán đơn hàng!");

      const updateOrderToCancelled = async () => {
        try {
          await api.delete("/orders/cancel-payos-order", {
            data: { orderCode: orderCode },
          });
        } catch (err) {
          console.error("Lỗi khi xóa đơn hàng:", err);
        }
      };

      updateOrderToCancelled();
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

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

      // Account for both custom designs and pre-built collections modifying charm inventory
      if (item.type === "design" || item.type === "collection") {
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
          isPendant: Boolean(charm?.isPendant ?? charm?.charm?.isPendant),
        }));

      const orderPayload = {
        items: selectedItems.map((item) => ({
          product: String(item._id),
          productType:
            item.type === "design"
              ? "BraceletDesign"
              : item.type === "collection"
                ? "Collection"
                : "Charm",
          designCharms:
            item.type === "design" || item.type === "collection"
              ? (item.charms || []).map((charm) =>
                  String(charm?._id ?? charm?.charm?._id ?? ""),
                )
              : [],
          designCharmDetails:
            item.type === "design" || item.type === "collection"
              ? buildDesignCharmDetails(item)
              : [],
          quantity: item.quantity,
          price: item.price,
        })),
        inventoryImpact: buildInventoryImpact(selectedItems),
        totalPrice: subtotal - discountAmount,
        discountCode:
          appliedDiscountMode === "code" ? appliedDiscount.code : null,
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

      if (paymentMethod === "PayOS" && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
        return;
      }

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
      setCouponCode("");
      setAppliedDiscount(null);
      setDiscountAmount(0);
      setDiscountError("");
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
                    {/* Render mini charms for designs & collections, but use cover image for charms */}
                    {(item.type === "design" || item.type === "collection") && item.charms ? (
                      <div className="design-preview">
                        {item.charms.map((c, index) => {
                          const charmObj = c.charm || c;
                          return (
                            <img
                              key={`${charmObj?._id || charmObj?.name || "charm"}-${index}`}
                              src={
                                charmObj?.image || "https://via.placeholder.com/50"
                              }
                              alt=""
                              className="design-charm-mini"
                              title={charmObj?.name}
                            />
                          );
                        })}
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
                        : item.type === "collection"
                          ? "Bộ sưu tập"
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
                    {/* 🌟 NOW CHECKS FOR BOTH DESIGN AND COLLECTION */}
                    {(item.type === "design" || item.type === "collection") && (
                      <button
                        className="btn-edit"
                        type="button"
                        onClick={() =>
                          navigate("/designer", {
                            state: {
                              editDesign: {
                                _id: item._id,
                                name: item.name,
                                // Normalizes charms mapping regardless of how they are structured
                                charms: (item.charms || []).map((charm) => ({
                                  charm: charm?.charm || charm,
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

                  {/* Mã giảm giá Input Field */}
                  <div className="coupon-section" style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px dashed rgba(10, 46, 79, 0.15)" }}>
                    <label style={{ display: "block", fontSize: "0.9rem", color: "#0a2e4f", fontWeight: "600", marginBottom: "8px" }}>
                      Mã giảm giá / Voucher
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="Nhập mã nếu có, để trống nếu dùng KM tự động"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={isApplying}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          border: "1px solid rgba(10, 46, 79, 0.2)",
                          borderRadius: "4px",
                          fontSize: "0.9rem",
                          outline: "none"
                        }}
                      />
                      {appliedDiscountMode === "code" ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#e63946",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.9rem"
                          }}
                        >
                          Hủy
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isApplying || !couponCode.trim()}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#0a2e4f",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            opacity: (isApplying || !couponCode.trim()) ? 0.6 : 1
                          }}
                        >
                          {isApplying ? "..." : "Áp dụng"}
                        </button>
                      )}
                    </div>
                    {discountError && (
                      <p style={{ color: "#e63946", fontSize: "0.8rem", margin: "6px 0 0" }}>
                        {discountError}
                      </p>
                    )}
                    {!appliedDiscount && (
                      <p style={{ color: "#666", fontSize: "0.75rem", margin: "6px 0 0", fontStyle: "italic" }}>
                        💡 Lưu ý: Mã code phải khớp chính xác từng chữ, kể cả hoa/thường.
                      </p>
                    )}
                    {appliedDiscountMode === "auto" && (
                      <p style={{ color: "#2a9d8f", fontSize: "0.85rem", margin: "6px 0 0", fontWeight: "600" }}>
                        ✓ Khuyến mãi tự động đã được áp dụng
                      </p>
                    )}
                    {appliedDiscountMode === "code" && (
                      <p style={{ color: "#2a9d8f", fontSize: "0.85rem", margin: "6px 0 0", fontWeight: "600" }}>
                        ✓ Đã áp dụng: {appliedDiscount.name} (-{appliedDiscount.discountPercent}%)
                      </p>
                    )}
                  </div>

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
                    {discountAmount > 0 && (
                      <div className="checkout-summary-line checkout-summary-line--discount" style={{ color: "#e63946" }}>
                        <span>Giảm giá ({appliedDiscount?.discountPercent}%)</span>
                        <span />
                        <strong>-{formatVnd(discountAmount)}</strong>
                      </div>
                    )}
                  </div>
                  <div className="checkout-summary-total">
                    <span>Tổng cộng:</span>
                    <strong>{formatVnd(subtotal - discountAmount)}</strong>
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
