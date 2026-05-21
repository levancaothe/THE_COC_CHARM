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
    let defaultCharm = availableCharms.find(c =>
      c.name.toLowerCase().includes(mat.toLowerCase()) &&
      (c.name.toLowerCase().includes('cơ bản') || c.name.toLowerCase().includes('mặc định'))
    );

    if (!defaultCharm) {
      defaultCharm = availableCharms.find(c =>
        c.name.toLowerCase().includes('cơ bản') || c.name.toLowerCase().includes('mặc định')
      );
    }

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
      let defaultCharm = availableCharms.find(c =>
        c.name.toLowerCase().includes(material.toLowerCase()) &&
        (c.name.toLowerCase().includes('cơ bản') || c.name.toLowerCase().includes('mặc định'))
      );

      if (!defaultCharm) {
        defaultCharm = availableCharms.find(c =>
          c.name.toLowerCase().includes('cơ bản') || c.name.toLowerCase().includes('mặc định')
        );
      }

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

  // Màn hình khởi đầu nhập số hạt
  if (capacity === null) {
    return (
      <div className="container fade-in" style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="glass" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ marginBottom: '20px' }}>Chào mừng bạn đến với Designer</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            Vui lòng nhập chu vi tay hoặc chọn số lượng hạt charm bạn muốn thiết kế.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Chu vi cổ tay (cm) - Tùy chọn:</label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={wristSize}
              onChange={handleWristSizeChange}
              placeholder="VD: 16"
              style={{ padding: '12px', width: '150px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-gold)', textAlign: 'center', fontSize: '1.2rem', marginBottom: '5px' }}
            />
            {wristSize && parseFloat(wristSize) > 0 && (
              <p style={{ fontSize: '0.9rem', color: 'var(--primary-gold)', marginBottom: '20px', fontStyle: 'italic' }}>
                Gợi ý: Cổ tay {wristSize}cm nên dùng khoảng {Math.round(parseFloat(wristSize) / 0.9)} hạt.
              </p>
            )}

            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', marginTop: !wristSize ? '20px' : '0' }}>Số lượng hạt (Capacity):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={tempCapacity}
              onChange={(e) => setTempCapacity(Number(e.target.value))}
              style={{ padding: '12px', width: '150px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-gold)', textAlign: 'center', fontSize: '1.2rem', marginBottom: '20px' }}
            />

            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Chất liệu dây:</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              style={{ padding: '12px', width: '200px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-gold)', fontSize: '1rem' }}
            >
              <option value="Bạc">Dây Bạc</option>
              <option value="Vàng">Dây Vàng</option>
              <option value="Vàng Hồng">Dây Vàng Hồng</option>
            </select>
          </div>
          <button className="btn-premium" onClick={handleStartDesign} style={{ padding: '12px 40px' }}>
            Bắt đầu thiết kế
          </button>
        </div>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'stretch', marginBottom: '30px' }}>
          <DesignerToolbar
            onSave={handleSave}
            onAddToCart={handleAddToCart}
            onDownload={handleDownload}
            onClear={() => fillWithDefaultCharms(capacity, material)}
            disabled={isSaving}
          />
          <PriceSummary totalPrice={totalPrice} count={selectedCharms.length} />
        </div>
        <CharmSidebar charms={availableCharms} categories={categories} onCharmClick={addCharm} />
      </div>
    </DndProvider>
  );
};

export default DesignerPage;
