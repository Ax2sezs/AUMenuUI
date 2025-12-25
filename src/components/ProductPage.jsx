// src/pages/ProductPage.jsx (Redesigned)
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Save, Plus, Minus, ChevronLeft, Loader2, ShoppingBag, Handbag } from "lucide-react";
import toast from "react-hot-toast";
import { useMenuData } from "../context/MenuDataContext";
import { motion, AnimatePresence } from "framer-motion";
import { i } from "framer-motion/client";

export const ProductPage = ({ currentOrder, setCurrentOrder }) => {
    const { productId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const {
        menu,
        addons,
        updateCart,
        fetchAddons,
        addonsLoading,
        fetchCurrentOrder,
        addProductToCart,
        addAddonToProduct,
        orderLoading,
    } = useMenuData();

    const [product, setProduct] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [productQty, setProductQty] = useState(
        location.state?.productObj?.productQty ?? 1
    );
    const [comment, setComment] = useState("")
    const [isTakeHome, setIsTakeHome] = useState(false);
    const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
    const [expandedCate, setExpandedCate] = useState(null);
    const [imgStages, setImgStages] = useState({});
    const [pageLoading, setPageLoading] = useState(true);

    const getAddonId = (addon) =>
        addon.optionItem_Id ?? addon.m_Product_Id ?? addon.bProduct_Id ?? addon.item_Code ?? addon.productId ?? null;

    const { addonMode = false, orderDetailId = null, existingAddons = [] } =
        location.state || {};

    const getSrc = (product) => {
        const stage = imgStages[product.m_Product_Id] ?? 0;
        const filename =
            product.product_Image?.replace(".png", ".jpg") ?? "default.jpg";
        switch (stage) {
            case 0:
                return `/img/${filename}`;
            case 1:
                return `https://posau.mmm2007.net/Images/Products/${product.product_Image}`;
            default:
                return "/default.png";
        }
    };

    // Load product
    useEffect(() => {
        if (!menu || !productId) return;
        setPageLoading(true);
        const findProduct = menu
            .flatMap((c) => c.products)
            .find((p) => p.m_Product_Id === productId);
        setProduct(findProduct);
        setIsTakeHome(location.state?.productObj?.isTakeHome ?? findProduct?.isTakeHome ?? false);
        setComment(location.state?.productObj?.comment ?? findProduct?.ord_Comment ?? "");
        setProductQty(location.state?.productObj?.productQty ?? 1);
        setPageLoading(false);
    }, [productId, menu]);

    // Load addons
    useEffect(() => {
        const loadAddons = async () => {
            if (!productId) return;
            setPageLoading(true);
            await fetchAddons(productId);
            if (addonMode && existingAddons.length > 0) {
                setSelectedAddons(
                    existingAddons.map((a) => ({
                        addon: a.addon ?? a,
                        qty: a.qty ?? a.ord_Qty ?? 1,
                    }))
                );
            }
            setPageLoading(false);
        };
        loadAddons();
    }, [productId]);

    const totalPrice = useMemo(() => {
        if (!product) return 0;
        const addonsPrice = selectedAddons.reduce((sum, a) => {
            const price = Number(a.addon.ord_PriceNet ?? a.addon.bProduct_PriceNet ?? a.addon.priceNet ?? 0);
            return sum + price * a.qty;
        }, 0);
        const productPrice = Number(product.bProduct_PriceNet ?? product.ord_PriceNet ?? product.priceNet ?? 0);
        return productPrice * productQty + addonsPrice;
    }, [product, productQty, selectedAddons]);


    const toggleAddon = (addon) => {
        const id = getAddonId(addon);
        setSelectedAddons(prev => {
            const found = prev.find(a => getAddonId(a.addon) === id);
            return found
                ? prev.filter(a => getAddonId(a.addon) !== id)
                : [...prev, { addon, qty: 1 }];
        });
    };

    const handleQtyChange = (addon, delta) => {
        const id = getAddonId(addon);
        setSelectedAddons(prev =>
            prev.map(a =>
                getAddonId(a.addon) === id
                    ? { ...a, qty: Math.max(1, a.qty + delta) }
                    : a
            )
        );
    };

    const handleAdd = async () => {
        if (!currentOrder) return alert("กรุณาสร้าง Order ก่อน");

        try {
            // --- กรณีแก้ไขสินค้าใน cart ---
            if (addonMode && orderDetailId) {
                const payload = {
                    productId: product.m_Product_Id,
                    quantity: productQty,
                    comment: comment,
                    isTakehome: isTakeHome,
                    addons: selectedAddons.map(a => ({
                        addonId: a.addon.s_Ord_Add_Id ?? null,
                        productId: a.addon.optionItem_Id,
                        quantity: a.qty,
                    })),
                };

                await updateCart(orderDetailId, payload);

                const updated = await fetchCurrentOrder();
                setCurrentOrder(updated);

                toast.success("Cart updated");
                navigate(-1);
                return;
            }

            // --- กรณีเพิ่มสินค้าใหม่ ---
            const added = await addProductToCart([
                {
                    productId: product.m_Product_Id,
                    quantity: productQty,
                    comment: comment,
                    isTakehome: isTakeHome,
                    addons: selectedAddons.map(a => ({
                        productId: a.addon.optionItem_Id,
                        quantity: a.qty
                    }))
                }
            ]);

            if (!added) return toast.error("เพิ่มสินค้าไม่สำเร็จ");

            const updatedOrder = await fetchCurrentOrder();
            setCurrentOrder(updatedOrder);

            toast.success(`${product.product_Name} added`);
            navigate(-1);

        } catch (err) {
            console.error(err);
            toast.error("Update cart failed");
        }
    };
    useEffect(() => {
        // ล็อก scroll ของหน้าหลัก
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        return () => {
            // คืนค่าเดิมตอนปิด history
            document.body.style.overflow = originalStyle;
        };
    }, []);

    if (!product) {
        // ... (Loading state remains the same) ...
        return (
            <motion.div
                // initial={{ y: "100%" }}
                // animate={{ y: 0 }}
                // exit={{ y: "100%" }}
                // transition={{ type: "spring", damping: 22 }}
                className="fixed inset-0 z-[100] bg-bg bg-grid-pattern overflow-y-auto flex justify-center items-center"
            >
                <div className="flex flex-col justify-center items-center  gap-2">
                    <div className="w-12 h-12 border-[1px] border-t-[#2C2C2C] border-r-[#2C2C2C] border-b-transparent border-l-transparent rounded-full animate-spin mb-6" />
                    <p className="text-[10px] tracking-[0.3em] text-[#8C8C8C] uppercase animate-pulse">
                        Loading . . .
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-bg bg-grid-pattern pointer-events-auto text-stone-800">
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{
                    duration: 0.25,
                    ease: "easeOut",
                }}
                className="h-full w-full overflow-y-auto"
            >


                <div className="relative pb-20"> {/* pb-28 เพื่อให้มีพื้นที่สำหรับ Sticky Footer */}

                    {/* Fixed Header (Back and Save) */}
                    <div className="flex justify-between p-4 absolute top-0 left-0 w-full z-20">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-white bg-main p-2 rounded-full shadow-lg transition hover:scale-105"                    >
                            <ChevronLeft />
                        </button>
                        {/* Save Button (Used Heart/Save concept from sample) */}
                        {/* <button className="text-stone-600 p-2 rounded-full shadow-md bg-white transition hover:scale-105">
                        <Save size={24} /> 
                    </button> */}
                    </div>

                    {/* Hero Image Container (Floating Animation) */}
                    <div className="flex justify-center pt-24 pb-16">
                        <div
                            className="w-56 h-56 rounded-full overflow-hidden border-4 border-main shadow-2xl animate-float-slow transition-all duration-500"
                        >
                            <img
                                src={getSrc(product)}
                                alt={product.product_Name}
                                className="w-full h-full object-cover"
                                onError={() =>
                                    setImgStages((prev) => ({
                                        ...prev,
                                        [product.m_Product_Id]:
                                            (prev[product.m_Product_Id] ?? 0) + 1,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    {/* Detail Card (The main content area, rounded on top) */}
                    <div className="bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)] p-6 -mt-10 relative z-10">

                        {/* Title Section */}
                        <div className="border-b border-dashed border-stone-200 pb-4 mb-4">
                            <h1 className="text-3xl font-bold text-stone-800 mb-1 leading-tight">
                                {product.product_Name}
                            </h1>
                            <p className="text-sm text-stone-500 mt-1">
                                {product.product_Desc || "Authentic Japanese flavor and texture."}
                            </p>
                        </div>

                        {/* Quantity Selector Section (Replaces Volume Pack) */}
                        <div className="flex justify-between mb-6 border-b border-dashed border-stone-200 pb-4">
                            <div className="">
                                <h3 className="text-lg font-semibold text-stone-700 mb-3">Quantity</h3>
                                <div className="flex justify-start items-center gap-4">
                                    <button
                                        onClick={() => setProductQty((q) => Math.max(1, q - 1))}
                                        disabled={productQty <= 1}
                                        className="w-8 h-8 flex items-center justify-center bg-main text-white rounded-full disabled:opacity-50 transition"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="text-xl font-bold text-main">
                                        {productQty}
                                    </span>
                                    <button
                                        onClick={() => setProductQty((q) => q + 1)}
                                        disabled={productQty >= 10}
                                        className="w-8 h-8 flex items-center bg-main justify-center text-white rounded-full transition disabled:opacity-50"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Addon Buttons */}
                            <div className="w-full flex flex-col items-end justify-end">
                                <h3 className="text-lg font-semibold text-stone-700 mb-3">Add-ons</h3>
                                {addonsLoading ? (
                                    <div className="flex justify-end items-end gap-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="w-20 h-8 bg-stone-200 animate-pulse rounded-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {/* ถ้ามีกลุ่ม addon */}
                                        {addons?.some((group) => (group.addon ?? []).length > 0) ? (
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {addons
                                                    ?.filter((group) => (group.addon ?? []).length > 0)
                                                    .map((group) => {
                                                        const groupName = group?.pCate_Name ?? "Unnamed";
                                                        const groupId = group?.sT_PCategory_Id ?? "";
                                                        const optionItems = group.addon || [];
                                                        const selectedCount = selectedAddons.filter((a) =>
                                                            optionItems.some((item) => getAddonId(item) === getAddonId(a.addon))
                                                        ).length;

                                                        return (
                                                            <button
                                                                key={groupId}
                                                                onClick={() => {
                                                                    setExpandedCate(groupId);
                                                                    setIsAddonModalOpen(true);
                                                                }}
                                                                className="relative px-3 py-1.5 rounded-full bg-main text-white text-sm font-medium hover:scale-[1.02] transition shadow-md"
                                                            >
                                                                + {groupName}
                                                                {selectedCount > 0 && (
                                                                    <span className="absolute -top-1 -right-2 border-2 bg-main border-white text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                                        {selectedCount}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        ) : (
                                            /* ไม่มี addon */
                                            <p className="text-sm text-stone-500 italic text-right">
                                                No add-ons available
                                            </p>
                                        )}
                                    </>
                                )}

                            </div>
                        </div>
                        {/* Comment Input */}
                        <div className="flex flex-col gap-1 mb-8">
                            <label htmlFor="comment" className="text-sm font-medium text-stone-600">
                                Note (Optional)
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add note..."
                                rows={2}
                                className="w-full border border-stone-300 rounded-xl p-2 text-sm resize-none 
               focus:outline-none focus:ring-2 focus:ring-main"
                            />
                        </div>

                        <div className="flex items-center justify-between border-b pb-3">
                            <span className="text-sm text-stone-700 font-medium">
                                <Handbag size={16} className="inline-block mr-2 text-main" />
                                Takeaway</span>
                            <input
                                type="checkbox"
                                className="checkbox checkbox-md checkbox-neutral"
                                checked={isTakeHome}
                                onChange={() => setIsTakeHome(!isTakeHome)}
                            />
                        </div>
                        {/* Price Details Summary (Inside the card) */}
                        <div className="border-t border-dashed border-stone-300 pt-3 text-sm">
                            <div className="flex justify-between mb-1">
                                <span>
                                    Base Price ({product.product_Name} × {productQty})
                                </span>
                                <span className="text-main">
                                    {(Number(product.bProduct_PriceNet ?? 0) * productQty).toFixed(2)}{" "}฿
                                </span>
                            </div>
                            {selectedAddons.map((a, idx) => {
                                const price = Number(a.addon.ord_PriceNet ?? a.addon.bProduct_PriceNet ?? a.addon.priceNet ?? 0);
                                return (
                                    <div
                                        key={idx}
                                        className="flex justify-between pl-3 text-stone-600"
                                    >
                                        <span>
                                            + {a.addon.item_Name || a.addon.product_Name} × {a.qty}
                                        </span>
                                        <span className="text-main">
                                            +{(price * a.qty).toFixed(2)} ฿
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sticky Footer (Action Bar) */}
                    <div
                        className="fixed bottom-0 left-0 w-full z-50 bg-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] flex justify-between items-center px-6 py-4"
                    >
                        <div className="price-display">
                            <span className="currency text-stone-600 text-lg">Total: </span>
                            <span className="amount text-xl font-bold text-main">
                                {totalPrice.toFixed(2)}
                            </span>
                            <span className="currency text-lg text-main"> ฿</span>
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={orderLoading || pageLoading}
                            className="text-white bg-main font-semibold rounded-full px-6 py-3 flex items-center gap-2 transition hover:scale-[1.02] disabled:opacity-50 shadow-lg"
                        >
                            {orderLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : addonMode ? (
                                <>
                                    <Save size={20} /> Save Changes
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={20} /> Add
                                </>
                            )}
                        </button>
                    </div>

                    {/* Add-on Modal (Modal remains the same structure/theme as previous iteration) */}
                    <AnimatePresence>
                        {isAddonModalOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, pointerEvents: "none" }}
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
                            >
                                <motion.div
                                    initial={{ y: 60, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ opacity: 0, y: 60, pointerEvents: "none" }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 120,
                                        damping: 15,
                                    }}
                                    className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md max-h-[85vh] overflow-hidden flex flex-col"
                                >
                                    {/* Modal Header */}
                                    <div
                                        className="flex justify-between bg-main items-center px-5 py-4 text-white rounded-t-2xl"
                                    >
                                        <h3 className="font-semibold text-lg">
                                            {addons.find((c) => c.sT_PCategory_Id === expandedCate)?.pCate_Name || "Select Add-on"}
                                        </h3>
                                        <button
                                            onClick={() => setIsAddonModalOpen(false)}
                                            className="p-1 rounded-full opacity-80 hover:opacity-100"
                                        >
                                            X
                                        </button>
                                    </div>

                                    {/* Addon List */}
                                    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                                        {addonsLoading ? (
                                            Array(4).fill(0).map((_, idx) => (
                                                <div key={idx} className="h-12 bg-gray-200 animate-pulse rounded-xl" />
                                            ))
                                        ) : (
                                            (addons.find(c => c.sT_PCategory_Id === expandedCate)?.addon ?? []).flat().map((addon) => {
                                                const found = selectedAddons.find((a) => getAddonId(a.addon) === getAddonId(addon));
                                                const price = Number(addon.priceNet ?? 0);
                                                return (
                                                    <div
                                                        key={addon.optionItem_Id}
                                                        className={`flex justify-between items-center rounded-xl p-3 transition ${found
                                                            ? "border-main bg-main/10"
                                                            : "border-stone-200 bg-white"
                                                            }`}
                                                    >

                                                        <label className="flex items-start gap-3 flex-1 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!found}
                                                                onChange={() => toggleAddon(addon)}
                                                                className="mt-1 checkbox checkbox-sm checkbox-neutral"
                                                            />

                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-stone-800 break-words leading-snug">
                                                                    {addon.item_Name}
                                                                </span>
                                                                <span className="text-xs text-stone-500">
                                                                    {price.toFixed(2)} ฿
                                                                </span>
                                                            </div>
                                                        </label>
                                                        {found && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleQtyChange(addon, -1)}
                                                                    disabled={found.qty <= 1}
                                                                    className="w-6 h-6 flex items-center justify-center bg-main text-white rounded-full disabled:opacity-50"
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="w-6 text-center font-semibold text-stone-700">
                                                                    {found.qty}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleQtyChange(addon, 1)}
                                                                    disabled={found.qty >= 10}
                                                                    className="w-6 h-6 flex items-center bg-main justify-center text-white rounded-full disabled:opacity-50"
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="border-t border-stone-200 px-5 py-4 bg-white flex justify-end">
                                        <button
                                            onClick={() => setIsAddonModalOpen(false)}
                                            className="px-4 py-2 text-white bg-main rounded-xl font-semibold transition hover:opacity-90"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Custom CSS for Floating Animation */}
                <style>
                    {`
                @keyframes float-slow {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float-slow {
                    animation: float-slow 6s ease-in-out infinite;
                }
                `}
                </style>
            </motion.div>
        </div>
    );
};