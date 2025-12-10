// src/components/CategoryTabs.jsx
import React, { useRef, useEffect } from "react";
import { Link } from "react-scroll";

export const CategoryTabs = ({ categories, activeId, setActiveId }) => {
    const scrollRef = useRef(null);

    // เลื่อน Tab ให้ active อยู่กลาง
    useEffect(() => {
        if (scrollRef.current && activeId) {
            const activeEl = scrollRef.current.querySelector(`[data-tab-id="${activeId}"]`);
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
        }
    }, [activeId]);

    return (
        <div
            className="sticky z-30 w-full py-3 px-2 transition-all"
            style={{
                top: '60px', // *ปรับค่านี้ตามความสูงของ Header และ Navbar ด้านบนสุดครับ (เช่น 60px หรือ 100px)
                backgroundColor: 'rgba(253, 251, 247, 0.95)', // สีครีมโปร่งแสง
                backdropFilter: 'blur(5px)',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}
        >
            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto px-1 w-full items-center hide-scrollbar"
            >
                {categories.map((cat) => {
                    const isActive = activeId === cat.sT_PCategory_Id;
                    return (
                        <Link
                            key={cat.sT_PCategory_Id}
                            to={cat.sT_PCategory_Id}
                            spy={true}
                            smooth={true}
                            offset={-150}
                            duration={500}
                            onSetActive={() => setActiveId(cat.sT_PCategory_Id)}
                            data-tab-id={cat.sT_PCategory_Id}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer select-none border
    ${isActive
                                    ? "text-main border-main bg-main/10 shadow-sm"
                                    : "text-stone-500 border-transparent hover:bg-stone-100"
                                }`}
                        >
                            {cat.pCate_Name}
                        </Link>

                    );
                })}
            </div>

            {/* CSS ซ่อน scrollbar */}
            <style>
                {`
                  .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                  .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}
            </style>
        </div>
    );
};