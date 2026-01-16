// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Utensils,
  ClipboardList,
  BellRing,
} from "lucide-react";
import { toast } from "react-hot-toast";

export const Header = ({
  cartCount,
  currentOrder,
  search,
  setSearch,
  setCallStaff,
}) => {
  const navigate = useNavigate();

  const handleCartClick = () => {
    if (cartCount === 0) {
      toast.error("Cart is empty");
      return;
    }
    navigate("menu/cart");
  };

  return (
    <header className="sticky top-0 z-40 w-full h-[56px] pl-3 flex items-center bg-white/90 backdrop-blur border-b border-stone-200">
      
      {/* LEFT */}
      <div className="flex items-center gap-2 shrink-0 text-stone-700">
        <Utensils size={14} />
        <span className="text-sm font-medium tracking-wide">
          {currentOrder?.ord_CustTable}
        </span>
      </div>

      {/* CENTER */}
      <div className="flex-1 flex justify-center px-2">
        <div className="relative w-full max-w-[220px] sm:max-w-[280px] md:max-w-[360px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/menu?search=${search}`);
              }
            }}
            placeholder="Search menu"
            className="
              w-full pl-8 pr-3 py-1.5 text-sm
              border border-stone-200 rounded-full
              bg-transparent text-stone-700
              placeholder-stone-400
              focus:outline-none focus:border-stone-400
            "
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Call Staff */}
        <button
          onClick={() => setCallStaff(true)}
          className="rounded-full p-1.5 text-stone-600 hover:text-stone-900 transition"
        >
          <BellRing size={18} />
        </button>

        {/* Divider (hide on very small screens) */}
        <div className="hidden sm:block w-px h-5 bg-stone-300" />

        {/* History (only cash & >= sm) */}
        {currentOrder?.payment_Method === "cash" && (
          <button
            onClick={() => navigate("menu/history")}
            className="flex rounded-full p-1.5 text-stone-600 hover:text-stone-900 transition"
          >
            <ClipboardList size={18} />
          </button>
        )}

        {/* Cart */}
        <button
          onClick={handleCartClick}
          className="relative p-1.5 text-stone-700 hover:text-stone-900 transition"
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="
              absolute -top-1 -right-1
              min-w-[16px] h-[16px]
              px-1 text-[10px]
              bg-main text-white rounded-full
              flex items-center justify-center
              font-medium
            ">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
