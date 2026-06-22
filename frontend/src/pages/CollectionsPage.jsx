import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "./CollectionsPage.css";
import "./MyDesignsPage.css";
import comingSoonImg from "../assets/coming_soon.jpg";
import CollectionInfoModal from "../components/CollectionInfoModal";
import LoadingSpinner from "../components/LoadingSpinner";
import CollectionCharmPreview from "../components/CollectionCharmPreview";

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);

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
    return `${new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(Number(price) || 0)} VND`;
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
        <LoadingSpinner message="Đang tải danh sách..." minHeight="300px" />
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
                        <span
                          onClick={() => setSelectedCollection(item)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "0.8rem",
                            color: "#d95c14",
                            cursor: "pointer",
                            fontWeight: "700",
                            marginTop: "6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px",
                            transition: "opacity 0.2s"
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = "0.8"}
                          onMouseLeave={(e) => e.target.style.opacity = "1"}
                        >
                          Chi tiết →
                        </span>
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
                        height: "160px",
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
                        <span
                          onClick={() => setSelectedCollection(item)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "0.8rem",
                            color: "#d95c14",
                            cursor: "pointer",
                            fontWeight: "700",
                            marginTop: "6px",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px",
                            transition: "opacity 0.2s"
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = "0.8"}
                          onMouseLeave={(e) => e.target.style.opacity = "1"}
                        >
                          Chi tiết →
                        </span>
                      </div>
                      <span>{item.charms?.length || 0} hạt</span>
                    </div>

                    <CollectionCharmPreview
                      charms={item.charms || []}
                      ariaLabel={`Preview ${item.name}`}
                    />

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
      <CollectionInfoModal
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
        collection={selectedCollection}
      />
    </div>
  );
};

export default CollectionsPage;
