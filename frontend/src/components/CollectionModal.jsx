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
  });

  // --- 2. DESIGNER STATE ---
  const [availableCharms, setAvailableCharms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCharms, setSelectedCharms] = useState(
    collection?.charms || [],
  );

  // Setup logic: If editing, skip setup. If new, start at null.
  const [capacity, setCapacity] = useState(
    collection?.charms ? collection.charms.length : null,
  );
  const [tempCapacity, setTempCapacity] = useState(10);
  const [wristSize, setWristSize] = useState("");
  const [material, setMaterial] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const designRef = useRef(null);

  const calculatedPrice = usePriceCalculator(selectedCharms);

  // --- 3. FETCH INVENTORY ---
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [charmsRes, catRes] = await Promise.all([
          api.get("/charms?limit=100"),
          api.get("/categories"),
        ]);
        setAvailableCharms(charmsRes.data.data);
        setCategories(catRes.data.data);

        // Auto-select first base material for setup
        const baseOptions = charmsRes.data.data.filter(
          (c) =>
            c.name.toLowerCase().includes("cơ bản") ||
            c.name.toLowerCase().includes("mặc định"),
        );
        if (baseOptions.length > 0 && !material) {
          setMaterial(baseOptions[0]._id);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu charm:", error);
      }
    };
    fetchInventory();
  }, []);

  // Set the price input automatically when calculated price changes,
  // but allow admin to override it if they want a discount.
  useEffect(() => {
    if (calculatedPrice > 0 && !collection?.price) {
      setFormData((prev) => ({ ...prev, price: calculatedPrice }));
    }
  }, [calculatedPrice]);

  // --- 4. DESIGNER LOGIC ---
  const handleWristSizeChange = (e) => {
    const size = e.target.value;
    setWristSize(size);
    const parsedSize = parseFloat(size);
    if (!isNaN(parsedSize) && parsedSize > 0) {
      setTempCapacity(Math.round(parsedSize / 0.9));
    }
  };

  const handleStartDesign = () => {
    setCapacity(tempCapacity);
    const defaultCharm = availableCharms.find((c) => c._id === material);
    if (defaultCharm && selectedCharms.length === 0) {
      const initialCharms = Array.from({ length: tempCapacity }).map(() => ({
        ...defaultCharm,
        instanceId: Math.random().toString(36).substr(2, 9),
        isDefault: true,
      }));
      setSelectedCharms(initialCharms);
    }
  };

  const addCharm = (charm) => {
    setSelectedCharms((prev) => {
      const defaultIndex = prev.findIndex((c) => c.isDefault);
      const newCharmInstance = {
        ...charm,
        instanceId: Math.random().toString(36).substr(2, 9),
      };

      if (defaultIndex !== -1) {
        const next = [...prev];
        next[defaultIndex] = newCharmInstance;
        return next;
      }
      if (prev.length < capacity) return [...prev, newCharmInstance];
      alert("Đã đạt tối đa số lượng hạt!");
      return prev;
    });
  };

  const moveCharmInSequence = (dragIndex, hoverIndex) => {
    setSelectedCharms((prev) => {
      const next = [...prev];
      const dragged = next[dragIndex];
      next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, dragged);
      return next;
    });
  };

  const removeCharm = (index) => {
    setSelectedCharms((prev) => {
      const next = [...prev];
      const defaultCharm =
        availableCharms.find((c) => c._id === material) || availableCharms[0];
      if (defaultCharm) {
        next[index] = {
          ...defaultCharm,
          instanceId: Math.random().toString(36).substr(2, 9),
          isDefault: true,
        };
      } else {
        next.splice(index, 1);
      }
      return next;
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
          <div style={{ padding: "40px", textAlign: "center", margin: "auto" }}>
            <h2>Thiết lập vòng cơ bản</h2>
            <div
              style={{
                maxWidth: "400px",
                margin: "20px auto",
                textAlign: "left",
              }}
            >
              <div className="form-group">
                <label>Chu vi tay (cm) - Tùy chọn</label>
                <input
                  type="number"
                  value={wristSize}
                  onChange={handleWristSizeChange}
                  placeholder="VD: 16"
                />
              </div>
              <div className="form-group">
                <label>Số lượng hạt (Capacity)</label>
                <input
                  type="number"
                  value={tempCapacity}
                  onChange={(e) => setTempCapacity(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Chất liệu dây cơ bản</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                >
                  {availableCharms
                    .filter(
                      (c) =>
                        c.name.toLowerCase().includes("cơ bản") ||
                        c.name.toLowerCase().includes("mặc định"),
                    )
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "20px" }}
                onClick={handleStartDesign}
              >
                Bắt đầu kéo thả
              </button>
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
                <div style={{ marginBottom: "20px" }}>
                  <BraceletCanvas
                    ref={designRef}
                    selectedCharms={selectedCharms}
                    onAddCharm={addCharm}
                    moveCharmInSequence={moveCharmInSequence}
                    onRemoveCharm={removeCharm}
                    exportMode={isSaving} // Hides UI elements during screenshot
                  />
                </div>
                {/* The Sidebar mapped right below or next to it */}
                <div
                  style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}
                >
                  <h4>Chọn Charm:</h4>
                  <CharmSidebar
                    charms={availableCharms}
                    categories={categories}
                    selectedCharmCounts={{}} // Keep empty for admin bypass, or calculate if needed
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
                  <small style={{ color: "gray" }}>
                    Giá nguyên liệu đang là: {calculatedPrice.toLocaleString()}{" "}
                    VND
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
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
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
