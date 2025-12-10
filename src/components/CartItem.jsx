export const CartItem = ({ item, handleQtyChange, handleRemove, handleOpenAddonPage, getSrc, imgStages, setImgStages }) => {
    const x = useMotionValue(0);
    const deleteButtonOpacity = useTransform(x, [-150, -80, 0], [1, 0.8, 0]);
    const deleteButtonScale = useTransform(x, [-150, -80, 0], [1, 0.9, 0.8]);

    const addonTotal = (item.orderAdds || []).reduce(
        (sum, a) => sum + (Number(a.ord_Qty || 0) * Number(a.ord_PriceNet || 0)),
        0
    );

    return (
        <div className="relative overflow-hidden">
            {/* Delete Button Background */}
            <motion.div 
                className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end px-6"
                style={{ opacity: deleteButtonOpacity }}
            >
                <motion.div style={{ scale: deleteButtonScale }}>
                    <Trash2 size={28} className="text-white" />
                </motion.div>
            </motion.div>

            {/* Swipeable Card */}
            <motion.div
                className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ x }}
                drag="x"
                dragConstraints={{ left: -150, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                    if (info.offset.x < -150) handleRemove(item.s_Ord_D_Id);
                    else if (info.offset.x < -80) x.set(-100);
                    else x.set(0);
                }}
            >
                {/* ...เนื้อหา item และ addon เหมือนเดิม... */}
            </motion.div>

            {/* Click to Delete Button */}
            <motion.button
                onClick={() => {
                    x.set(0);
                    handleRemove(item.s_Ord_D_Id);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
                style={{ 
                    opacity: deleteButtonOpacity,
                    scale: deleteButtonScale,
                    pointerEvents: x.get() < -50 ? 'auto' : 'none'
                }}
            >
                <Trash2 size={20} className="text-red-500" />
            </motion.button>
        </div>
    );
};
