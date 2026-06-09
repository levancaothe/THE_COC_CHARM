import { getProxyImageUrl } from '../utils/imageProxy';

const CategoryCard = ({ category, onClick, isSelected }) => {

  return (
    <div
      className={`category-card glass ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(category)}
        style={{
          padding: '15px',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          border: isSelected ? '2px solid var(--primary-gold)' : '1px solid transparent',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
          backgroundColor: isSelected ? 'rgba(217, 92, 20, 0.08)' : 'rgba(255, 255, 255, 0.02)'
        }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '5px',
          width: '100%',
          height: '120px',
          padding: '10px',
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-sm)',
          boxSizing: 'border-box'
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => {
          const thumb = (category.thumbnails || [])[index];
          return (
            <div
              key={index}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: thumb ? '#eff3f8' : 'transparent',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}
            >
              {thumb ? (
                <img
                  src={getProxyImageUrl(thumb)}
                  alt=""
                  crossOrigin="anonymous"
                  style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <h3 style={{ fontSize: '1rem', textAlign: 'center', margin: 0 }}>{category.name}</h3>
    </div>
  );
};

export default CategoryCard;
