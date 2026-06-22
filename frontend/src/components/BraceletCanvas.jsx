import React, { useEffect, useState } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { getProxyImageUrl, isPendantCharm } from '../utils/imageProxy';

const PlacedCharm = ({ charm, index, onRemove, onReplace, moveCharmInSequence, exportMode }) => {
  const charmImageUrl = getProxyImageUrl(charm.image);
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

  const isPendant = isPendantCharm(charm);
  const pendantPreviewStyle = {
    position: 'absolute',
    left: '-6.5px',
    top: '2px',
    width: '58px',
    height: '100px',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 9999,
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`placed-charm ${isOverCharm ? 'is-replacing' : ''} ${isPendant ? 'mm-pendant-slot' : ''}`}
      onDoubleClick={() => onRemove(index)}
      title="Double click to remove charm"
      style={{
        position: 'relative',
        width: '45px',
        height: '45px',
        opacity: isDragging ? 0.3 : 1,
        cursor: 'grab',
        padding: '0',
        margin: isPendant ? '0 1px' : '0 -1px',
        transition: exportMode ? 'none' : 'all 0.2s ease',
        transform: exportMode
          ? 'none'
          : (isOverCharm
            ? 'scale(1.1) translateY(-5px)'
            : 'scale(1)'),
        zIndex: isOverCharm ? 10 : 2,
        overflow: isPendant ? 'visible' : 'hidden'
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        display: isPendant ? 'block' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: isPendant ? 'visible' : 'hidden',
        position: 'relative'
      }}>
        {isPendant ? (
          <div
            className={`mm-pendant-preview ${exportMode ? 'export-mode' : ''}`}
            style={pendantPreviewStyle}
          >
            <img
              src={charmImageUrl}
              alt={charm.name}
              crossOrigin="anonymous"
              loading="eager"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block'
              }}
            />
          </div>
        ) : (
          <img
            src={charmImageUrl}
            alt={charm.name}
            crossOrigin="anonymous"
            loading="eager"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              display: 'block'
            }}
          />
        )}
      </div>
    </div>
  );
};

const BraceletCanvas = React.forwardRef(({ selectedCharms, onAddCharm, onRemoveCharm, onReplaceCharm, moveCharmInSequence, exportMode = false }, ref) => {
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

  const [stableIsOver, setStableIsOver] = useState(false);

  useEffect(() => {
    if (exportMode) {
      setStableIsOver(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setStableIsOver(isOver);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [isOver, exportMode]);

  const showDropHighlight = !exportMode && stableIsOver;
  const hasPendant = selectedCharms.some(isPendantCharm);

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
        background: '#fdfdfd',
        padding: '40px',
        paddingBottom: hasPendant ? '150px' : '40px',
        overflowX: 'auto',
        borderRadius: '24px',
        border: exportMode ? 'none' : '1px solid rgba(10, 46, 79, 0.12)',
        boxShadow: exportMode ? 'none' : 'inset 0 4px 15px rgba(10,46,79,0.02)'
      }}
    >
      {!exportMode && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '24px',
            pointerEvents: 'none',
            background: 'rgba(217, 92, 20, 0.03)',
            boxShadow: 'inset 0 0 0 1px rgba(217, 92, 20, 0.35)',
            opacity: showDropHighlight ? 1 : 0,
            transition: 'opacity 120ms ease',
          }}
        />
      )}

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
            exportMode={exportMode}
          />
        ))}
      </div>

      {selectedCharms.length === 0 && !showDropHighlight && (
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
