import React, { useState, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import html2canvas from 'html2canvas';
import api from '../services/api';
import CharmSidebar from '../components/CharmSidebar';
import BraceletCanvas from '../components/BraceletCanvas';
import { PriceSummary, DesignerToolbar } from '../components/DesignerTools';
import { usePriceCalculator } from '../hooks/usePriceCalculator';
import { useCart } from '../context/CartContext';
import './DesignerPage.css';

const DesignerPage = () => {
  const [availableCharms, setAvailableCharms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCharms, setSelectedCharms] = useState([]);
  const [capacity, setCapacity] = useState(null); // Số lượng hạt tối đa
  const [tempCapacity, setTempCapacity] = useState(10); // Giá trị tạm thời trong input
  const [wristSize, setWristSize] = useState(''); // Chu vi tay
  const [material, setMaterial] = useState('Bạc'); // Chất liệu dây
  const [designName, setDesignName] = useState('Thiết kế của tôi');
  const [isSaving, setIsSaving] = useState(false);
  const designRef = useRef(null);

  const totalPrice = usePriceCalculator(selectedCharms);
  const formatVnd = (value) => `${new Intl.NumberFormat('vi-VN').format(value || 0)} VND`;

  const findDefaultCharm = (mat = material) => {
    const normalizedMaterial = mat.toLowerCase();
    const isBaseCharm = (charm) => {
      const name = charm.name.toLowerCase();
      return name.includes('cơ bản') || name.includes('mặc định');
    };

    return availableCharms.find((charm) =>
      charm.name.toLowerCase().includes(normalizedMaterial) && isBaseCharm(charm)
    ) || availableCharms.find(isBaseCharm);
  };

  const baseCharm = findDefaultCharm(material);
  const basePrice = (baseCharm?.price || 0) * (Number(tempCapacity) || 0);

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

  const fillWithDefaultCharms = (cap, mat) => {
    const defaultCharm = findDefaultCharm(mat);

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
        c.name.toLowerCase().includes('cơ bản') ||
        c.name.toLowerCase().includes('mặc định')
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
      const defaultCharm = findDefaultCharm(material);

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

  const { addToCart } = useCart();

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

  const handleSave = async () => {
    if (selectedCharms.length === 0) return alert('Hãy thêm ít nhất 1 charm!');
    if (isSaving) return;

    setIsSaving(true);
    try {
      const designData = {
        name: designName || `Thiết kế vòng (${selectedCharms.length}/${capacity} hạt)`,
        charms: selectedCharms.map((c) => ({
          charm: c._id,
          x: 0,
          y: 0
        })),
        totalPrice,
        isSaved: true
      };
      await api.post('/bracelets', designData);
      alert('Đã lưu thiết kế vào "Thiết kế của tôi" thành công!');
    } catch (error) {
      alert('Lỗi khi lưu thiết kế');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (selectedCharms.length === 0) return alert('Hãy thêm ít nhất 1 charm!');
    if (isSaving) return;

    setIsSaving(true);
    try {
      const designData = {
        name: designName || `Thiết kế vòng (${selectedCharms.length}/${capacity} hạt)`,
        charms: selectedCharms.map((c) => ({
          charm: c._id,
          x: 0,
          y: 0
        })),
        totalPrice,
        isSaved: false // Not explicitly saved to "My Designs"
      };
      const { data } = await api.post('/bracelets', designData);

      addToCart({
        _id: data.data._id,
        name: designData.name,
        price: totalPrice,
        charms: selectedCharms
      }, 'design');

      alert('Đã thêm thiết kế vào giỏ hàng!');
    } catch (error) {
      alert('Lỗi khi thêm vào giỏ hàng');
    } finally {
      setIsSaving(false);
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

            <label htmlFor="bracelet-material">Chất liệu dây (Base):</label>
            <select
              id="bracelet-material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              <option value="Bạc">Dây bạc ({formatVnd(basePrice)})</option>
              <option value="Vàng">Dây vàng ({formatVnd(basePrice)})</option>
              <option value="Vàng Hồng">Dây vàng hồng ({formatVnd(basePrice)})</option>
            </select>
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

        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)', paddingBottom: '20px' }}>
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
            onSave={handleSave}
            onAddToCart={handleAddToCart}
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
