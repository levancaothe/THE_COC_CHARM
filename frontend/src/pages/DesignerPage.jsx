import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import html2canvas from 'html2canvas';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CharmSidebar from '../components/CharmSidebar';
import BraceletCanvas from '../components/BraceletCanvas';
import { PriceSummary, DesignerToolbar } from '../components/DesignerTools';
import { usePriceCalculator } from '../hooks/usePriceCalculator';
import { useCart } from '../context/CartContext';
import './DesignerPage.css';

const DESIGN_DRAFT_KEY = 'charmify_designer_draft';
const SAVED_DESIGNS_KEY = 'charmify_saved_designs';

const readDesignDraft = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(DESIGN_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error reading design draft:', error);
    return null;
  }
};

const writeDesignDraft = (draft) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(DESIGN_DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving design draft:', error);
  }
};

const readSavedDesigns = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(SAVED_DESIGNS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading saved designs:', error);
    return [];
  }
};

const writeSavedDesigns = (designs) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(designs));
  } catch (error) {
    console.error('Error saving designs:', error);
  }
};

const stripCharmMeta = (charm) => {
  if (!charm) return charm;
  const { instanceId, isDefault, ...cleanCharm } = charm;
  return cleanCharm;
};

const buildStoredCharmEntry = (charm) => ({
  charm: stripCharmMeta(charm),
  x: 0,
  y: 0
});

