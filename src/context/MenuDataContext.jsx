// src/context/MenuDataContext.jsx
import { createContext, useContext } from "react";
import { useFetchData } from "../hooks/useFetchData";

const MenuDataContext = createContext(null);

export const MenuDataProvider = ({ children }) => {
  const fetchData = useFetchData(); // เรียก hook เดิม

  return (
    <MenuDataContext.Provider value={fetchData}>
      {children}
    </MenuDataContext.Provider>
  );
};

// Hook สำหรับเรียกใช้ง่าย ๆ
export const useMenuData = () => {
  const context = useContext(MenuDataContext);
  if (!context) {
    throw new Error("useMenuData must be used within a MenuDataProvider");
  }
  return context;
};
