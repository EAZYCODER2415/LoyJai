import { useEffect, useState } from 'react';

const Popup = ({ show, onClose, className = '', children }) => {
  const [mounted, setMounted] = useState(show);
  const [content, setContent] = useState(children);

  useEffect(() => {
    if (show) {
      setMounted(true);
      setContent(children);
      return undefined;
    }

    const timeout = window.setTimeout(() => setMounted(false), 560);
    return () => window.clearTimeout(timeout);
  }, [show, children]);

  if (!mounted) return null;

  return (
    <div
      className={`popup-overlay ${className} ${show ? 'is-open' : 'is-closing'}`}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {content}
    </div>
  );
};

export default Popup;
