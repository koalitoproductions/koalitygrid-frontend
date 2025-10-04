import React, { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Modal from './Modal';
import FormulaModal from './FormulaModal';
import InfoModal from './InfoModal';
import { ModalProvider } from './ModalContext';

function Layout({ children }) {
  const [modalData, setModalData] = useState(null);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false); // State for notes sidebar
  const [noteContent, setNoteContent] = useState(''); // State for textarea content

  const openModal = (calc) => setModalData(calc);
  const closeModal = () => {
    setModalData(null);
    setShowFormulaModal(false);
    setShowInfoModal(false);
  };

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNoteContent(savedNotes);
    }
  }, []);

  // Save notes to localStorage on change
  useEffect(() => {
    localStorage.setItem('notes', noteContent);
  }, [noteContent]);

  const toggleNotesSidebar = () => {
    setIsNotesOpen(!isNotesOpen);
  };

  const clearNotes = () => {
    setNoteContent('');
    localStorage.removeItem('notes');
  };

  const loadComponent = (folder, name) => 
    lazy(() => import(`./${folder}/${name}.jsx`));

  const ComponentToRender = useMemo(() => {
    return modalData?.component ? loadComponent(modalData.folder, modalData.component) : null;
  }, [modalData?.component, modalData?.folder]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(noteContent);
  };

  return (
    <ModalProvider
      value={{ modalData, openModal, closeModal, showFormulaModal, setShowFormulaModal, showInfoModal, setShowInfoModal }}
    >
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-grow p-6">{children}</main>
        <BottomNav />
        {/* Open Sidebar Button */}
        <button
          id="openSidebar"
          className="rounded-full fixed top-4 right-4 w-12 h-12 flex items-center justify-center z-50 bg-orange-400 text-white shadow-lg hover:bg-orange-500 transition-colors duration-200 hover:cursor-pointer"
          onClick={toggleNotesSidebar}
        >
          <i className="fas fa-pen text-xl"></i>
        </button>
        {/* Notes Sidebar */}
        <div 
          id="noteSidebar" 
          className={`fixed top-0 ${isNotesOpen ? 'right-0' : 'right-[-350px]'} w-[350px] h-full bg-[#282828] border-l border-[#424242] shadow-[-5px_0_15px_rgba(0,0,0,0.3)] transition-right duration-300 z-[1000] flex flex-col p-6 text-[#e0e0e0]`}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold">Anteckningar</h3>
            <button 
              id="closeSidebar" 
              className="bg-none border-none text-3xl text-[#e0e0e0] hover:cursor-pointer hover:text-[#fa7532] transition-colors duration-200" 
              onClick={toggleNotesSidebar}
            >
              ×
            </button>
          </div>
          <div className="flex justify-start items-center mb-4 gap-2">
            <button
              className="bg-none border-none text-sm px-2 py-1 bg-[#1c1c1c] rounded-lg hover:bg-[#383838] transition-colors duration-200 hover:cursor-pointer"
              onClick={copyToClipboard}
            >
              <i className="fas fa-copy"></i>
            </button>
            <button
              className="bg-none border-none text-sm px-2 py-1 bg-[#1c1c1c] rounded-lg hover:bg-[#383838] transition-colors duration-200 hover:cursor-pointer"
              onClick={clearNotes}
            >
              <i className="fas fa-trash text-red"></i>
            </button>
          </div>
          <textarea
            id="noteContent"
            className="w-full flex-grow bg-[#1c1c1c] border border-[#424242] rounded-lg p-4 text-[#e0e0e0] text-base resize-none mb-4"
            placeholder="Skriv dina anteckningar här..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          ></textarea>
        </div>
        {modalData && (
          <>
            <Modal
              isOpen={!!modalData}
              onClose={closeModal}
              title={modalData.name}
              onShowFormula={() => setShowFormulaModal(true)}
              onShowInfo={() => setShowInfoModal(true)}
              isTop={!showFormulaModal && !showInfoModal}
            >
              {modalData.component ? (
                <Suspense fallback={<div className="text-[#e0e0e0]">Laddar...</div>}>
                  <ComponentToRender onClose={closeModal} />
                </Suspense>
              ) : (
                <div className="text-[#e0e0e0]">
                  {modalData.formula && (
                    <div>
                      <strong>Formel:</strong> {modalData.formula}
                    </div>
                  )}
                  {modalData.info && (
                    <div>
                      <strong>Info:</strong>{' '}
                      <div dangerouslySetInnerHTML={{ __html: modalData.info }} />
                    </div>
                  )}
                </div>
              )}
            </Modal>
            <FormulaModal
              isOpen={showFormulaModal}
              onClose={() => setShowFormulaModal(false)}
              title={`Formler för ${modalData.name}`}
              formula={modalData.formula}
              isTop={showFormulaModal}
            />
            <InfoModal
              isOpen={showInfoModal}
              onClose={() => setShowInfoModal(false)}
              title={`Information om ${modalData.name}`}
              info={modalData.info}
              isTop={showInfoModal}
            />
          </>
        )}
      </div>
    </ModalProvider>
  );
}

export default Layout;