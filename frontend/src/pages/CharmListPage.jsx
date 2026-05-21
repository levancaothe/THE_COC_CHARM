import React, { useState, useEffect } from "react";
import api from "../services/api";
import CategoryCard from "../components/CategoryCard";

const CharmListPage = () => {
  const [charms, setCharms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchCharms();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCharms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/charms?limit=100");
      setCharms(data.data);
    } catch (error) {
      console.error("Error fetching charms:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCharmsByCategory = (catId) => {
    return charms.filter(
      (c) => c.category && (c.category._id === catId || c.category === catId)
    );
  };

  return (
    <div
      className="charm-list-page container fade-in"
      style={{ padding: "60px 20px" }}
    >
      <header style={{ marginBottom: "40px", textAlign: "center" }}>
        <h2 className="section-title">Bộ sưu tập Charm</h2>
      </header>

      {/* Category cards */}
      <div style={{ marginBottom: "50px" }}>
        <h3
          style={{
            marginBottom: "20px",
            fontSize: "1.5rem",
            borderLeft: "4px solid var(--primary-gold)",
            paddingLeft: "10px",
          }}
        >
          Các Chủ Đề Charm
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id}
              category={cat}
              onClick={(c) => setSelectedCategory(c._id === selectedCategory ? null : c._id)}
              isSelected={selectedCategory === cat._id}
            />
          ))}
        </div>
      </div>

      {/* Charm list for selected category */}
      {loading ? (
        <div className="loading-spinner" style={{ margin: "50px auto" }}></div>
      ) : selectedCategory ? (
        <div>
          <h3
            style={{
              marginBottom: "20px",
              fontSize: "1.5rem",
              borderLeft: "4px solid var(--primary-gold)",
              paddingLeft: "10px",
            }}
          >
            {categories.find((c) => c._id === selectedCategory)?.name}
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              overflowX: "auto",
              overflowY: "hidden",
              gap: "15px",
              padding: "10px 0",
            }}
          >
            {getCharmsByCategory(selectedCategory).map((charm) => (
              <div
                key={charm._id}
                className="glass"
                style={{
                  minWidth: "120px",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={`http://localhost:5000/api/proxy/image?url=${encodeURIComponent(charm.image)}`}
                  alt={charm.name}
                  crossOrigin="anonymous"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "contain",
                    margin: "0 auto",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--primary-gold)",
                    fontWeight: "700",
                    marginTop: "10px",
                  }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(charm.price)}
                </p>
              </div>
            ))}
            {getCharmsByCategory(selectedCategory).length === 0 && (
              <p style={{ color: "var(--text-muted)" }}>
                Không có hạt charm nào thuộc chủ đề này.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>
          <p>Chọn một chủ đề để xem các hạt charm.</p>
        </div>
      )}
    </div>
  );
};

export default CharmListPage;
