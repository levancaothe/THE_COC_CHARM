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
    // You may need to map the collection data to match your cart item structure
    addToCart({
      id: collection._id,
      name: collection.name,
      price: collection.price,
      image: collection.image,
      quantity: 1,
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
          {collections.map((item) => (
            <div key={item._id} className="collection-card">
              <div className="card-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="card-info">
                <h3>{item.name}</h3>
                <p className="description">{item.description}</p>
                <p className="price">{formatVND(item.price)}</p>
                <button
                  className="btn-add-cart"
                  onClick={() => handleAddToCart(item)}
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
