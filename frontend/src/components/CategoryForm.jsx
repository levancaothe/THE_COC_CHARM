import React, { useState, useEffect } from 'react';

const CategoryForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
      <h3>{initialData ? 'Edit Category' : 'Add New Category'}</h3>
      <div style={{ margin: '15px 0' }}>
        <input 
          type="text" 
          placeholder="Category Name" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn-premium">Save</button>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px' }}>Cancel</button>
      </div>
    </form>
  );
};

export default CategoryForm;
