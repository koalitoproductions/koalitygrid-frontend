import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';

function InfoModal({ isOpen, onClose, title, info, isTop }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Key listener for Escape
  useEffect(() => {
    if (!isOpen || !isTop) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isTop, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-[100] transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#282828] p-6 rounded-lg max-w-[800px] max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl text-[#fa7532] flex-grow text-center font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="top-4 right-4 text-[#e0e0e0] hover:text-[#fa7532] text-xl hover:cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="text-left text-[#e0e0e0] text-lg leading-relaxed markdown-content">
          <ReactMarkdown>{info || 'Informationen är inte tillgänglig'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;