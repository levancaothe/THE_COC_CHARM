import React from 'react';
import { useDrop, useDrag } from 'react-dnd';

const PlacedCharm = ({ charm, index, onRemove, onReplace, moveCharmInSequence }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SORTABLE_CHARM',
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [index]);

  const [{ isOverCharm }, drop] = useDrop(() => ({
    accept: ['SORTABLE_CHARM', 'CHARM'],
    hover: (item) => {
      if (item.index !== undefined && item.index !== index) {
        moveCharmInSequence(item.index, index);
        item.index = index;
      }
    },
    drop: (item) => {
      if (item.index === undefined) {
        onReplace(index, item);
      }
    },
    collect: (monitor) => ({
      isOverCharm: !!monitor.isOver(),
    }),
  }), [index, moveCharmInSequence, onReplace]);

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`placed-charm ${isOverCharm ? 'is-replacing' : ''}`}
      onDoubleClick={() => onRemove(index)}
      title="Double click to remove charm"
      style={{ 
        position: 'relative', 
        opacity: isDragging ? 0.3 : 1,
        cursor: 'grab',
        padding: '0',
        transition: 'all 0.2s ease',
        transform: isOverCharm ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
        zIndex: isOverCharm ? 10 : 2
      }}
    >
      <div style={{
        width: '55px',
        height: '45px',
        background: 'linear-gradient(to bottom, #f9f9f9 0%, #e0e0e0 50%, #c0c0c0 100%)',
        border: '1px solid #999',
        borderRight: '1.5px solid #666',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 3px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img 
          src={`http://localhost:5000/api/proxy/image?url=${encodeURIComponent(charm.image)}`} 
          alt={charm.name} 
          crossOrigin="anonymous"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block'
          }} 
        />
        
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          border: '1px solid rgba(255,255,255,0.2)', 
          pointerEvents: 'none' 
        }}></div>
      </div>
    </div>
  );
};

const BraceletCanvas = React.forwardRef(({ selectedCharms, onAddCharm, onRemoveCharm, onReplaceCharm, moveCharmInSequence }, ref) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CHARM',
    drop: (item, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        onAddCharm(item);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [onAddCharm]);

  return (
    <div 
      ref={(node) => {
        drop(node);
        if (ref) {
          if (typeof ref === 'function') ref(node);
          else ref.current = node;
        }
      }}
      className="bracelet-canvas"
      style={{ 
        minHeight: '200px', 
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: isOver ? 'var(--accent-bg)' : '#fdfdfd',
        padding: '40px',
        overflowX: 'auto',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.02)'
      }}
    >
      <div className="modular-bracelet-band" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0px', 
        zIndex: 2,
        boxShadow: selectedCharms.length > 0 ? '0 10px 30px rgba(74, 63, 53, 0.15)' : 'none',
        borderRadius: '4px',
        overflow: 'visible'
      }}>
        {selectedCharms.map((charm, index) => (
          <PlacedCharm 
            key={charm.instanceId} 
            charm={charm} 
            index={index} 
            onRemove={onRemoveCharm}
            onReplace={onReplaceCharm}
            moveCharmInSequence={moveCharmInSequence}
          />
        ))}
      </div>

      {selectedCharms.length === 0 && !isOver && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'var(--text)', 
          opacity: 0.4, 
          fontSize: '1rem', 
          fontWeight: 600,
          pointerEvents: 'none',
          textAlign: 'center'
        }}>
          ✨ Kéo thả charm để tạo chuỗi vòng ✨
        </div>
      )}
    </div>
  );
});

export default BraceletCanvas;
