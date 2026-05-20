import React, { useState } from 'react';
import { useDrag } from 'react-dnd';

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
        cursor: 'pointer', // Đổi sang pointer để báo hiệu có thể click
        transition: 'transform 0.2s ease',
        border: '1px solid transparent'
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-gold)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
    >
      <img src={`http://localhost:5000/api/proxy/image?url=${encodeURIComponent(charm.image)}`} alt={charm.name} crossOrigin="anonymous" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
      <p style={{ fontSize: '0.75rem', marginTop: '5px', fontWeight: '500' }}>{charm.name}</p>
      <p style={{ fontSize: '0.7rem', color: 'var(--primary-gold)', fontWeight: '700' }}>${charm.price}</p>
    </div>
  );
};

const CharmSidebar = ({ charms, categories = [], onCharmClick }) => {
  const [selectedEvent, setSelectedEvent] = useState('');

  const filteredCharms = selectedEvent 
    ? charms.filter(c => c.category && (c.category._id === selectedEvent || c.category === selectedEvent))
    : charms;

  return (
    <aside className="charm-sidebar glass" style={{ padding: '20px', height: 'fit-content', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '100px' }}>
      <h3 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Thư viện Charm</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Click hoặc kéo để thêm vào vòng</p>
      
      {categories.length > 0 && (
        <select 
          className="glass"
          style={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', outline: 'none' }}
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">Tất cả chủ đề</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      )}
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px', 
        maxHeight: '600px', 
        overflowY: 'auto',
        paddingRight: '5px'
      }}>
        {filteredCharms.map(charm => (
          <DraggableCharm key={charm._id} charm={charm} onClick={onCharmClick} />
        ))}
        {filteredCharms.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
            Không có hạt charm nào thuộc chủ đề này.
          </p>
        )}
      </div>
    </aside>
  );
};

export default CharmSidebar;
