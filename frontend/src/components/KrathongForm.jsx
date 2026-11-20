import React from 'react';
import { KrathongFlowers } from './Krathong.jsx';

const KrathongForm = ({ formData, onFormChange, onSubmit, onToggleForm, labels, language, submitting, error }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData.name, formData.wish, formData);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onFormChange(previous => ({ ...previous, [name]: value }));
  };

  const handleQuickRelease = () => {
    onSubmit(
      formData.name || (language === 'th' ? 'ผู้ลอยกระทง' : 'Anonymous'),
      formData.wish || (language === 'th' ? 'ขอให้สิ่งดีงามมาถึง' : 'May good things come'),
      { base: 'banana', candle: 'gold', incense: 'classic', accent: 'pink' }
    );
  };

  const choose = (name, value) => {
    onFormChange(previous => ({ ...previous, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="builder-heading">
        <div>
          <h1>{labels.krathongFormTitle}</h1>
          <p>{labels.krathongFormIntro}</p>
        </div>
        <button type="button" className="builder-close" aria-label={labels.closeModal} onClick={onToggleForm}>×</button>
      </div>
      <div className="sprite-preview-stage" aria-live="polite">
        <svg className="krathong-preview-svg" viewBox="0 0 240 190" role="img" aria-label="Krathong live preview">
          <ellipse cx="120" cy="150" rx="82" fill="#25a66f" opacity=".18" />
          {formData.base === 'lotus' ? (
            <g fill={formData.accent === 'gold' ? '#f5be57' : formData.accent === 'white' ? '#f7f3df' : '#f49aaa'}>
              {[0,45,90,135,180,225,270,315].map(angle => <ellipse key={angle} cx="120" cy="86" rx="19" ry="48" transform={`rotate(${angle} 120 120)`} />)}
            </g>
          ) : (
            <g fill="url(#previewLeaf)">
              <defs><linearGradient id="previewLeaf"><stop stopColor="#27ad78"/><stop offset="1" stopColor="#08745c"/></linearGradient></defs>
              <path d="M38 138L65 72l27 76zM72 148l27-92 21 92zM120 150l22-92 28 92zM155 148l24-76 26 66zM20 140l100 38 100-38-100-31z" />
            </g>
          )}
          <KrathongFlowers
            accent={formData.accent === 'gold' ? '#f5be57' : formData.accent === 'white' ? '#f7f3df' : '#f49aaa'}
          />
          <rect x="94" y="132" width="52" height="42" rx="4" fill="#087b64" />
          <rect x="88" y="74" width="12" height="68" rx="5" fill={formData.candle === 'pink' ? '#f49aaa' : formData.candle === 'white' ? '#f7f3df' : '#f5be57'} />
          <rect x="140" y="74" width="12" height="68" rx="5" fill="#f7f1d7" />
          <ellipse cx="94" cy="72" rx="8" ry="13" fill="#ff8a32" />
          <circle cx="94" cy="67" r="6" fill="#ffd66b" />
          {formData.incense === 'bundled' ? (
            <g fill="#e6dfc7"><rect x="112" y="62" width="7" height="78"/><rect x="124" y="58" width="7" height="82"/><rect x="136" y="64" width="7" height="76"/></g>
          ) : (
            <g stroke="#dfe6df" strokeWidth="4" strokeLinecap="round"><path d="M120 68v74M128 75v67"/></g>
          )}
        </svg>
        {formData.wish && <p className="preview-wish">“{formData.wish}”</p>}
      </div>
      <div className="builder-fields">
        <input
          type="text"
          name="name"
          placeholder={labels.namePlaceholder}
          required
          value={formData.name || ''}
          onChange={handleInputChange}
        />
        <fieldset className="builder-options">
          <legend>{labels.krathongBase}</legend>
          <div className="option-grid">
            <button type="button" data-sound="bananaLeaf" className={formData.base === 'banana' ? 'selected' : ''} onClick={() => choose('base', 'banana')}>
              {language === 'th' ? 'ใบกล้วย' : 'Banana leaf'}
            </button>
            <button type="button" data-sound="builder" className={formData.base === 'lotus' ? 'selected' : ''} onClick={() => choose('base', 'lotus')}>
              {language === 'th' ? 'ดอกบัว' : 'Lotus'}
            </button>
          </div>
          <p className="cultural-note">{labels.baseNotes[formData.base === 'lotus' ? 'lotus' : 'banana']}</p>
        </fieldset>
        <fieldset className="builder-options">
          <legend>{labels.candle}</legend>
          <div className="option-grid">
            {[
              ['gold', language === 'th' ? 'สีทอง' : 'Gold'],
              ['pink', language === 'th' ? 'สีชมพู' : 'Pink'],
              ['white', language === 'th' ? 'สีขาว' : 'White']
            ].map(([value, label]) => (
              <button key={value} type="button" data-sound="builder" className={formData.candle === value ? 'selected' : ''} onClick={() => choose('candle', value)}>
                {label}
              </button>
            ))}
          </div>
          <p className="cultural-note">{labels.candleNotes}</p>
        </fieldset>
        <fieldset className="builder-options">
          <legend>{labels.incense}</legend>
          <div className="option-grid">
            {[
              ['classic', language === 'th' ? 'ดอกเดียว' : 'Classic'],
              ['bundled', language === 'th' ? 'มัดธูป' : 'Bundled']
            ].map(([value, label]) => (
              <button key={value} type="button" data-sound="builder" className={formData.incense === value ? 'selected' : ''} onClick={() => choose('incense', value)}>
                {label}
              </button>
            ))}
          </div>
          <p className="cultural-note">{labels.incenseNotes}</p>
        </fieldset>
        <fieldset className="builder-options">
          <legend>{labels.accent}</legend>
          <div className="accent-options">
            {['pink', 'gold', 'white'].map(value => (
              <button key={value} type="button" data-sound="builder" aria-label={value} className={formData.accent === value ? 'selected' : ''} onClick={() => choose('accent', value)}>
                <span style={{ background: value === 'pink' ? '#f49aaa' : value === 'gold' ? '#f5be57' : '#f7f3df' }} />
              </button>
            ))}
          </div>
          <p className="cultural-note">{labels.accentNotes}</p>
        </fieldset>
        <textarea
          rows="6"
          name="wish"
          placeholder={labels.wishPlaceholder}
          required
          value={formData.wish || ''}
          onChange={handleInputChange}
        />
        <div className="builder-actions">
          <button type="button" className="quick-release" onClick={handleQuickRelease} disabled={submitting}>{labels.quickRelease}</button>
          <input type="submit" value={submitting ? 'Saving…' : labels.krathongSubmit} disabled={submitting} />
        </div>
        {error && <p className="submit-error" role="alert">{error}</p>}
      </div>
      <button className="form-cancel" type="button" onClick={onToggleForm}>
        {labels.cancel}
      </button>
    </form>
  );
};

export default KrathongForm;
