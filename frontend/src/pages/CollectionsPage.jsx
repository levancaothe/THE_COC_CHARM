import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "./CollectionsPage.css";
import "./MyDesignsPage.css";
import comingSoonImg from "../assets/coming_soon.jpg";

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
        // BUG FIX: Changed loading(false) to setLoading(false)
        setLoading(false);
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
      _id: collection._id,
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
        <div className="my-designs-grid" style={{ marginTop: "24px" }}>
          {collections.map((item) => {
            const isComingSoon = item.status === "coming soon";

            return (
              <article key={item._id} className="my-design-card">
                {isComingSoon ? (
                  <>
                    <div className="my-design-card__head" style={{ borderBottom: "none", paddingBottom: 0 }}>
                      <div>
                        <h2 style={{ margin: 0 }}>{item.name}</h2>
                      </div>
                    </div>

                    <div
                      className="my-design-preview coming-soon-preview"
                      aria-label={`Preview ${item.name}`}
                      style={{
                        padding: 0,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f7",
                        height: "260px",
                        border: "none",
                      }}
                    >
                      <img
                        src={comingSoonImg}
                        alt="Sắp ra mắt"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="my-design-card__head">
                      <div>
                        <h2>{item.name}</h2>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#4b647c",
                            margin: "4px 0 0",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.description || "Bộ sưu tập thiết kế sẵn"}
                        </p>
                      </div>
                      <span>{item.charms?.length || 0} hạt</span>
                    </div>

                    <div className="my-design-preview" aria-label={`Preview ${item.name}`}>
                      <div className="my-design-band">
                        {(item.charms || []).map((c, index) => {
                          const charmObj = c.charm || c;
                          return (
                            <img
                              key={`${charmObj?._id || index}`}
                              src={charmObj?.image}
                              alt=""
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="my-design-card__foot">
                      <strong>{formatVND(item.price)}</strong>
                      <div className="my-design-actions">
                        <button
                          className="my-design-add"
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          style={{
                            flex: "1",
                          }}
                        >
                          Thêm vào giỏ hàng
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
