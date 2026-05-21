import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import CategoryCard from './CategoryCard';

const DraggableCharm = ({ charm, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CHARM',
    item: charm,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="draggable-charm glass"
      onClick={() => onClick(charm)}
      style={{
        padding: '10px',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        border: '1px solid transparent',
        width: '100px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-gold)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
    >
      <img src={`http://localhost:5000/api/proxy/image?url=${encodeURIComponent(charm.image)}`} alt={charm.name} crossOrigin="anonymous" style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0 auto' }} />
      <p style={{ fontSize: '0.8rem', color: 'var(--primary-gold)', fontWeight: '700', marginTop: '10px' }}>{charm.price.toLocaleString()}đ</p>
    </div>
  );
};

const CharmSidebar = ({ charms, categories = [], onCharmClick }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredCharms = selectedEvent
    ? charms.filter(c => c.category && (c.category._id === selectedEvent._id || c.category === selectedEvent._id))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      {/* Bước 3: Chọn Bộ Charm */}
      <div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          paddingBottom: '10px'
        }}>
          {categories.map(cat => (
            <CategoryCard
              key={cat._id}
              category={cat}
              isSelected={selectedEvent?._id === cat._id}
              onClick={setSelectedEvent}
            />
          ))}
        </div>
      </div>

      {/* Bước 4: Kéo Thả Charm */}
      {selectedEvent && (
        <div className="fade-in">
          <h3 style={{ marginBottom: '15px', fontSize: '1.5rem', borderLeft: '4px solid var(--primary-gold)', paddingLeft: '10px' }}>Kéo Thả Charm</h3>
          <div style={{
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            overflowY: 'hidden',
            gap: '15px',
            padding: '10px 0',
            marginTop: '20px'
          }}>
            {filteredCharms.map(charm => (
              <DraggableCharm key={charm._id} charm={charm} onClick={onCharmClick} />
            ))}
            {filteredCharms.length === 0 && (
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                Không có hạt charm nào thuộc chủ đề này.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharmSidebar;
