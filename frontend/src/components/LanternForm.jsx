import React from 'react';

const LanternForm = ({ showForm, onToggleForm, formData, onFormChange, onSubmit, labels, language, submitting, error }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData.name, formData.wish, { style: formData.style, glow: formData.glow });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onFormChange(previous => ({ ...previous, [name]: value }));
  };

  const handleQuickRelease = () => {
    onSubmit(formData.name || (language === 'th' ? 'ผู้มองแสง' : 'Anonymous'), formData.wish || (language === 'th' ? 'ขอให้สิ่งดีงามมาถึง' : 'May good things come'), {
      style: 'traditional',
      glow: 'gold'
    });
  };

  if (!showForm) return null;

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="builder-heading">
        <div>
          <h1>{labels.lanternFormTitle}</h1>
          <p>{labels.lanternFormIntro}</p>
        </div>
        <button type="button" className="builder-close" aria-label={labels.closeModal} onClick={onToggleForm}>×</button>
      </div>
      <div className="sprite-preview-stage lantern-preview-stage" aria-live="polite">
        <svg className="lantern-preview-svg" viewBox="0 0 180 230" role="img" aria-label="Lantern live preview">
          <defs>
            <radialGradient id="previewLanternGlow">
              <stop offset="0" stopColor={formData.glow === 'pink' ? '#ff9cba' : formData.glow === 'white' ? '#fff6cc' : '#ffc75a'} stopOpacity=".95"/>
              <stop offset="1" stopColor={formData.glow === 'pink' ? '#ff9cba' : formData.glow === 'white' ? '#fff6cc' : '#ffc75a'} stopOpacity="0"/>
            </radialGradient>
          </defs>
          <ellipse cx="90" cy="118" rx="78" ry="104" fill="url(#previewLanternGlow)" opacity=".55"/>
          {formData.style === 'crystal' ? (
            <path d="M90 18L142 62l-18 124H56L38 62z" fill="#ffffff22" stroke={formData.glow === 'pink' ? '#ff9cba' : '#ffc75a'} strokeWidth="4"/>
          ) : (
            <path d="M90 18c35 0 52 32 48 70l-12 98H54L42 88c-4-38 13-70 48-70z" fill={formData.glow === 'pink' ? '#dd6f87' : formData.glow === 'white' ? '#e8c96e' : '#ed7429'} stroke="#ffe4a0" strokeWidth="3"/>
          )}
          <rect x="78" y="166" width="24" height="21" rx="3" fill="#f7dd73"/>
        </svg>
        {formData.wish && <p className="preview-wish">“{formData.wish}”</p>}
      </div>
      <div className="builder-fields">
        <input
          type="text"
          name="name"
          id="name"
          placeholder={labels.namePlaceholder}
          required
          value={formData.name || ''}
          onChange={handleInputChange}
        />
        <fieldset className="builder-options">
          <legend>{labels.lanternStyle}</legend>
          <div className="option-grid">
            {[
              ['traditional', language === 'th' ? 'โคมดั้งเดิม' : 'Traditional'],
              ['crystal', language === 'th' ? 'คริสตัล' : 'Crystal']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                data-sound="builder"
                className={formData.style === value ? 'selected' : ''}
                onClick={() => onFormChange(previous => ({ ...previous, style: value }))}
              >{label}</button>
            ))}
          </div>
          <p className="cultural-note">{labels.lanternStyleNotes}</p>
        </fieldset>
        <fieldset className="builder-options">
          <legend>{labels.lanternGlow}</legend>
          <div className="glow-options">
            {[
              ['gold', '#f5be57'],
              ['pink', '#f49aaa'],
              ['white', '#f7f3df']
            ].map(([value, color]) => (
              <button
                key={value}
                type="button"
                data-sound="builder"
                aria-label={value}
                className={formData.glow === value ? 'selected' : ''}
                style={{ '--glow-color': color }}
                onClick={() => onFormChange(previous => ({ ...previous, glow: value }))}
              />
            ))}
          </div>
          <p className="cultural-note">{labels.lanternGlowNotes}</p>
        </fieldset>
        <textarea
          rows="6"
          name="wish"
          id="wish-desc"
          placeholder={labels.wishPlaceholder}
          required
          value={formData.wish || ''}
          onChange={handleInputChange}
        />
        <div className="builder-actions">
          <button type="button" className="quick-release" onClick={handleQuickRelease} disabled={submitting}>{labels.quickRelease}</button>
          <input type="submit" value={submitting ? 'Saving…' : labels.lanternSubmit} disabled={submitting} />
        </div>
        {error && <p className="submit-error" role="alert">{error}</p>}
      </div>
      <button className="form-cancel" type="button" onClick={onToggleForm}>
        {labels.cancel}
      </button>
    </form>
  );
};

export default LanternForm;