import React from 'react';

const LanternForm = ({ showForm, onToggleForm, formData, onFormChange, onSubmit, labels }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData.name, formData.wish);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormChange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!showForm) return null;

  return (
    <form onSubmit={handleSubmit} className="form">
      <h1>{labels.lanternFormTitle}</h1>
      <p>{labels.lanternFormIntro}</p>
      <div>
        <input
          type="text"
          name="name"
          id="name"
          placeholder={labels.namePlaceholder}
          required
          value={formData.name || ''}
          onChange={handleInputChange}
        />
        <textarea
          rows="6"
          name="wish"
          id="wish-desc"
          placeholder={labels.wishPlaceholder}
          required
          value={formData.wish || ''}
          onChange={handleInputChange}
        />
        <input type="submit" value={labels.lanternSubmit} />
      </div>
      <button className="form-cancel" type="button" onClick={onToggleForm}>
        {labels.cancel}
      </button>
    </form>
  );
};

export default LanternForm;