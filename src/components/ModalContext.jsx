import { createContext, useContext } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children, value }) {
  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export const useModal = () => useContext(ModalContext);