import React, { useState, useEffect } from 'react';

const CharmForm = ({ initialData, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    price: 0,
    stock: 0,
    description: '',
    category: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        category: initialData.category?._id || initialData.category
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
      <h3>{initialData ? 'Edit Charm' : 'Add New Charm'}</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '15px 0' }}>
        <input 
          type="text" 
          placeholder="Charm Name" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select 
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '15px 0' }}>
        <input 
          type="number" 
          placeholder="Price" 
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="number" 
          placeholder="Stock" 
          value={formData.stock}
          onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ margin: '15px 0' }}>
        <input 
          type="text" 
          placeholder="Image URL" 
          value={formData.image}
          onChange={(e) => setFormData({...formData, image: e.target.value})}
          required
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ margin: '15px 0' }}>
        <textarea 
          placeholder="Description" 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn-premium">Save</button>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px' }}>Cancel</button>
      </div>
    </form>
  );
};

export default CharmForm;
