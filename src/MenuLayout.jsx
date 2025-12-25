import { Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MenuPage } from "./components/MenuPage";

export default function MenuLayout({
  currentOrder,
  setCurrentOrder,
  deptCode,
  setDeptCode,
  search,
  setSearch,
  activeCategoryId,
  setActiveCategoryId,
  menu,
  isCartOpen,
  setIsCartOpen,
}) {
  return (
    <div className="relative min-h-screen bg-bg">
      {/* MenuPage อยู่ข้างหลัง */}
      <MenuPage
        currentOrder={currentOrder}
        setCurrentOrder={setCurrentOrder}
        deptCode={deptCode}
        setDeptCode={setDeptCode}
        search={search}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={setActiveCategoryId}
        menu={menu}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />

      {/* Overlay layer */}
      <AnimatePresence>
        <Outlet />
      </AnimatePresence>
    </div>
  );
}
