// import React from "react";
// import { motion } from "framer-motion";

// const DEPT_NAMES = {
//   All: "All",
//   BV: "Beverage",
//   DE: "Dessert",
//   KG: "Kakigori",
//   TO: "Toast",
//   BF: "Pancake",
//   TG: "Togo",
//   AD: "Add"
// };

// const ICONS = [
//   "logo.png",
//   "/menu/1.png",
//   "/menu/4.png",
//   "/menu/3.png",
//   "/menu/2.png",
//   "/menu/5.png",
// ];

// export const Navbar = ({ deptCode, setDeptCode }) => {
//   const keys = Object.keys(DEPT_NAMES);

//   return (
//     <div className="p-4">
//       <div className="grid grid-cols-4 gap-3">
//         {keys.map((code, index) => {
//           const isActive = deptCode === code;
//           const name = DEPT_NAMES[code];
//           const iconSrc = ICONS[index % ICONS.length];

//           return (
//             <motion.button
//               key={code}
//               onClick={() => setDeptCode(code)}
//               whileTap={{ scale: 0.95 }}
//               className={`flex flex-col items-center transition ${isActive
//                   ? "text-main"
//                   : "text-text-heavy hover:text-main/80"
//                 }`}
//             >
//               {/* Icon only in circle */}
//               <div className={`w-12 h-12 mb-1 rounded-2xl flex items-center justify-center ${isActive ? "bg-white" : "bg-main/30"
//                 }`}>
//                 <img src={iconSrc} className="w-6 h-6 object-contain" />
//               </div>
//               {/* Name below */}
//               <span className="text-[11px] text-center leading-tight">{name}</span>
//             </motion.button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const DEPT_NAMES = {
  All: "All",
  BV: "Beverage",
  DE: "Dessert",
  KG: "Kakigori",
  TO: "Toast",
  BF: "Pancake",
  TG: "Togo",
  AD: "Add",
};

export const Navbar = ({ deptCode, setDeptCode }) => {
  const keys = Object.keys(DEPT_NAMES);
  const containerRef = useRef(null);
  const activeRef = useRef(null);

  // scroll badge active เข้า view
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      setTimeout(() => {
        const container = containerRef.current;
        const activeBadge = activeRef.current;
        const offset =
          activeBadge.offsetLeft -
          container.offsetLeft -
          container.clientWidth / 2 +
          activeBadge.clientWidth / 2;
        container.scrollTo({ left: offset, behavior: "smooth" });
      }, 50);
    }
  }, [deptCode]);




  return (
    <div
      ref={containerRef}
      className="flex gap-3 p-2 overflow-x-auto max-w-screen bg-bg shadow-md scrollbar-hide"
    >
      {keys.map((code) => {
        const isActive = deptCode === code;
        return (
          <motion.button
            key={code}
            ref={isActive ? activeRef : null}
            onClick={() => setDeptCode(code)}
            whileTap={{ scale: 0.9 }}
            className={`px-4 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition ${isActive
              ? "bg-main text-white shadow-md"
              : "bg-main/60 text-white hover:bg-white/30"
              }`}
          >
            {DEPT_NAMES[code]}
          </motion.button>
        );
      })}
    </div>
  );
};
