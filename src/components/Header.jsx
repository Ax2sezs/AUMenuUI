// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlert, Search, ShoppingCart, Utensils, ClipboardList } from "lucide-react";
import { toast } from "react-hot-toast";

export const Header = ({
    cartCount,
    currentOrder,
    search,
    setSearch,
}) => {
    const navigate = useNavigate();

    const handleCartClick = () => {
        if (cartCount === 0) {
            toast.error("Cart is empty");
            return;
        }
        navigate("menu/cart");
    };
    const handleHistoryClick = () => {
        navigate("menu/history")
    }
    return (
        <header
            className="w-full h-[56px] flex items-center justify-between"
            // style={{
            //     backgroundColor: "rgba(255,255,255,0.9)",
            //     backdropFilter: "blur(8px)",
            //     borderBottom: "1px solid rgba(0,0,0,0.06)",
            // }}
        >
            {/* Left: Table (Quiet Stamp) */}
            <div className="flex items-center gap-1.5 text-stone-700">
                <Utensils size={14} />
                <span className="text-sm tracking-wide font-medium">
                    {currentOrder.ord_CustTable}
                </span>
            </div>

            {/* Center: Search (Zen Input) */}
            <div className="relative w-full max-w-[180px]">
                <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="
                        w-full pl-8 pr-3 py-1.5 text-sm
                        bg-transparent border border-stone-200
                        rounded-full text-stone-700
                        focus:outline-none focus:border-stone-400
                        placeholder-stone-400
                        transition-all
                    "
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            navigate(`/menu?search=${search}`);
                        }
                    }}
                />
            </div>
            {currentOrder?.payment_Method == 'cash' && (
                <button
                    className="relative rounded-full transition-transform hover:scale-105 active:scale-95 group"
                    onClick={handleHistoryClick}
                >
                    {/* Circle Background effect on hover */}
                    <div className="absolute inset-0 bg-stone-900 rounded-full scale-0 group-hover:scale-100 transition-transform duration-200" />
                    <span className="flex flex-col text-stone-600 justify-center items-center mr-2">
                        <ClipboardList
                            size={18}
                            className="relative z-10 text-stone-600 group-hover:text-stone-800"
                        />
                    </span>
                </button>
            )}

            {/* {(historyCount?.length ?? 0) > 0 && (
                    <span
                        className="absolute top-0 right-0 z-20 "
                    >
                        <CircleAlert size={18} className="text-main" />
                    </span>
                )} */}
            {/* <h1 className="text-black text-xs bg-stone-400 rounded-full w-8 h-8 px-4 py-2">
                        Bill
                    </h1> */}
            {/* {cartCount > 0 && (
                        <span
                            className="absolute top-0 right-0 z-20 text-[10px] bg-main text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-sm border border-white animate-bounce-short"                        >
                            {cartCount}
                        </span>
                    )} */}
            {/* Right: Cart */}
            <button
                onClick={handleCartClick}
                className="
                    relative flex items-center gap-1
                    pr-2
                    text-stone-700 text-xs
                    hover:text-stone-900
                    transition-colors
                "
            >
                <ShoppingCart size={18} />
                {/* <span className="tracking-wide">Cart</span> */}

                {cartCount > 0 && (
                    <span
                        className="
                            absolute -top-2 -right-0.5
                            text-[10px] px-1.5 h-[16px]
                            rounded-full bg-main text-white
                            flex items-center justify-center
                            font-medium
                        "
                    >
                        {cartCount}
                    </span>
                )}
            </button>
        </header >
    );
};
