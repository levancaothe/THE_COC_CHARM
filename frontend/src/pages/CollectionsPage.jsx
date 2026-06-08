import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "./CollectionsPage.css";

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assuming your CartContext provides an addToCart function
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await api.get("/collections");
        setCollections(response.data.collections || []);
      } catch (error) {
        console.error("Lỗi khi tải bộ sưu tập:", error);
      } finally {
        loading(false);
      }
    };

    fetchCollections();
  }, []);

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = (collection) => {
    // Safety guard clause to protect backend/state data integrity
    if (collection.status === "coming soon") return;

    addToCart({
      id: collection._id,
      name: collection.name,
      price: collection.price,
      image: collection.image,
      quantity: 1,
      charms: collection.charms || [],
      type: "collection", // Helps distinguish from custom designs in the cart
    });
    alert("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="collections-page container">
      <div className="collections-header">
        <h1>Bộ Sưu Tập Nổi Bật</h1>
        <p>
          Khám phá các mẫu vòng tay được thiết kế sẵn đầy tinh tế, sẵn sàng đồng
          hành cùng bạn.
        </p>
      </div>

      {loading ? (
        <div className="loading">Đang tải danh sách...</div>
      ) : collections.length === 0 ? (
        <div className="empty-state">Hiện tại chưa có mẫu vòng nào.</div>
      ) : (
        <div className="collections-grid">
          {collections.map((item) => {
            const isComingSoon = item.status === "coming soon";

            return (
              <div key={item._id} className="collection-card">
                {/* CARD IMAGE CONTAINER */}
                <div className="card-image" style={{ position: "relative" }}>
                  {isComingSoon ? (
                    // Placeholder box instead of item image
                    <div
                      className="coming-soon-placeholder"
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f7",
                        color: "#86868b",
                        fontWeight: "700",
                        fontSize: "1.1rem",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      Sắp ra mắt
                    </div>
                  ) : (
                    <img src={item.image} alt={item.name} />
                  )}
                </div>

                {/* CARD INFO CONTAINER */}
                <div className="card-info">
                  <h3>{item.name}</h3>
                  <p className="description">{item.description}</p>
                  <p className="price">{formatVND(item.price)}</p>

                  {/* ADD TO CART ACTION BUTTON */}
                  <button
                    className={`btn-add-cart ${isComingSoon ? "disabled" : ""}`}
                    onClick={() => handleAddToCart(item)}
                    disabled={isComingSoon}
                    style={
                      isComingSoon
                        ? {
                            backgroundColor: "#d2d2d7",
                            color: "#86868b",
                            cursor: "not-allowed",
                          }
                        : {}
                    }
                  >
                    {isComingSoon ? "Sắp ra mắt" : "Thêm vào giỏ"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
