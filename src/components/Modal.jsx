import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, onShowFormula, onShowInfo, isTop }) => {
  if (!isOpen) return null;

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

  return (
    <div 
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-[100] transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#282828] p-6 rounded-lg max-w-[1400px] max-h-[95vh] overflow-y-auto shadow-lg transform transition-transform duration-300">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3">
            <button
              onClick={onShowFormula}
              className="text-[#e0e0e0] hover:text-[#fa7532] hover:bg-[#383838] p-1 rounded transition hover:cursor-pointer"
              title="Visa formel"
            >
              <i className="fas fa-square-root-alt"></i>
            </button>
            <button
              onClick={onShowInfo}
              className="text-[#e0e0e0] hover:text-[#fa7532] hover:bg-[#383838] p-1 rounded transition hover:cursor-pointer"
              title="Visa information"
            >
              <i className="fas fa-info-circle"></i>
            </button>
          </div>
          <h3 className="text-xl text-[#fa7532] flex-grow text-center font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="top-4 right-4 text-[#e0e0e0] hover:text-[#fa7532] text-xl hover:cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>  
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;