const createDesignId = () => `design-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
      instanceId: Math.random().toString(36).substr(2, 9),
      isDefault: false
    };
  };

  const initialEditCharms = editDesign?.charms
    ? editDesign.charms.map(normalizeEditCharm).filter(Boolean)
    : [];

  const savedDraft = !editDesign ? readDesignDraft() : null;

  const [selectedCharms, setSelectedCharms] = useState(
    savedDraft?.selectedCharms?.length ? savedDraft.selectedCharms : initialEditCharms
  );
  const [capacity, setCapacity] = useState(
    editDesign
      ? (initialEditCharms.length || 1)
      : (typeof savedDraft?.capacity === 'number' ? savedDraft.capacity : null)
  ); // Số lượng hạt tối đa
  const [tempCapacity, setTempCapacity] = useState(
    editDesign
      ? (initialEditCharms.length || 1)
      : (typeof savedDraft?.tempCapacity === 'number' ? savedDraft.tempCapacity : 10)
  ); // Giá trị tạm thời trong input
  const [wristSize, setWristSize] = useState(
    editDesign ? '' : (savedDraft?.wristSize || '')
  ); // Chu vi tay
  const [material, setMaterial] = useState(
    editDesign ? '' : (savedDraft?.material || '')
  ); // Id charm cơ bản dùng làm dây
  const [designName, setDesignName] = useState(
    editDesign?.name || (!editDesign ? (savedDraft?.designName || 'Thiết kế của tôi') : 'Thiết kế của tôi')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [editingDesignId, setEditingDesignId] = useState(editDesign?._id || null);
  const [editingSource, setEditingSource] = useState(location.state?.source || null);
  const designRef = useRef(null);
  const navigate = useNavigate();

  const totalPrice = usePriceCalculator(selectedCharms);
  const formatVnd = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} VND`;

  const baseCharmKeywords = ['cơ bản', 'co ban', 'basic', 'base', 'mặc định', 'mac dinh', 'default'];
  const normalizeText = (value = '') => value.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const getCategoryName = (charm) => {
    if (typeof charm?.category === 'object' && charm?.category?.name) {
      return charm.category.name;
    }

    const categoryId = charm?.category?._id || charm?.category;
    return categories.find((category) => category._id === categoryId)?.name || '';
  };
  const isBaseCharm = (charm) => {
    const charmName = normalizeText(charm?.name);
    const categoryName = normalizeText(getCategoryName(charm));
    return baseCharmKeywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return charmName.includes(normalizedKeyword) || categoryName.includes(normalizedKeyword);
    });
  };

  const baseCharmOptions = useMemo(() => availableCharms.filter(isBaseCharm), [availableCharms, categories]);
  const selectedBaseCharm = useMemo(
    () => baseCharmOptions.find((charm) => charm._id === material) || baseCharmOptions[0] || null,
    [baseCharmOptions, material]
  );
  const basePrice = (selectedBaseCharm?.price || 0) * (Number(tempCapacity) || 0);

  useEffect(() => {
    const fetchCharmsAndCategories = async () => {
      try {
        const [charmsRes, catRes] = await Promise.all([
          api.get('/charms?limit=100'),
          api.get('/categories')
        ]);
        setAvailableCharms(charmsRes.data.data);
        setCategories(catRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchCharmsAndCategories();
  }, []);

  useEffect(() => {
    if (!editDesign || initialEditCharms.length === 0) return;

    setEditingDesignId(editDesign._id || null);
    setEditingSource(location.state?.source || null);
    setSelectedCharms(initialEditCharms);
    setCapacity(initialEditCharms.length);
    setTempCapacity(initialEditCharms.length);
    setDesignName(editDesign.name || 'Thiết kế của tôi');
  }, [editDesign]);

  useEffect(() => {
    if (baseCharmOptions.length === 0) return;

    const isSelectedMaterialValid = baseCharmOptions.some((charm) => charm._id === material);
    if (!isSelectedMaterialValid) {
      setMaterial(baseCharmOptions[0]._id);
    }
  }, [baseCharmOptions, material]);

  useEffect(() => {
    if (editDesign) return;

    if (capacity === null) {
      return;
    }

    writeDesignDraft({
      selectedCharms,
      capacity,
      tempCapacity,
      wristSize,
      material,
      designName
    });
  }, [editDesign, selectedCharms, capacity, tempCapacity, wristSize, material, designName]);

  const fillWithDefaultCharms = (cap, mat) => {
    const defaultCharm = baseCharmOptions.find((charm) => charm._id === mat) || baseCharmOptions[0];

    if (defaultCharm) {
      const initialCharms = Array.from({ length: cap }).map(() => ({
        ...defaultCharm,
        instanceId: Math.random().toString(36).substr(2, 9),
        isDefault: true
      }));
      setSelectedCharms(initialCharms);
    } else {
      setSelectedCharms([]);
    }
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
    setCapacity(tempCapacity);
    fillWithDefaultCharms(tempCapacity, material);
  };

  const addCharm = (charm) => {
    setSelectedCharms((prevCharms) => {
      const newCharmInstance = {
        ...charm,
        instanceId: Math.random().toString(36).substr(2, 9),
      };

      const defaultCharmIndex = prevCharms.findIndex(c =>
        c.isDefault ||
        (selectedBaseCharm && c._id === selectedBaseCharm._id)
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

      // Hoàn trả lại hạt mặc định khi xóa hạt sự kiện
      const defaultCharm = selectedBaseCharm || baseCharmOptions[0];

      if (defaultCharm) {
        newCharms[index] = {
          ...defaultCharm,
          instanceId: Math.random().toString(36).substr(2, 9),
          isDefault: true
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

  const { addToCart, updateCartItem } = useCart();

  const handleDownload = async () => {
    if (selectedCharms.length === 0) return alert('Hãy thêm ít nhất 1 charm để tải ảnh!');
    if (!designRef.current) return;

    try {
      const canvas = await html2canvas(designRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 2 // Higher quality
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${designName || 'design'}.png`;
      link.click();
    } catch (error) {
      console.error('Lỗi khi tạo ảnh:', error);
      alert('Không thể tạo ảnh thiết kế. Vui lòng thử lại.');
    }
  };

  const buildDesignPayload = (isSaved) => ({
    name: designName || `Thiết kế vòng (${selectedCharms.length}/${capacity} hạt)`,
    charms: selectedCharms.map(buildStoredCharmEntry),
    totalPrice,
    isSaved
  });

  const saveDesignToLibrary = (design, existingId = null) => {
    const savedDesigns = readSavedDesigns();
    const timestamp = new Date().toISOString();
    const existingDesign = savedDesigns.find((item) => item._id === (existingId || design._id));
    const nextDesign = {
      ...design,
      _id: existingId || design._id || createDesignId(),
      isSaved: true,
      createdAt: design.createdAt || existingDesign?.createdAt || timestamp,
      updatedAt: timestamp
    };

    const nextDesigns = savedDesigns.some((item) => item._id === nextDesign._id)
      ? savedDesigns.map((item) => (item._id === nextDesign._id ? nextDesign : item))
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
    navigateBack = false
  } = {}) => {
    if (selectedCharms.length === 0) return alert('Hãy thêm ít nhất 1 charm!');
    if (isSaving) return;

    setIsSaving(true);
    try {
      const designData = buildDesignPayload(isSaved);

      const existingId = useExistingId && editingDesignId ? editingDesignId : null;
      const designRecord = isSaved
        ? saveDesignToLibrary(designData, existingId)
        : {
            ...designData,
            _id: existingId || createDesignId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

      const cartDesign = {
        _id: designRecord._id,
        name: designRecord.name,
        price: designRecord.totalPrice ?? totalPrice,
        charms: selectedCharms.map(stripCharmMeta),
        isSaved: designRecord.isSaved ?? false
      };

      if (isSaved) {
        setEditingDesignId(designRecord._id);
        setEditingSource('designs');
      }

      if (updateCartAfter) {
        updateCartItem(cartDesign, 'design');
      }

      if (addToCartAfter) {
        addToCart(cartDesign, 'design');
      }

      if (showAlert) {
        const successMessage = addToCartAfter
          ? 'Đã thêm thiết kế vào giỏ hàng!'
          : (editingDesignId ? 'Đã cập nhật mẫu thành công!' : 'Đã lưu thiết kế vào "Thiết kế của tôi" thành công!');
        alert(successMessage);
      }

      if (navigateBack && editingDesignId && returnTo) {
        navigate(returnTo, { state: { focusCheckout: returnTo === '/cart' } });
      }
      return true;
    } catch (error) {
      if (showAlert) {
        alert('Lỗi khi lưu thiết kế');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const persistDesignToCart = async ({ showAlert = true } = {}) => {
    return persistDesign({
      isSaved: false,
      addToCartAfter: editingSource !== 'cart',
      updateCartAfter: editingSource === 'cart',
      showAlert,
      useExistingId: editingSource === 'cart'
    });
  };

  const handleAddToCart = async () => {
    await persistDesignToCart({ showAlert: true });
  };

  const handleBuyNow = async () => {
    const success = await persistDesignToCart({ showAlert: false });
    if (success) {
      navigate('/cart', { state: { focusCheckout: true } });
    }
  };

  if (capacity === null) {
    return (
      <div className="designer-start fade-in">
        <section className="designer-start-card" aria-labelledby="designer-start-title">
          <h1 id="designer-start-title">
            Chào mừng bạn đến với
            <span>không gian thiết kế</span>
          </h1>
          <p className="designer-start-intro">
            Vui lòng nhập chu vi cổ tay hoặc chọn số lượng hạt charm (mắt xích) bạn muốn thiết kế.
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
                Gợi ý: Cổ tay {wristSize}cm nên dùng khoảng {Math.round(parseFloat(wristSize) / 0.9)} hạt.
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

            <label htmlFor="bracelet-material">Chất liệu dây (từ bộ charm cơ bản):</label>
            <select
              id="bracelet-material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              disabled={baseCharmOptions.length === 0}
            >
              {baseCharmOptions.length > 0 ? (
                baseCharmOptions.map((charm) => (
                  <option key={charm._id} value={charm._id}>
                    {charm.name} ({formatVnd((charm.price || 0) * (Number(tempCapacity) || 0))})
                  </option>
                ))
              ) : (
                <option value="">Chưa có charm cơ bản trong cơ sở dữ liệu</option>
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
      <div className="designer-page container fade-in" style={{ padding: '40px 0' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', background: 'var(--gold-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Trình Thiết Kế Vòng Tay
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Sức chứa: <strong>{selectedCharms.length} / {capacity}</strong> hạt charm</p>
            <button onClick={() => setCapacity(null)} style={{ fontSize: '0.8rem', color: 'var(--primary-gold)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Đổi số lượng</button>
          </div>
          <div style={{ marginTop: '20px', maxWidth: '400px', margin: '20px auto 0' }}>
            <input
              type="text"
              placeholder="Đặt tên cho thiết kế của bạn..."
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="glass"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                fontSize: '1.1rem',
                textAlign: 'center',
                color: 'var(--text-main)',
                outline: 'none'
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
          />
        </div>

        <div className="designer-checkout-panel">
          <PriceSummary totalPrice={totalPrice} count={selectedCharms.length} />
          <DesignerToolbar
            onSave={() => persistDesign({
              isSaved: true,
              addToCartAfter: false,
              updateCartAfter: editingSource === 'cart',
              showAlert: true,
              useExistingId: !!editingDesignId,
              navigateBack: true
            })}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onDownload={handleDownload}
            onClear={() => fillWithDefaultCharms(capacity, material)}
            disabled={isSaving}
          />
        </div>
        <CharmSidebar charms={availableCharms} categories={categories} onCharmClick={addCharm} />
      </div>
    </DndProvider>
  );
};

export default DesignerPage;
