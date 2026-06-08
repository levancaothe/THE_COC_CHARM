import React, { useState } from "react";
import { useDrag } from "react-dnd";
import CategoryCard from "./CategoryCard";
import { getProxyImageUrl } from "../utils/imageProxy";

const DraggableCharm = ({ charm, selectedCount = 0, onClick }) => {
  const stock = Number(charm?.stock) || 0;
  const remainingStock = Math.max(0, stock - selectedCount);
  const isAvailable = remainingStock > 0;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CHARM",
    item: charm,
    canDrag: () => isAvailable,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="draggable-charm glass"
      onClick={() => {
        if (!isAvailable) return;
        onClick(charm);
      }}
      style={{
        padding: "10px",
        borderRadius: "var(--radius-md)",
        textAlign: "center",
        opacity: isDragging ? 0.5 : 1,
        cursor: isAvailable ? "pointer" : "not-allowed",
        transition: "transform 0.2s ease",
        border: "1px solid transparent",
        width: "100px",
        filter: isAvailable ? "none" : "grayscale(1) opacity(0.55)",
      }}
      onMouseEnter={(e) => {
        if (isAvailable)
          e.currentTarget.style.borderColor = "var(--primary-gold)";
      }}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
    >
      <img
        src={getProxyImageUrl(charm.image)}
        alt={charm.name}
        crossOrigin="anonymous"
        style={{
          width: "60px",
          height: "60px",
          objectFit: "contain",
          margin: "0 auto",
        }}
      />
      <p
        style={{
          minHeight: "34px",
          fontSize: "0.82rem",
          color: "var(--text-h)",
          fontWeight: "700",
          lineHeight: "1.2",
          marginTop: "10px",
        }}
      >
        {charm.name}
      </p>
      <p
        style={{
          fontSize: "0.8rem",
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
      <p
        style={{
          fontSize: "0.72rem",
          color: isAvailable ? "var(--text-muted)" : "#b94d11",
          marginTop: "4px",
        }}
      >
        {isAvailable ? `Còn ${remainingStock}` : "Hết hàng"}
      </p>
    </div>
  );
};

const CharmSidebar = ({
  charms,
  categories = [],
  selectedCharmCounts = {},
  onCharmClick,
}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCharms = selectedEvent
    ? charms.filter(
        (c) =>
          c.category &&
          (c.category._id === selectedEvent._id ||
            c.category === selectedEvent._id) &&
          c.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      )
    : [];

  // Debug logging
  React.useEffect(() => {
    console.log(
      `[CharmSidebar Debug] Total charms: ${charms.length}, Categories: ${categories.length}, Selected event: ${selectedEvent?.name || "None"}, Filtered charms: ${filteredCharms.length}`,
    );
  }, [charms, categories, selectedEvent, filteredCharms]);

  const handleCategoryClick = (category) => {
    setSearchTerm("");
    setSelectedEvent((currentCategory) =>
      currentCategory?._id === category._id ? null : category,
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        width: "100%",
      }}
    >
      {/* Bước 3: Chọn Bộ Charm */}
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
            paddingBottom: "10px",
          }}
        >
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id}
              category={cat}
              isSelected={selectedEvent?._id === cat._id}
              onClick={handleCategoryClick}
            />
          ))}
        </div>

        {selectedEvent && (
          <div
            style={{ maxWidth: "520px", marginTop: "28px", textAlign: "left" }}
          >
            <label
              htmlFor="designer-charm-search"
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
              id="designer-charm-search"
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

      {/* Bước 4: Kéo Thả Charm */}
      {selectedEvent && (
        <div className="fade-in">
          <h3
            style={{
              marginBottom: "15px",
              fontSize: "1.5rem",
              borderLeft: "4px solid var(--primary-gold)",
              paddingLeft: "10px",
            }}
          >
            Kéo Thả Charm
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              overflowX: "auto",
              overflowY: "hidden",
              gap: "15px",
              padding: "10px 0",
              marginTop: "20px",
            }}
          >
            {filteredCharms.map((charm) => (
              <DraggableCharm
                key={charm._id}
                charm={charm}
                selectedCount={selectedCharmCounts[charm._id] || 0}
                onClick={onCharmClick}
              />
            ))}
            {filteredCharms.length === 0 && (
              <div
                style={{
                  fontSize: "1rem",
                  color: "var(--text-muted)",
                  padding: "20px",
                }}
              >
                <p>Không có hạt charm nào thuộc chủ đề này.</p>
                {selectedEvent && (
                  <details
                    style={{
                      marginTop: "10px",
                      fontSize: "0.9rem",
                      opacity: 0.8,
                    }}
                  >
                    <summary>Debug Info</summary>
                    <pre
                      style={{
                        marginTop: "10px",
                        background: "#f0f0f0",
                        padding: "10px",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        overflow: "auto",
                      }}
                    >
                      Total charms loaded: {charms.length}
                      Selected category: {selectedEvent?.name}
                      Charms in this category:{" "}
                      {
                        charms.filter(
                          (c) =>
                            c.category &&
                            (c.category._id === selectedEvent._id ||
                              c.category === selectedEvent._id),
                        ).length
                      }
                      Search term: "{searchTerm}"
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharmSidebar;
