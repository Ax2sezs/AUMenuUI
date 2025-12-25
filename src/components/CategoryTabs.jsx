// src/components/CategoryTabs.jsx
import React, { useRef, useEffect } from "react";
import { Link } from "react-scroll";


export const CategoryTabs = ({ categories, activeId, setActiveId }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current && activeId) {
            const activeEl = scrollRef.current.querySelector(
                `[data-tab-id="${activeId}"]`
            );
            if (activeEl) {
                activeEl.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }
        }
    }, [activeId]);

    return (
        <div
            className="z-30 w-full px-3"
        // style={{
        //     top: "60px",
        //     backgroundColor: "rgba(255,255,255,0.9)",
        //     backdropFilter: "blur(6px)",
        //     borderBottom: "1px solid rgba(0,0,0,0.06)",
        // }}
        >
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto py-3 items-center hide-scrollbar"
            >
                {categories.map((cat) => {
                    const isActive = activeId === cat.sT_PCategory_Id;

                    return (
                        <Link
                            key={cat.sT_PCategory_Id}
                            to={cat.sT_PCategory_Id}
                            spy={true}
                            smooth={true}
                            offset={-120}
                            duration={300}
                            onSetActive={() => setActiveId(cat.sT_PCategory_Id)}
                            data-tab-id={cat.sT_PCategory_Id}
                            className={`
                                relative whitespace-nowrap text-sm tracking-wide
                                transition-all duration-300
                                ${isActive
                                    ? "text-text-heavy font-semibold"
                                    : "text-stone-400 hover:text-stone-700"
                                }
                            `}
                        >
                            {cat.pCate_Name}

                            {/* underline แบบญี่ปุ่น สุภาพ ไม่ตะโกน */}
                            <span
                                className={`
                                    absolute left-1/2 -bottom-1 h-[1.5px] 
                                    bg-main transition-all duration-300
                                    ${isActive
                                        ? "w-6 -translate-x-1/2 opacity-100"
                                        : "w-0 opacity-0"
                                    }
                                `}
                            />
                        </Link>
                    );
                })}
            </div>

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
