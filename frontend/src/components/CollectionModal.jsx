import React, { useState, useEffect, useRef, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import html2canvas from "html2canvas";
import api from "../services/api"; // Adjust path if needed
import CharmSidebar from "./CharmSidebar"; // Adjust path to where these components are
import BraceletCanvas from "./BraceletCanvas";
import { usePriceCalculator } from "../hooks/usePriceCalculator";

export default function CollectionModal({ collection, onSave, onClose }) {
  // --- 1. FORM STATE ---
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    image: collection?.image || "",
    price: collection?.price || "",
    description: collection?.description || "",
    status: collection?.status || "available",
  });

  // --- 2. DESIGNER STATE ---
  const [availableCharms, setAvailableCharms] = useState([]);
  const [categories, setCategories] = useState([]);

  const normalizeEditCharm = (entry) => {
    const charm = entry?.charm || entry;
    if (!charm) return null;
    return {
      ...charm,
      instanceId: Math.random().toString(36).substr(2, 9),
      isDefault: false,
    };
  };

  const initialEditCharms = useMemo(() => {
    return collection?.charms
      ? collection.charms.map(normalizeEditCharm).filter(Boolean)
      : [];
  }, [collection]);

  const [selectedCharms, setSelectedCharms] = useState(initialEditCharms);

  // Setup logic: If editing, skip setup. If new, start at null.
  const [capacity, setCapacity] = useState(
    collection?.charms ? initialEditCharms.length : null,
  );
  const [tempCapacity, setTempCapacity] = useState(
    collection?.charms ? initialEditCharms.length || 1 : 10,
  );
  const [wristSize, setWristSize] = useState("");
  const [material, setMaterial] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const designRef = useRef(null);

  const calculatedPrice = usePriceCalculator(selectedCharms);

  const baseCharmKeywords = [
    "cơ bản",
    "co ban",
    "basic",
    "base",
    "mặc định",
    "mac dinh",
    "default",
  ];
  const normalizeText = (value = "") =>
    value
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const getCategoryName = (charm) => {
    if (typeof charm?.category === "object" && charm?.category?.name) {
      return charm.category.name;
    }

    const categoryId = charm?.category?._id || charm?.category;
    return (
      categories.find((category) => category._id === categoryId)?.name || ""
    );
  };
  const isBaseCharm = (charm) => {
    const charmName = normalizeText(charm?.name);
    const categoryName = normalizeText(getCategoryName(charm));
    return baseCharmKeywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return (
        charmName.includes(normalizedKeyword) ||
        categoryName.includes(normalizedKeyword)
      );
    });
  };

  const baseCharmOptions = useMemo(
    () => availableCharms.filter(isBaseCharm),
    [availableCharms, categories],
  );
  const selectedBaseCharm = useMemo(
    () =>
      baseCharmOptions.find((charm) => charm._id === material) ||
      baseCharmOptions[0] ||
      null,
    [baseCharmOptions, material],
  );

  const basePrice =
    (selectedBaseCharm?.price || 0) * (Number(tempCapacity) || 0);

  const getCharmUsageCount = (charmId, charms = selectedCharms) =>
    charms.filter((charm) => charm?._id === charmId).length;

  const selectedCharmCounts = useMemo(() => {
    return selectedCharms.reduce((counts, charm) => {
      if (!charm?._id) return counts;
      counts[charm._id] = (counts[charm._id] || 0) + 1;
      return counts;
    }, {});
  }, [selectedCharms]);

  const canAddCharm = (charm, previewCharms = selectedCharms) => {
    if (!charm?._id) return false;

    const stock = Number(charm.stock);
    if (Number.isFinite(stock) && stock <= 0) return false;

    const defaultCharmIndex = previewCharms.findIndex(
      (current) =>
        current?.isDefault ||
        (selectedBaseCharm && current?._id === selectedBaseCharm._id),
    );

    const currentCount = getCharmUsageCount(charm._id, previewCharms);
    const replacingSameCharm =
      defaultCharmIndex !== -1 &&
      previewCharms[defaultCharmIndex]?._id === charm._id;

    if (
      Number.isFinite(stock) &&
      !replacingSameCharm &&
      currentCount >= stock
    ) {
      return false;
    }

    return true;
  };

  // --- 3. FETCH INVENTORY ---
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [charmsRes, catRes] = await Promise.all([
          api.get("/charms?limit=1000"),
          api.get("/categories"),
        ]);
        setAvailableCharms(charmsRes.data.data);
        setCategories(catRes.data.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu charm:", error);
      }
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    if (baseCharmOptions.length === 0) return;

    const isSelectedMaterialValid = baseCharmOptions.some(
      (charm) => charm._id === material,
    );
    if (!isSelectedMaterialValid) {
      setMaterial(baseCharmOptions[0]._id);
    }
  }, [baseCharmOptions, material]);

  // Set the price input automatically when calculated price changes,
  // but allow admin to override it if they want a discount.
  useEffect(() => {
    if (calculatedPrice > 0 && !collection?.price) {
      setFormData((prev) => ({ ...prev, price: calculatedPrice }));
    }
  }, [calculatedPrice]);

  // --- 4. DESIGNER LOGIC ---
  const fillWithDefaultCharms = (cap, mat) => {
    const defaultCharm =
      baseCharmOptions.find((charm) => charm._id === mat) ||
      baseCharmOptions[0];

    if (defaultCharm) {
      const safeCapacity = Number.isFinite(Number(defaultCharm.stock))
        ? Math.min(cap, Math.max(0, Number(defaultCharm.stock)))
        : cap;

      const initialCharms = Array.from({ length: safeCapacity }).map(() => ({
        ...defaultCharm,
        instanceId: Math.random().toString(36).substr(2, 9),
        isDefault: true,
      }));
      setSelectedCharms(initialCharms);
      return safeCapacity;
    } else {
      setSelectedCharms([]);
      return 0;
    }
  };

  const resizeBraceletToCapacity = (nextCapacity, mat = material) => {
    const desiredCapacity = Math.max(1, Math.floor(Number(nextCapacity) || 1));
    const defaultCharm =
      baseCharmOptions.find((charm) => charm._id === mat) ||
      baseCharmOptions[0];
    const currentCapacity = selectedCharms.length;

    if (desiredCapacity === currentCapacity) {
      return currentCapacity;
    }

    if (desiredCapacity < currentCapacity) {
      setSelectedCharms((prevCharms) => prevCharms.slice(0, desiredCapacity));
      return desiredCapacity;
    }

    if (!defaultCharm) {
      alert("Chưa có charm cơ bản trong cơ sở dữ liệu để mở rộng vòng.");
      return 0;
    }

    if (currentCapacity === 0) {
      return fillWithDefaultCharms(desiredCapacity, mat);
    }

    const defaultCharmUsage = selectedCharms.filter(
      (charm) => charm?.isDefault || charm?._id === defaultCharm._id,
    ).length;
    const stock = Number(defaultCharm.stock);
    const remainingStock = Number.isFinite(stock)
      ? Math.max(0, stock - defaultCharmUsage)
      : Infinity;
    const additionalNeeded = desiredCapacity - currentCapacity;

    if (Number.isFinite(remainingStock) && additionalNeeded > remainingStock) {
      alert(
        `Chỉ còn ${remainingStock} hạt "${defaultCharm.name}" khả dụng để mở rộng vòng.`,
      );
      return 0;
    }

    setSelectedCharms((prevCharms) => [
      ...prevCharms,
      ...Array.from({ length: additionalNeeded }).map(() => ({
        ...defaultCharm,
        instanceId: Math.random().toString(36).substr(2, 9),
        isDefault: true,
      })),
    ]);
    return desiredCapacity;
  };

  const handleWristSizeChange = (e) => {
    const size = e.target.value;
    setWristSize(size);
    const parsedSize = parseFloat(size);
    if (!isNaN(parsedSize) && parsedSize > 0) {
      const recommendedCharms = Math.round(parsedSize / 0.9);
      setTempCapacity(recommendedCharms);
    }
  };

  const handleStartDesign = () => {
    const nextCapacity = resizeBraceletToCapacity(tempCapacity, material);
    if (nextCapacity > 0) {
      setCapacity(nextCapacity);
    }
  };

  const addCharm = (charm) => {
    setSelectedCharms((prevCharms) => {
      const newCharmInstance = {
        ...charm,
        instanceId: Math.random().toString(36).substr(2, 9),
      };

      if (!canAddCharm(charm, prevCharms)) {
        alert(`"${charm.name}" đã hết hoặc không đủ số lượng khả dụng.`);
        return prevCharms;
      }

      const defaultCharmIndex = prevCharms.findIndex(
        (c) =>
          c.isDefault || (selectedBaseCharm && c._id === selectedBaseCharm._id),
      );

      if (defaultCharmIndex !== -1) {
        const newCharms = [...prevCharms];
        newCharms[defaultCharmIndex] = newCharmInstance;
        return newCharms;
      }

      if (prevCharms.length >= capacity) {
        alert(`Vòng tay này chỉ chứa được tối đa ${capacity} hạt charm!`);
        return prevCharms;
      }
      return [...prevCharms, newCharmInstance];
    });
  };

  const moveCharmInSequence = (dragIndex, hoverIndex) => {
    setSelectedCharms((prevCharms) => {
      const newCharms = [...prevCharms];
      const dragCharm = newCharms[dragIndex];
      newCharms.splice(dragIndex, 1);
      newCharms.splice(hoverIndex, 0, dragCharm);
      return newCharms;
    });
  };

  const removeCharm = (index) => {
    setSelectedCharms((prevCharms) => {
      const newCharms = [...prevCharms];
      const defaultCharm = selectedBaseCharm || baseCharmOptions[0];

      if (defaultCharm) {
        newCharms[index] = {
          ...defaultCharm,
          instanceId: Math.random().toString(36).substr(2, 9),
          isDefault: true,
        };
      } else {
        newCharms.splice(index, 1);
      }

      return newCharms;
    });
  };

  const replaceCharm = (index, newCharm) => {
    setSelectedCharms((prevCharms) => {
      const updatedCharms = [...prevCharms];
      updatedCharms[index] = {
        ...newCharm,
        instanceId: Math.random().toString(36).substr(2, 9),
      };
      return updatedCharms;
    });
  };

  // --- 5. SUBMIT & SCREENSHOT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCharms.length === 0)
      return alert("Cần có ít nhất 1 charm trong bộ sưu tập!");

    setIsSaving(true);
    try {
      let finalImage = formData.image;

      // Take screenshot if canvas is rendered
      if (designRef.current) {
        const canvas = await html2canvas(designRef.current, {
          useCORS: true,
          backgroundColor: "#ffffff",
          scale: 2,
        });
        finalImage = canvas.toDataURL("image/png"); // The Base64 string for your backend
      }

      const charmIds = selectedCharms.map((c) => c._id);

      // Trigger the parent save function, passing our super-charged data
      await onSave({
        ...formData,
        image: finalImage,
        charms: charmIds,
        price: Number(formData.price), // Ensure price is a number
      });
    } catch (error) {
      console.error("Screenshot or save failed:", error);
      alert("Lỗi khi lưu bộ sưu tập!");
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "85vw",
          maxWidth: "1400px",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="modal-header"
          style={{
            flexShrink: 0,
            borderBottom: "1px solid #eee",
            paddingBottom: "15px",
          }}
        >
          <h3>{collection ? "Chỉnh Sửa Bộ Sưu Tập" : "Tạo Bộ Sưu Tập Mới"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* SETUP PHASE */}
        {capacity === null ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              backgroundColor: "#f5f8fb",
              padding: "40px 24px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(90deg, #d95c14 0 33%, #b75a1c 33% 66%, #0a2e4f 66% 100%) top left / 100% 6px no-repeat, #fff",
                border: "1.5px solid #d95c14",
                color: "#0a2e4f",
                maxWidth: "500px",
                width: "100%",
                padding: "36px 48px",
                borderRadius: "4px",
                boxShadow: "0 10px 30px rgba(10, 46, 79, 0.08)",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  color: "#0a2e4f",
                  fontFamily: "var(--serif)",
                  fontSize: "1.7rem",
                  marginBottom: "20px",
                  fontWeight: "bold",
                }}
              >
                Thiết lập vòng cơ bản
              </h2>
              <div style={{ textAlign: "left" }}>
                <div className="form-group">
                  <label style={{ color: "#4b647c", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Chu vi tay (cm) - Tùy chọn</label>
                  <input
                    type="number"
                    value={wristSize}
                    onChange={handleWristSizeChange}
                    placeholder="VD: 16"
                    style={{
                      border: "1.5px solid #d95c14",
                      borderRadius: "0",
                      height: "40px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: "#4b647c", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Số lượng hạt (Capacity)</label>
                  <input
                    type="number"
                    value={tempCapacity}
                    onChange={(e) => setTempCapacity(Number(e.target.value))}
                    style={{
                      border: "1.5px solid #d95c14",
                      borderRadius: "0",
                      height: "40px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: "#4b647c", fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>Chất liệu dây cơ bản</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    style={{
                      width: "100%",
                      height: "40px",
                      padding: "0 12px",
                      borderRadius: "0",
                      border: "1.5px solid #d95c14",
                      background: "#fff",
                      color: "#0a2e4f",
                      outline: "none",
                      fontSize: "14px",
                    }}
                    disabled={baseCharmOptions.length === 0}
                  >
                    <option value="" disabled>
                      -- Chọn dây cơ bản --
                    </option>
                    {baseCharmOptions.map((charm) => (
                      <option key={charm._id} value={charm._id}>
                        {charm.name} (
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          currencyDisplay: "code",
                        }).format((charm.price || 0) * (Number(tempCapacity) || 0))}
                        )
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    background: "#d95c14",
                    color: "#fff",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    height: "44px",
                    borderRadius: "0",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={handleStartDesign}
                >
                  Bắt đầu thiết kế
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* DESIGN & FORM PHASE */
          <div
            style={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
              marginTop: "10px",
            }}
          >
            {/* LEFT SIDE: The Visual Canvas */}
            <div
              style={{
                flex: "1 1 60%",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                paddingRight: "20px",
                borderRight: "1px solid #eee",
              }}
            >
              <DndProvider backend={HTML5Backend}>
                <div
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#ffffff", // Crucial: prevents charms from bleeding through underneath
                    paddingTop: "5px", // Optional: adds a tiny bit of breathing room at the top
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                      padding: "10px 14px",
                      background: "#fff4ee",
                      borderLeft: "4px solid #d95c14",
                      borderRadius: "2px",
                    }}
                  >
                    <p style={{ margin: 0, color: "#0a2e4f", fontWeight: "600", fontSize: "0.95rem" }}>
                      Sức chứa:{" "}
                      <strong style={{ color: "#d95c14", fontSize: "1.1rem" }}>
                        {selectedCharms.length} / {capacity}
                      </strong>{" "}
                      hạt charm
                    </p>
                    <button
                      type="button"
                      onClick={() => setCapacity(null)}
                      style={{
                        fontSize: "0.82rem",
                        color: "#d95c14",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Thay đổi số lượng
                    </button>
                  </div>
                  <BraceletCanvas
                    ref={designRef}
                    selectedCharms={selectedCharms}
                    onAddCharm={addCharm}
                    moveCharmInSequence={moveCharmInSequence}
                    onRemoveCharm={removeCharm}
                    onReplaceCharm={replaceCharm}
                    exportMode={isSaving} // Hides UI elements during screenshot
                  />
                </div>
                {/* The Sidebar mapped right below or next to it */}
                <div
                  style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}
                >
                  <h4 style={{ color: "var(--admin-text)", marginBottom: "15px", fontFamily: "var(--heading)", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Chọn Charm để thiết kế:
                  </h4>
                  <CharmSidebar
                    charms={availableCharms}
                    categories={categories}
                    selectedCharmCounts={selectedCharmCounts}
                    onCharmClick={addCharm}
                  />
                </div>
              </DndProvider>
            </div>

            {/* RIGHT SIDE: The Form */}
            <div
              style={{
                flex: "1 1 40%",
                paddingLeft: "20px",
                overflowY: "auto",
              }}
            >
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div className="form-group">
                  <label>Tên Bộ Sưu Tập *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giá Bán (VND) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                  <small style={{ color: "#d95c14", fontWeight: "600", marginTop: "4px", display: "block" }}>
                    Giá nguyên liệu ước tính: {calculatedPrice.toLocaleString()} VND
                  </small>
                </div>

                <div className="form-group">
                  <label>Mô tả ngắn gọn</label>
                  <textarea
                    rows="5"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={{
                      resize: "vertical",
                      minHeight: "100px",
                    }}
                  />
                </div>

                <div className="form-group" style={{ marginTop: "15px" }}>
                  <label>Trạng thái (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    <option value="available">Đang bán (Available)</option>
                    <option value="coming soon">
                      Sắp ra mắt (Coming Soon)
                    </option>
                  </select>
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "20px",
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={isSaving}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? "Đang xử lý ảnh..." : "Lưu Bộ Sưu Tập"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
