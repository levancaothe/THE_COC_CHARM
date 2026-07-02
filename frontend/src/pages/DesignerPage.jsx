import { useState, useEffect, useMemo, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import html2canvas from "html2canvas";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import CharmSidebar from "../components/CharmSidebar";
import BraceletCanvas from "../components/BraceletCanvas";
import { PriceSummary, DesignerToolbar } from "../components/DesignerTools";
import { usePriceCalculator } from "../hooks/usePriceCalculator";
import { useCart } from "../context/CartContext";
import { createInstanceId, stripCharmMeta, isBaseCharm } from "../utils/imageProxy";
import "./DesignerPage.css";

const SAVED_DESIGNS_KEY = "charmify_saved_designs";

const readSavedDesigns = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_DESIGNS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading saved designs:", error);
    return [];
  }
};

const writeSavedDesigns = (designs) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(designs));
  } catch (error) {
    console.error("Error saving designs:", error);
  }
};

const buildStoredCharmEntry = (charm) => ({
  charm: stripCharmMeta(charm),
  x: 0,
  y: 0,
});

const createDesignId = () =>
  `design-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DesignerPage = () => {
  const [availableCharms, setAvailableCharms] = useState([]);
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const editDesign = location.state?.editDesign || null;
  const returnTo = location.state?.returnTo || null;

  const normalizeEditCharm = (entry) => {
    const charm = entry?.charm || entry;
    if (!charm) return null;
    return {
      ...charm,
      instanceId: createInstanceId(),
      isDefault: false,
    };
  };

  const initialEditCharms = useMemo(() => {
    return editDesign?.charms
      ? editDesign.charms.map(normalizeEditCharm).filter(Boolean)
      : [];
  }, [editDesign]);

  const [selectedCharms, setSelectedCharms] = useState(initialEditCharms);

  const [capacity, setCapacity] = useState(null);

  const [tempCapacity, setTempCapacity] = useState(
    editDesign ? initialEditCharms.length || 1 : 10,
  );
  const [wristSize, setWristSize] = useState("");
  const [material, setMaterial] = useState("");
  const [designName, setDesignName] = useState(
    editDesign?.name || "Thiết kế của tôi",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingDesignId, setEditingDesignId] = useState(
    editDesign?._id || null,
  );
  const [editingSource, setEditingSource] = useState(
    location.state?.source || null,
  );
  const designRef = useRef(null);
  const navigate = useNavigate();

  const totalPrice = usePriceCalculator(selectedCharms);


  const formatVnd = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(value || 0)} VND`;

  const baseCharmOptions = useMemo(
    () => availableCharms.filter((charm) => isBaseCharm(charm, categories)),
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

  const fetchCharmsAndCategories = async () => {
    try {
      const [charmsRes, catRes] = await Promise.all([
        api.get("/charms?limit=1000"),
        api.get("/categories"),
      ]);
      setAvailableCharms(charmsRes.data.data);
      setCategories(catRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchCharmsAndCategories();
  }, []);

  useEffect(() => {
    const handleInventoryUpdate = () => {
      fetchCharmsAndCategories();
    };

    window.addEventListener("inventory-updated", handleInventoryUpdate);
    return () =>
      window.removeEventListener("inventory-updated", handleInventoryUpdate);
  }, []);

  useEffect(() => {
    if (!editDesign) return;

    setEditingDesignId(editDesign._id || null);
    setEditingSource(location.state?.source || null);
    setDesignName(editDesign.name || "Thiết kế của tôi");

    if (initialEditCharms.length > 0) {
      setSelectedCharms(initialEditCharms);
      setTempCapacity(initialEditCharms.length);
    }
  }, [editDesign, initialEditCharms]);

  useEffect(() => {
    if (baseCharmOptions.length === 0) return;

    const isSelectedMaterialValid = baseCharmOptions.some(
      (charm) => charm._id === material,
    );
    if (!isSelectedMaterialValid) {
      setMaterial(baseCharmOptions[0]._id);
    }
  }, [baseCharmOptions, material]);

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
        instanceId: createInstanceId(),
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
        instanceId: createInstanceId(),
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
        instanceId: createInstanceId(),
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
          instanceId: createInstanceId(),
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
        instanceId: createInstanceId(),
      };
      return updatedCharms;
    });
  };

  const { addToCart, updateCartItem } = useCart();

  const handleDownload = async () => {
    if (selectedCharms.length === 0)
      return alert("Hãy thêm ít nhất 1 charm để tải ảnh!");
    if (!designRef.current) {
      return alert("Không tìm thấy canvas thiết kế! (ref.current is null)");
    }

    try {
      setIsExporting(true);
      // Wait for re-render cycle to update exportMode
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Pre-load all images inside the canvas first
      const images = Array.from(designRef.current.getElementsByTagName('img'));
      const loadPromises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(loadPromises);

      const html2canvasFn = typeof html2canvas === "function"
        ? html2canvas
        : (html2canvas.default || html2canvas);

      if (typeof html2canvasFn !== "function") {
        throw new Error("Thư viện html2canvas chưa được load đúng cách (not a function).");
      }

      // Override document.fonts.ready descriptor to prevent html2canvas from hanging on Google Fonts loading
      const originalDescriptor = Object.getOwnPropertyDescriptor(document.fonts, 'ready');
      Object.defineProperty(document.fonts, 'ready', {
        value: Promise.resolve(),
        configurable: true,
      });

      const canvas = await html2canvasFn(designRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2,
        logging: true,
        onclone: (clonedDocument) => {
          const clonedTarget = clonedDocument.querySelector(".bracelet-canvas");
          if (clonedTarget) {
            const clonedBand = clonedTarget.querySelector(".modular-bracelet-band");
            const bandWidth = clonedBand
              ? Math.max(
                clonedBand.scrollWidth || 0,
                clonedBand.getBoundingClientRect().width || 0,
              )
              : Math.max(
                clonedTarget.scrollWidth || 0,
                clonedTarget.getBoundingClientRect().width || 0,
              );

            clonedTarget.style.width = `${bandWidth + 80}px`;
            clonedTarget.style.maxWidth = "none";
            clonedTarget.style.minWidth = "0";
            clonedTarget.style.overflow = "visible";
            clonedTarget.style.display = "flex";

            if (clonedBand) {
              clonedBand.style.width = `${bandWidth}px`;
              clonedBand.style.minWidth = "0";
              clonedBand.style.overflow = "visible";
              clonedBand.style.flexWrap = "nowrap";
            }
          }
        },
      });

      // Restore original document.fonts.ready
      if (originalDescriptor) {
        Object.defineProperty(document.fonts, 'ready', originalDescriptor);
      } else {
        delete document.fonts.ready;
      }

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${designName || "design"}.png`;
      link.click();
    } catch (error) {
      console.error("Lỗi khi tạo ảnh:", error);
      alert(`Không thể tạo ảnh thiết kế. Chi tiết lỗi: ${error.message || error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const buildDesignPayload = (isSaved) => ({
    name:
      designName || `Thiết kế vòng (${selectedCharms.length}/${capacity} hạt)`,
    charms: selectedCharms.map(buildStoredCharmEntry),
    totalPrice,
    isSaved,
  });

  const saveDesignToLibrary = (design, existingId = null) => {
    const savedDesigns = readSavedDesigns();
    const timestamp = new Date().toISOString();
    const existingDesign = savedDesigns.find(
      (item) => item._id === (existingId || design._id),
    );
    const nextDesign = {
      ...design,
      _id: existingId || design._id || createDesignId(),
      isSaved: true,
      createdAt: design.createdAt || existingDesign?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    const nextDesigns = savedDesigns.some((item) => item._id === nextDesign._id)
      ? savedDesigns.map((item) =>
        item._id === nextDesign._id ? nextDesign : item,
      )
      : [nextDesign, ...savedDesigns];

    writeSavedDesigns(nextDesigns);
    return nextDesign;
  };

  const persistDesign = async ({
    isSaved,
    addToCartAfter = false,
    updateCartAfter = false,
    showAlert = true,
    useExistingId = false,
    navigateBack = false,
  } = {}) => {
    if (selectedCharms.length === 0) return alert("Hãy thêm ít nhất 1 charm!");
    if (isSaving) return;

    setIsSaving(true);
    try {
      const designData = buildDesignPayload(isSaved);
      const existingId =
        useExistingId && editingDesignId ? editingDesignId : null;
      const designRecord = isSaved
        ? saveDesignToLibrary(designData, existingId)
        : {
          ...designData,
          _id: existingId || createDesignId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

      const cartDesign = {
        _id: designRecord._id,
        name: designRecord.name,
        price: designRecord.totalPrice ?? totalPrice,
        charms: selectedCharms.map(stripCharmMeta),
        isSaved: designRecord.isSaved ?? false,
      };

      if (isSaved) {
        setEditingDesignId(designRecord._id);
        setEditingSource("designs");
      }

      if (updateCartAfter) {
        updateCartItem(cartDesign, "design");
      }

      if (addToCartAfter) {
        addToCart(cartDesign, "design");
      }

      if (showAlert) {
        const successMessage = addToCartAfter
          ? "Đã thêm thiết kế vào giỏ hàng!"
          : editingDesignId
            ? "Đã cập nhật mẫu thành công!"
            : 'Đã lưu thiết kế vào "Thiết kế của tôi" thành công!';
        alert(successMessage);
      }

      if (navigateBack && editingDesignId && returnTo) {
        navigate(returnTo, { state: { focusCheckout: returnTo === "/cart" } });
      }
      return true;
    } catch {
      if (showAlert) {
        alert("Lỗi khi lưu thiết kế");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const persistDesignToCart = async ({ showAlert = true } = {}) => {
    return persistDesign({
      isSaved: false,
      addToCartAfter: editingSource !== "cart",
      updateCartAfter: editingSource === "cart",
      showAlert,
      useExistingId: editingSource === "cart",
    });
  };

  const handleAddToCart = async () => {
    await persistDesignToCart({ showAlert: true });
  };

  const handleBuyNow = async () => {
    const success = await persistDesignToCart({ showAlert: false });
    if (success) {
      navigate("/cart", { state: { focusCheckout: true } });
    }
  };

  if (capacity === null) {
    return (
      <div className="designer-start fade-in">
        <section
          className="designer-start-card"
          aria-labelledby="designer-start-title"
        >
          <h1 id="designer-start-title">
            Chào mừng bạn đến với
            <span>không gian thiết kế</span>
          </h1>
          <p className="designer-start-intro">
            Vui lòng nhập chu vi cổ tay hoặc chọn số lượng hạt charm (mắt xích)
            bạn muốn thiết kế.
          </p>

          <div className="designer-start-form">
            <label htmlFor="wrist-size">Chu vi cổ tay (cm) - Tùy chọn:</label>
            <input
              id="wrist-size"
              type="number"
              min="1"
              step="0.1"
              value={wristSize}
              onChange={handleWristSizeChange}
              placeholder="VD: 16"
            />
            {wristSize && parseFloat(wristSize) > 0 && (
              <p className="designer-hint">
                Gợi ý: Cổ tay {wristSize}cm nên dùng khoảng{" "}
                {Math.round(parseFloat(wristSize) / 0.9)} hạt.
              </p>
            )}

            <label htmlFor="charm-capacity">Số lượng hạt (Capacity):</label>
            <input
              id="charm-capacity"
              type="number"
              min="1"
              max="100"
              value={tempCapacity}
              onChange={(e) => setTempCapacity(Number(e.target.value))}
              placeholder="VD: 10"
            />

            <label htmlFor="bracelet-material">
              Chất liệu dây:
            </label>
            <select
              id="bracelet-material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              disabled={baseCharmOptions.length === 0}
            >
              {baseCharmOptions.length > 0 ? (
                baseCharmOptions.map((charm) => (
                  <option key={charm._id} value={charm._id}>
                    {charm.name} (
                    {formatVnd(
                      (charm.price || 0) * (Number(tempCapacity) || 0),
                    )}
                    )
                  </option>
                ))
              ) : (
                <option value="">
                  Chưa có charm cơ bản trong cơ sở dữ liệu
                </option>
              )}
            </select>
            {selectedBaseCharm && (
              <p className="designer-hint">
                Đang dùng: {selectedBaseCharm.name} - {formatVnd(basePrice)}
              </p>
            )}
          </div>
          <button className="designer-start-button" onClick={handleStartDesign}>
            Bắt đầu thiết kế
          </button>
        </section>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="designer-page container fade-in"
        style={{ padding: "40px 0" }}
      >
        <header style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              background: "var(--gold-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Trình Thiết Kế Vòng Tay
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <p style={{ color: "var(--text-muted)" }}>
              Sức chứa:{" "}
              <strong>
                {selectedCharms.length} / {capacity}
              </strong>{" "}
              hạt charm
            </p>
            <button
              onClick={() => setCapacity(null)}
              style={{
                fontSize: "0.8rem",
                color: "var(--primary-gold)",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Đổi số lượng
            </button>
          </div>
          <div
            style={{
              marginTop: "20px",
              maxWidth: "400px",
              margin: "20px auto 0",
            }}
          >
            <input
              type="text"
              placeholder="Đặt tên cho thiết kế của bạn..."
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="glass"
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                fontSize: "1.1rem",
                textAlign: "center",
                color: "var(--text-main)",
                outline: "none",
              }}
            />
          </div>
        </header>

        <div className="designer-canvas-sticky">
          <BraceletCanvas
            ref={designRef}
            selectedCharms={selectedCharms}
            onAddCharm={addCharm}
            moveCharmInSequence={moveCharmInSequence}
            onRemoveCharm={removeCharm}
            onReplaceCharm={replaceCharm}
            exportMode={isExporting}
          />
        </div>

        <div className="designer-checkout-panel">
          <PriceSummary
            selectedCharms={selectedCharms}
            selectedBaseCharm={selectedBaseCharm}
          />
          <DesignerToolbar
            onSave={() =>
              persistDesign({
                isSaved: true,
                addToCartAfter: false,
                updateCartAfter: editingSource === "cart",
                showAlert: true,
                useExistingId: !!editingDesignId,
                navigateBack: true,
              })
            }
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onDownload={handleDownload}
            onClear={() => fillWithDefaultCharms(capacity, material)}
            disabled={isSaving}
          />
        </div>
        <CharmSidebar
          charms={availableCharms}
          categories={categories}
          selectedCharmCounts={selectedCharmCounts}
          onCharmClick={addCharm}
        />
      </div>
    </DndProvider>
  );
};

export default DesignerPage;
