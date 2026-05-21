import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import CharmDetailsModal from './CharmDetailsModal';
import './CharmCard.css';

const CharmCard = ({ charm }) => {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="charm-card glass">
        <div className="charm-image">
          <img src={charm.image} alt={charm.name} />
        </div>
        <div className="charm-info">
          <span className="charm-category">{charm.category?.name}</span>
          <h3 className="charm-name">{charm.name}</h3>
          <p className="charm-price">${charm.price}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button className="btn-add" onClick={() => addToCart(charm)}>Thêm vào giỏ</button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(true)}>Chi tiết</button>
          </div>
        </div>
      </div>
      <CharmDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} charm={charm} />
    </>
  );
};

export default CharmCard;
