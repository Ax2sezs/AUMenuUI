import React, { useState, useEffect, useMemo } from "react";
import { ShoppingCart, X, Plus, Minus, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export const ProductModal = ({ product, isOpen, onClose, addons = [], onAdd, initialLoad, removeAddonFromCart }) => {
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [expandedCate, setExpandedCate] = useState(null);
    const [productQty, setProductQty] = useState(1);
    const [isAddonOpen, setIsAddonOpen] = useState(false);

    const totalPrice = useMemo(() => {
        if (!product) return 0;
        const addonsPrice = selectedAddons.reduce(
            (sum, a) =>
                sum + (Number(a.addon.bProduct_PriceNet ?? a.addon.ord_PriceNet ?? 0) * Number(a.qty)),
            0
        );
        const productPrice = Number(product.bProduct_PriceNet ?? product.ord_PriceNet ?? 0);
        return productPrice * productQty + addonsPrice;
    }, [product, productQty, selectedAddons]);

    // ตอน preload ใน ProductModal
    useEffect(() => {
        if (isOpen && initialLoad?.length) {
            const preload = initialLoad.map(a => ({
                addon: {
                    ...a.addon,
                    m_Product_Id: a.addon.optionItem_Id ?? a.addon.m_Product_Id
                },
                qty: a.qty ?? a.ord_Qty ?? 1
            }));
            setSelectedAddons(preload);
        }
    }, [isOpen, initialLoad]);
console.log("Selected : ",selectedAddons)
    // Reset state เมื่อปิด modal
    useEffect(() => {
        if (!isOpen) {
            setSelectedAddons([]);
            setExpandedCate(null);
            setProductQty(1);
            setIsAddonOpen(false);
        }
    }, [isOpen]);

    if (!product) return null;

    const toggleAddon = (addon) => {
        const found = selectedAddons.find(a => a.addon.m_Product_Id === addon.m_Product_Id);
        if (found) {
            // ใช้ s_Ord_Add_Id จาก state selectedAddons
            if (removeAddonFromCart && found.addon.s_Ord_Add_Id) {
                removeAddonFromCart(found.addon.s_Ord_Add_Id);
            }
            setSelectedAddons(prev =>
                prev.filter(a => a.addon.m_Product_Id !== addon.m_Product_Id)
            );
        } else {
            setSelectedAddons(prev => [...prev, { addon, qty: 1 }]);
        }
    };



    const updateAddonQty = (addon, delta) => {
        setSelectedAddons((prev) =>
            prev.map((a) =>
                a.addon.m_Product_Id === addon.m_Product_Id
                    ? { ...a, qty: Math.max(1, a.qty + delta) }
                    : a
            )
        );
    };

    const handleAdd = () => {
        onAdd(product, productQty, selectedAddons);
        const shortName =
            product.product_Name.length > 25
                ? product.product_Name.slice(0, 22) + "..."
                : product.product_Name;
        toast.success(`${shortName} Added`, { duration: 2000 });
        onClose();
    };

    const countSelectedInCate = (cate) =>
        cate.products.filter((p) =>
            selectedAddons.some((a) => a.addon.m_Product_Id === p.m_Product_Id)
        ).length;

    console.log("ProductModal initialLoad:", initialLoad);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-90 p-2 flex items-center min-h-screen justify-center bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-5 relative"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>

                        {/* Product Image */}
                        <div className="flex justify-center mb-4">
                            <img
                                src={`https://posau.mmm2007.net/Images/Products/${product.product_Image}`}
                                alt={product.product_Name}
                                className="h-48 w-48 object-cover rounded-lg"
                            />
                        </div>

                        {/* Product Name */}
                        <h3 className="text-2xl font-bold text-center mb-4">{product.product_Name}</h3>

                        {/* Quantity */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <button
                                onClick={() => setProductQty((q) => Math.max(1, q - 1))}
                                className="btn h-8 w-8 p-2 bg-main border-hidden rounded-full"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="text-lg font-semibold">{productQty}</span>
                            <button
                                onClick={() => setProductQty((q) => q + 1)}
                                className="btn h-8 w-8 p-2 bg-main border-hidden rounded-full"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Add-ons */}
                        {addons.length > 0 && (
                            <div className="mb-4">
                                <button
                                    onClick={() => setIsAddonOpen(!isAddonOpen)}
                                    className={`w-full px-4 py-2 font-semibold rounded-lg mb-2 flex justify-between items-center
                  ${isAddonOpen ? "bg-main text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                                >
                                    <span>Add-ons ({selectedAddons.length} selected)</span>
                                    <span>{isAddonOpen ? "−" : "+"}</span>
                                </button>

                                <AnimatePresence>
                                    {isAddonOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-2 mt-2"
                                        >
                                            {addons.map((cate) => {
                                                const isExpanded = expandedCate === cate.sT_PCategory_Id;
                                                const selectedCount = countSelectedInCate(cate);

                                                return (
                                                    <div key={cate.sT_PCategory_Id} className="border rounded-xl overflow-hidden">
                                                        <button
                                                            onClick={() =>
                                                                setExpandedCate(isExpanded ? null : cate.sT_PCategory_Id)
                                                            }
                                                            className={`w-full px-3 py-2 font-semibold flex justify-between items-center
                              ${isExpanded ? "bg-main text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                                                        >
                                                            <span>
                                                                {cate.pCate_Name}
                                                                {selectedCount > 0 && (
                                                                    <span className="ml-2 text-sm opacity-80">
                                                                        ({selectedCount} selected)
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span>{isExpanded ? "−" : "+"}</span>
                                                        </button>

                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="px-3 py-2 bg-gray-50 max-h-60 overflow-y-auto space-y-1"
                                                            >
                                                                {cate.products.map((addon) => {
                                                                    const found = selectedAddons.find(a => a.addon.m_Product_Id === addon.m_Product_Id);
                                                                    const price = Number(addon.bProduct_PriceNet ?? addon.ord_PriceNet ?? 0);

                                                                    return (
                                                                        <div key={addon.m_Product_Id} className="flex items-center justify-between text-gray-700">
                                                                            <label className="flex items-center gap-2 flex-1">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={!!found}
                                                                                    onChange={() => toggleAddon(addon)}
                                                                                    className="checkbox checkbox-sm checkbox-neutral"
                                                                                />
                                                                                <span className="text-sm truncate">{addon.product_Name}</span>
                                                                            </label>

                                                                            <div className="flex items-center gap-2">
                                                                                {found && (
                                                                                    <>
                                                                                        <span className="text-sm text-gray-500">+{(price * found.qty).toFixed(2)} ฿</span>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <button onClick={() => updateAddonQty(addon, -1)} className="btn btn-xs bg-main border-hidden">
                                                                                                <Minus size={12} />
                                                                                            </button>
                                                                                            <span className="w-5 text-center text-sm">{found.qty}</span>
                                                                                            <button onClick={() => updateAddonQty(addon, 1)} className="btn btn-xs bg-main border-hidden">
                                                                                                <Plus size={12} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}

                                                            </motion.div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="border-t border-dashed pt-3 mt-3 space-y-2">
                            <p className="font-semibold mb-1">สรุปรายการ:</p>
                            <div
                                className={`bg-gray-50 rounded-lg p-2 text-sm text-gray-700 border border-gray-100 ${selectedAddons.length > 0 ? "max-h-40 overflow-y-auto" : ""
                                    }`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="truncate">
                                        {product.product_Name} x{productQty}
                                    </span>
                                    <span className="font-medium">
                                        {(Number(product.bProduct_PriceNet ?? product.ord_PriceNet ?? 0) * productQty).toFixed(2)} ฿
                                    </span>
                                </div>
                                {selectedAddons.map((a, idx) => {
                                    const price = Number(a.addon.bProduct_PriceNet ?? a.addon.ord_PriceNet ?? 0);
                                    return (
                                        <div key={idx} className="flex justify-between pl-3 text-gray-600">
                                            <span className="truncate">
                                                + {a.addon.product_Name} x{a.qty}
                                            </span>
                                            <span className="text-gray-500">+{(price * a.qty).toFixed(2)} ฿</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between items-center border-t border-dashed pt-3 mt-2">
                                <span className="font-semibold text-lg">Total:</span>
                                <span className="text-text-heavy font-bold text-xl">{totalPrice.toFixed(2)} ฿</span>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={onClose} className="btn bg-bg border-hidden text-main btn-sm">
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                className="btn bg-main text-white border-hidden btn-sm flex items-center gap-2"
                            >
                                {initialLoad.length > 0 ? <span className="flex gap-2"><Save size={18} />Update</span> : <span className="flex gap-2"><ShoppingCart size={18} /> Add to Cart</span>}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
