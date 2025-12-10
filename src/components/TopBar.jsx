// // src/components/TopBar.jsx
// import React, { useEffect, useRef } from "react";
// import { ShoppingCart } from "lucide-react";

// export const TopBar = ({
//   menu,
//   activeCategory,
//   setActiveCategory,
//   scrollToCategory,
//   cartCount,
//   onCartClick,
// }) => {
//   const badgeRef = useRef(null);

//   // scroll active button เข้ากลาง
//   useEffect(() => {
//     if (!badgeRef.current || !activeCategory) return;
//     const activeBtn = badgeRef.current.querySelector(
//       `[data-category-id='${activeCategory}']`
//     );
//     if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", inline: "center" });
//   }, [activeCategory]);

//   if (!menu || menu.length === 0) return null;

//   return (
//     <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur-sm border-b border-gray-200">
//       {/* Badge 80% */}
//       <div className="flex-1 flex items-center overflow-x-auto gap-2 scrollbar-hide" ref={badgeRef}>
//         <button
//           data-category-id={menu[0].sT_PCategory_Id}
//           onClick={() => scrollToCategory(menu[0].sT_PCategory_Id)}
//           className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
//             activeCategory === menu[0].sT_PCategory_Id
//               ? "bg-main text-white"
//               : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//           }`}
//         >
//           All
//         </button>

//         {menu.map((cat) => (
//           <button
//             key={cat.sT_PCategory_Id}
//             data-category-id={cat.sT_PCategory_Id}
//             onClick={() => scrollToCategory(cat.sT_PCategory_Id)}
//             className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
//               activeCategory === cat.sT_PCategory_Id
//                 ? "bg-main text-white"
//                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//             }`}
//           >
//             {cat.pCate_Name}
//           </button>
//         ))}
//       </div>

//       {/* Cart 20% */}
//       <div className="ml-3 flex-shrink-0">
//         <button
//           className="relative bg-white p-2 rounded-full shadow hover:scale-105 transition"
//           onClick={onCartClick}
//         >
//           <ShoppingCart size={22} className="text-text-heavy" />
//           {cartCount > 0 && (
//             <span className="absolute -top-1 -right-1 text-xs bg-main text-white border-2 border-white rounded-full w-5 h-5 flex items-center justify-center font-semibold">
//               {cartCount}
//             </span>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };
