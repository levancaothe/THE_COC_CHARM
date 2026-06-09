import { useState, useEffect } from "react";
import api from "../services/api";
import CategoryCard from "../components/CategoryCard";
import { getProxyImageUrl } from "../utils/imageProxy";

const CharmListPage = () => {
  const [charms, setCharms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      const { data } = await api.get("/charms?limit=1000");
      setCharms(data.data);
    } catch (error) {
      console.error("Error fetching charms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleInventoryUpdate = () => {
      fetchCategories();
      fetchCharms();
    };

    window.addEventListener('inventory-updated', handleInventoryUpdate);
    return () => window.removeEventListener('inventory-updated', handleInventoryUpdate);
  }, []);

  const getCharmsByCategory = (catId) => {
    return charms.filter(
      (c) =>
        c.category &&
        (c.category._id === catId || c.category === catId) &&
        c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  };

  const handleCategoryClick = (categoryId) => {
    setSearchTerm("");
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
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
        {/* Horizontal scrollable row — swipe/scroll to browse */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            overflowX: "auto",
            overflowY: "hidden",
            gap: "16px",
            paddingBottom: "12px",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--primary-gold) transparent",
            WebkitOverflowScrolling: "touch",
            cursor: "grab",
          }}
          onMouseDown={(e) => {
            const el = e.currentTarget;
            el.dataset.isDown = "true";
            el.dataset.startX = e.pageX - el.offsetLeft;
            el.dataset.scrollLeft = el.scrollLeft;
            el.style.cursor = "grabbing";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.dataset.isDown = "false";
            e.currentTarget.style.cursor = "grab";
          }}
          onMouseUp={(e) => {
            e.currentTarget.dataset.isDown = "false";
            e.currentTarget.style.cursor = "grab";
          }}
          onMouseMove={(e) => {
            const el = e.currentTarget;
            if (el.dataset.isDown !== "true") return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - Number(el.dataset.startX)) * 1.5;
            el.scrollLeft = Number(el.dataset.scrollLeft) - walk;
          }}
        >
          {categories.map((cat) => (
            <div key={cat._id} style={{ flexShrink: 0 }}>
              <CategoryCard
                category={cat}
                onClick={(c) => handleCategoryClick(c._id)}
                isSelected={selectedCategory === cat._id}
              />
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div
            style={{
              maxWidth: "520px",
              margin: "28px 0 0",
              textAlign: "left",
            }}
          >
            <label
              htmlFor="charm-search"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              Tìm kiếm charm
            </label>
            <input
              id="charm-search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên charm..."
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                background: "var(--white)",
                color: "var(--text)",
                font: "inherit",
                outline: "none",
              }}
            />
          </div>
        )}
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
                  src={getProxyImageUrl(charm.image)}
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
                    minHeight: "36px",
                    margin: "10px 0 0",
                    color: "var(--text-h)",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    lineHeight: "1.25",
                  }}
                >
                  {charm.name}
                </p>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--primary-gold)",
                    fontWeight: "700",
                    marginTop: "6px",
                  }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    currencyDisplay: "code",
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
