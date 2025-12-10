// src/pages/MenuPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMenuData } from "../context/MenuDataContext";
import { ShoppingCart, Loader2 } from "lucide-react";

export const MenuPage = ({
  currentOrder,
  deptCode,
  search,
  activeCategoryId,
  setActiveCategoryId,
  menu,
}) => {
  const {
    fetchMenu,
    menuLoading,
    error,
  } = useMenuData();

  const navigate = useNavigate();
  const containerRef = useRef(null);

  // --- OLD IMAGE STATE (COMMENTED OUT) ---
  const [imgStages, setImgStages] = useState({});
  const [showContent, setShowContent] = useState(false);

  // --- Function: Check Cart Qty ---
  const getQtyInOrder = (productId) => {
    if (!currentOrder || !currentOrder.orderDetails) return 0;
    const items = currentOrder.orderDetails.filter(
      (x) => x.m_Product_Id?.toString() === productId?.toString()
    );
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.ord_Qty || 0), 0);
  };

  const filteredMenu = menu
    .map(cat => ({
      ...cat,
      products: cat.products.filter(p =>
        p.product_Name.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(cat => cat.products.length > 0);

  // --- Set active category if empty ---
  useEffect(() => {
    if (filteredMenu.length > 0 && !activeCategoryId) {
      setActiveCategoryId(filteredMenu[0].sT_PCategory_Id);
    }
  }, [filteredMenu, activeCategoryId, setActiveCategoryId]);

  // --- Loading Effect ---
  useEffect(() => {
    let timer;
    if (menuLoading) {
      setShowContent(false);
    } else {
      if (menu && menu.length > 0) {
        setActiveCategoryId(menu[0].sT_PCategory_Id);
      }
      timer = setTimeout(() => setShowContent(true), 400);
    }
    return () => clearTimeout(timer);
  }, [menuLoading, menu]);

  // --- OLD HELPER: Images (COMMENTED OUT) ---

  const getSrc = (product) => {
    const stage = imgStages[product.m_Product_Id] || 0;
    if (stage === 0) return `./img/${product.product_Image.replace(".png", ".jpg")}`;
    if (stage === 1) return `https://posau.mmm2007.net/Images/Products/${product.product_Image}`;
    return "/default.png";
  };


  // --- NEW HELPER: Mock Images ---
  // const MOCK_IMAGE_COUNT = 10;

  // const getMockSrc = (index) => {
  //   const imgNumber = (index % MOCK_IMAGE_COUNT) + 1;
  //   return `/img/Mock/${imgNumber}.png`; // Mock1.png -> /img/Mock/1.png
  // };


  // ---------------------------------

  const handleProductClick = (product) => {
    navigate(`${product.m_Product_Id}`);
  };

  // --- Render Loading State ---
  if (!showContent || menuLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-screen flex flex-col items-center justify-center bg-white bg-grid-pattern"
      >
        <div className="w-12 h-12 border-[1px] border-t-[#2C2C2C] border-r-[#2C2C2C] border-b-transparent border-l-transparent rounded-full animate-spin mb-6" />
        <p className="text-[10px] tracking-[0.3em] text-[#8C8C8C] uppercase animate-pulse">
          Preparing Menu
        </p>
      </motion.div>
    );
  }

  let productIndex = 0;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-grid-pattern px-4 w-screen text-stone-700 pb-24 bg-[#FAFAFA]"
    >
      {/* --- LOGO SECTION --- */}
      <div className="flex flex-col items-center justify-center pb-2 pt-2">
        <div className="p-2">
          <img src="/logo.png" className="w-full h-12 object-contain" alt="Logo" />
          <span className="text-sm font-bold text-text-heavy">アフターユー</span>
        </div>
      </div>

      {error && (
        <p className="text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl mb-4 text-center text-sm">
          Error: {error.message}
        </p>
      )}

      <AnimatePresence>
        {filteredMenu.map((category) => {
          return (
            <motion.div
              id={category.sT_PCategory_Id}
              key={category.sT_PCategory_Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              {/* --- Category Divider --- */}
              <div className="flex items-center justify-center mb-4 py-2 transition-all">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-[1px] w-full bg-text-heavy" />
                  <div className="border border-stone-200 px-4 py-1 rounded-full bg-white shadow-sm whitespace-nowrap">
                    <h2 className="text-lg font-bold text-main">{category.pCate_Name}</h2>
                  </div>
                  <div className="h-[1px] w-full bg-text-heavy" />
                </div>
              </div>

              {/* --- Product Grid (COL-1 LIST VIEW) --- */}
              <motion.div
                className="grid grid-cols-2 gap-4"
              >
                {category.products.map((product) => {
                  const qty = getQtyInOrder(product.m_Product_Id);
                  const isAdded = qty > 0;
                  // --- Use new Mock Source ---
                  // const mockSrc = getMockSrc(productIndex++);

                  return (
                    <motion.div
                      key={product.m_Product_Id}
                      className={`relative bg-white rounded-2xl shadow-sm cursor-pointer overflow-hidden transition-all duration-300 group flex flex-col items-center
    ${isAdded ? "ring-2 ring-offset-1 ring-main" : "hover:shadow-md border border-stone-100"}`
                      }
                      onClick={() => handleProductClick(product)}
                    >
                      {/* Image: Fixed Size & Rounded */}
                      <figure className="relative shrink-0 w-full h-36">
                        <img
                          // --- NEW SRC: Use Mock Source ---
                          // src={mockSrc}
                          // --- OLD SRC (COMMENTED OUT) ---
                          src={getSrc(product)}
                          alt={product.product_Name}
                          className="h-full w-full object-cover bg-stone-100"
                          // --- OLD ERROR HANDLER (COMMENTED OUT) ---

                          onError={() => {
                            setImgStages((prev) => ({
                              ...prev,
                              [product.m_Product_Id]: (prev[product.m_Product_Id] || 0) + 1,
                            }));
                          }}

                        />
                      </figure>

                      {/* Content: Left Aligned */}
                      <div className="flex-1 flex flex-col justify-between h-24 px-4 py-2">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-bold text-stone-800 leading-tight line-clamp-2 pr-6">
                            {product.product_Name}
                          </h3>
                          {/* Badge Count (Position Absolute Top Right of Card) */}
                          {isAdded && (
                            <div
                              className="absolute top-2 right-2 text-center bg-main min-w-[24px] h-[24px] text-white text-xs font-bold p-1 rounded-full shadow-sm"
                            >
                              {qty}
                            </div>
                          )}
                        </div>

                        {/* Description (Optional Placeholder) */}
                        {/* <p className="text-xs text-stone-400 line-clamp-1">Authentic Japanese Flavor</p> */}

                        <div className="mt-auto flex justify-between items-end">
                          <p className="text-lg font-bold text-main">
                            {product.bProduct_PriceNet} ฿
                          </p>

                          {/* Add Button Mockup (Visual only) */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isAdded ? 'bg-stone-100 text-text-heavy' : 'bg-stone-50 text-stone-400 group-hover:bg-red-50 group-hover:text-red-600'}`}>
                            <ShoppingCart size={14} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};