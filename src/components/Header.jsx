// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert, ClipboardList, Receipt, Search, ShoppingCart, Utensils } from "lucide-react";
import { toast } from "react-hot-toast";

export const Header = ({
    onLogoClick,
    cartCount,
    historyCount,
    currentOrder,
    search,
    setSearch,
    branchCode
}) => {
    const navigate = useNavigate();

    const handleCartClick = () => {
        if (cartCount === 0) {
            toast.error("Cart is empty");
            return;
        }
        navigate("/cart");
    };

    const handleHistoryClick = () => {
        navigate("/history");
    };
    console.log("History Count:", historyCount);
    return (
        <header
            className="sticky top-0 z-40 w-full px-4 py-3 flex items-center justify-between shadow-sm transition-all duration-300"
            style={{
                backgroundColor: 'rgba(253, 251, 247, 0.9)', // #fdfbf7 with opacity
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}
        >
            {/* Left: Table Info (Hanko Stamp Style) */}
            <div className="flex items-center">
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-main/50 shadow-sm bg-white"
                >
                    <Utensils size={14} className="text-main" />
                    <span className="text-sm font-bold tracking-wide text-main">
                        {localStorage.getItem("tableNo")}
                    </span>
                </div>
            </div>

            {/* Middle: Search Bar (Minimal Zen) */}
            <div className="relative mx-3 flex-1 max-w-[200px]">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-main"
                    size={16}
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-full text-sm bg-white border border-stone-200 focus:outline-none focus:border-main focus:ring-1 focus:ring-main transition-all placeholder-stone-400 text-stone-700 shadow-inner"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(`/menu?search=${search}`);
                    }}
                />

            </div>

            {/* Right: Cart Button */}
            <div className="flex items-center">
                <button
                    className="relative p-2.5 rounded-full transition-transform hover:scale-105 active:scale-95 group"
                    onClick={handleHistoryClick}
                >
                    {/* Circle Background effect on hover */}
                    <div className="absolute inset-0 bg-stone-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200" />
                    <span className="flex flex-col text-stone-600 justify-center items-center text-xs">
                        <ClipboardList
                            size={22}
                            className="relative z-10 text-stone-600 group-hover:text-stone-800"
                        />
                        Pay
                    </span>
                    {(historyCount?.length ?? 0) > 0 && (
                        <span
                            className="absolute top-0 right-0 z-20 "
                        >
                            <CircleAlert size={18} className="text-main" />
                        </span>
                    )}
                    {/* <h1 className="text-black text-xs bg-stone-400 rounded-full w-8 h-8 px-4 py-2">
                        Bill
                    </h1> */}
                    {/* {cartCount > 0 && (
                        <span
                            className="absolute top-0 right-0 z-20 text-[10px] bg-main text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-sm border border-white animate-bounce-short"                        >
                            {cartCount}
                        </span>
                    )} */}
                </button>
                <button
                    className="relative p-2.5 rounded-full transition-transform hover:scale-105 active:scale-95 group"
                    onClick={handleCartClick}
                >
                    {/* Circle Background effect on hover */}
                    <div className="absolute inset-0 bg-stone-100 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200" />
                    <span className="flex flex-col text-stone-600 justify-center items-center text-xs">

                        <ShoppingCart
                            size={22}
                            className="relative z-10 text-stone-600 group-hover:text-stone-800"
                        />
                        Cart
                    </span>
                    {cartCount > 0 && (
                        <span
                            className="absolute top-0 right-0 z-20 bg-main text-[10px] text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-sm border border-white animate-bounce-short"
                        >
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
};