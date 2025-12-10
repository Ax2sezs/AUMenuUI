import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom"; // เพิ่ม import
import { apiClient } from "../api";

export const useFetchData = () => {
    // --- 1. Router & Initialization (จาก useBranchAndOrder) ---
    const location = useLocation();

    // State สำหรับ Context (Branch/Table/Token)
    const [branchCode, setBranchCode] = useState(() => localStorage.getItem("branchCode") || "");
    const [tableNo, setTableNo] = useState(() => localStorage.getItem("tableNo") || "");
    const [customerCount, setCustomerCount] = useState(() => localStorage.getItem("customerCount") || "");
    const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);

    // --- 2. Loading & UI States (จาก useFetchData เดิม) ---
    const [menuLoading, setMenuLoading] = useState(false);
    const [addonsLoading, setAddonsLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [currentOrderLoading, setCurrentOrderLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [qtyLoading, setQtyLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);

    // Data States
    const [error, setError] = useState(null);
    const [menu, setMenu] = useState([]);
    const [addons, setAddons] = useState([]);
    const [history, setHistory] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null); // ใช้ตัวนี้เป็นหลักแทน currentTable

    // Payment States
    const [paymentQr, setPaymentQr] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);

    // Pagination / Menu Refs
    const [hasMore, setHasMore] = useState(true);
    const currentDeptRef = useRef("ALL");
    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);
    const currentDeptIndexRef = useRef(0);
    const deptList = ["ALL", "BV", "DE", "KG", "TO", "BF", "TG"];

    // --- 3. Logic: URL Params Management (ทำงานเมื่อโหลดหน้าเว็บ) ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("branch");
        const table = params.get("table");
        const pax = params.get("pax");

        if (code) {
            localStorage.setItem("branchCode", code);
            setBranchCode(code);
        }
        if (table) {
            localStorage.setItem("tableNo", table);
            setTableNo(table);
        }
        if (pax) {
            localStorage.setItem("customerCount", pax);
            setCustomerCount(pax);
        }

        // Clean URL params after keeping them in localStorage
        if (location.pathname !== "/home" && (code || table || pax)) {
            window.history.replaceState({}, "", location.pathname);
        }
    }, [location]);

    const handle401 = (err) => {
        if (err.response?.status === 401) {
            console.error("401 Unauthorized received. Clearing token.");
            sessionStorage.removeItem("token");
            setToken(null); // This will stop useEffects that depend on 'token'
            return true;
        }
        return false;
    }
    // --- 4. Logic: Fetch Menu & Addons ---
    // Inside useFetchData.jsx

    const fetchMenu = useCallback(async (pDeptCode, search = "") => {
        setMenuLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ pDeptCode, search });
            const res = await apiClient.get(`/menu/by-dept?${params.toString()}`);
            setMenu(res.data);
            setMenuLoading(false);
            return res.data;
        } catch (err) {
            setMenuLoading(false);
            if (handle401(err)) {
                // Re-throw the error so AppContent can catch it and navigate to /home
                throw err;
            }
            setError(err);
            setMenu([]);
            return [];
        }
    }, [setToken]);

    const fetchAddons = useCallback(async (productId) => {
        setAddonsLoading(true);
        setError(null);
        try {
            const res = await apiClient.get(`/menu/product-detail/${productId}`);
            const data = res.data;
            const groupedAddons = data?.productOptionGroups?.map((group) => ({
                sT_PCategory_Id: group.optionGroup.optionGroup_Id,
                pCate_Name: group.optionGroup.group_Name,
                addon: group.optionGroup.optionItems || [],
            })) || [];

            setAddons(groupedAddons);
            setAddonsLoading(false);
            return groupedAddons;
        } catch (err) {
            console.error("fetchAddons error:", err);
            setError(err);
            setAddons([]);
            setAddonsLoading(false);
            return [];
        }
    }, []);

    // --- 5. Logic: Order Actions ---

    // ฟังก์ชันดึง Order ปัจจุบัน (แยกออกมาเพื่อใช้ซ้ำใน useEffect)
    const _fetchCurrentOrderData = useCallback(async () => {
        setCurrentOrderLoading(true);
        setError(null);
        try {
            const res = await apiClient.get(`/orders/get-current-order`);
            setCurrentOrder(res.data);
            setCurrentOrderLoading(false);
            return res.data;
        } catch (err) {
            setCurrentOrderLoading(false);
            if (handle401(err)) {
                // The token is bad. Prevent navigation loop by returning early.
                return null;
            }
            setError(err);
            return null;
        }
    }, [setToken]); // Add setToken to deps if it's not stable

    const _fetchHistoryData = useCallback(async () => {
        setHistoryLoading(true);
        setError(null);
        try {
            const res = await apiClient.get(`/orders/get-history`);
            setHistory(res.data);
            setHistoryLoading(false);
            return res.data;
        } catch (err) {
            setHistoryLoading(false);
            if (handle401(err)) {
                // The token is bad.
                return null;
            }
            setError(err);
            return null;
        }
    }, [setToken]);

    // **Auto Fetch logic**: เมื่อมี Token ให้โหลด Order และ History อัตโนมัติ
    const didFetchRef = useRef(false);

    useEffect(() => {
        if (token && !didFetchRef.current) {
            didFetchRef.current = true; // fetch แค่ครั้งแรก
            _fetchCurrentOrderData();
            _fetchHistoryData();
        }
    }, [token]);


    const createOrder = async (dto) => {
        setOrderLoading(true);
        setError(null);
        try {
            const res = await apiClient.post("/orders/create", dto);
            setOrderLoading(false);
            const { token } = res.data;
            console.log("createOrder received token:", token);
            // Set Token -> นี้จะ Trigger useEffect ด้านบนให้โหลดข้อมูล
            sessionStorage.setItem("token", token);
            setToken(token);

            return true;
        } catch (err) {
            setError(err);
            setOrderLoading(false);
            return null;
        }
    };

    const checkTable = useCallback(async (tableId) => {
        setCurrentOrderLoading(true);
        setError(null);
        try {
            const res = await apiClient.get(`/orders/check?tableId=${tableId}`);
            const { orderId, token: existingToken, hasExistingOrder,isClosed } = res.data;
            console.log("checkTable result:", res.data);
            if (hasExistingOrder && existingToken && existingToken !== token) {
                sessionStorage.setItem("token", existingToken);
                setToken(existingToken); // trigger fetch แค่ครั้งที่ token เปลี่ยน

            } else {
                // ถ้าไม่มี Order ค้าง ให้เคลียร์ state order ทิ้ง
                setCurrentOrder(null);
            }

            setCurrentOrderLoading(false);
            return { orderId, token: existingToken, hasExistingOrder,isClosed };
        } catch (err) {
            setError(err);
            setCurrentOrderLoading(false);
            return null;
        }
    }, []);

    // --- 6. Logic: Cart & Items ---
    const addProductToCart = async (product) => {
        setOrderLoading(true);
        setError(null);
        try {
            const res = await apiClient.post(`/orders/add-product`, product);
            setOrderLoading(false);
            // Refresh order data
            _fetchCurrentOrderData();
            return res.data;
        } catch (err) {
            setError(err);
            setOrderLoading(false);
            return null;
        }
    };

    const addAddonToProduct = async (orderDetailId, addon) => {
        setOrderLoading(true);
        setError(null);
        try {
            const res = await apiClient.post(`/orders/${orderDetailId}/add-addon`, addon);
            setOrderLoading(false);
            _fetchCurrentOrderData();
            return res.data;
        } catch (err) {
            setError(err);
            setOrderLoading(false);
            return null;
        }
    };

    const updateCart = async (detailId, detailData) => {
        setOrderLoading(true);
        setError(null);
        try {
            const res = await apiClient.put(`/orders/${detailId}`, detailData);
            setOrderLoading(false);
            _fetchCurrentOrderData();
            return res.data;
        } catch (err) {
            console.error("Update cart error:", err);
            setError(err);
            setOrderLoading(false);
            return null;
        }
    };

    const removeProductFromCart = async (orderDetailId) => {
        setOrderLoading(true);
        setError(null);
        try {
            const res = await apiClient.patch(`/orders/${orderDetailId}/remove`);
            setOrderLoading(false);
            if (res.status === 200) _fetchCurrentOrderData();
            return res.status === 200;
        } catch (err) {
            setError(err);
            setOrderLoading(false);
            return false;
        }
    };

    const removeAddonFromCart = async (orderAddId) => {
        setOrderLoading(true);
        setError(null);
        try {
            const res = await apiClient.patch(`/orders/addon/${orderAddId}/remove`);
            setOrderLoading(false);
            if (res.status === 200) _fetchCurrentOrderData();
            return res.status === 200;
        } catch (err) {
            setError(err);
            setOrderLoading(false);
            return false;
        }
    };

    const updateProductQty = async (orderDetailId, newQty) => {
        setQtyLoading(true);
        setError(null);
        try {
            const res = await apiClient.patch("/orders/product/quantity", { id: orderDetailId, newQty });
            setQtyLoading(false);
            if (res.status === 200) _fetchCurrentOrderData();
            return res.status === 200;
        } catch (err) {
            setError(err);
            setQtyLoading(false);
            return false;
        }
    };

    const updateAddonQty = async (orderAddId, newQty) => {
        setQtyLoading(true);
        setError(null);
        try {
            const res = await apiClient.patch("/orders/addon/quantity", { id: orderAddId, newQty });
            setQtyLoading(false);
            if (res.status === 200) _fetchCurrentOrderData();
            return res.status === 200;
        } catch (err) {
            setError(err);
            setQtyLoading(false);
            return false;
        }
    };

    // --- 7. Logic: Checkout & Payment ---
    const checkoutOrder = async (paymentMethod = "Cash", memberNumber = null) => {
        setCheckoutLoading(true);
        setError(null);
        try {
            const res = await apiClient.post(`/pos/checkout`, {
                paymentMethod,
                memberNumber,
            });
            // หากสำเร็จ อาจจะเคลียร์ token หรือ order แล้วแต่ logic หน้างาน
            // sessionStorage.removeItem("token"); 
            // setToken(null);
            return res.status === 200;
        } catch (err) {
            setError(err);
            return false;
        } finally {
            setCheckoutLoading(false);
        }
    };

    const createPayment = useCallback(async () => {
        setPaymentLoading(true);
        setError(null);
        try {
            const res = await apiClient.post(`/payment/create`);
            setPaymentQr(res.data);
            return res.data;
        } catch (err) {
            console.error("createPayment error:", err);
            setError(err);
            return null;
        } finally {
            setPaymentLoading(false);
        }
    }, []);

    const checkPaymentStatus = async () => {
        setPaymentStatusLoading(true);
        setError(null);
        try {
            const res = await apiClient.post(`/payment/check-payment`);
            setPaymentStatus(res.data.status);
            return res.data;
        } catch (err) {
            console.error("checkPaymentStatus error:", err);
            setError(err);
            return null;
        } finally {
            setPaymentStatusLoading(false);
        }
    };

    // Helper สำหรับ Manual Set (ถ้าจำเป็นต้องใช้จากภายนอก)
    const handleOrderCreated = (order) => {
        sessionStorage.removeItem("finishedOrderId");
        if (order?.branchCode) {
            localStorage.setItem("branchCode", order.branchCode);
            setBranchCode(order.branchCode);
        }
        if (order?.token) {
            sessionStorage.setItem("token", order.token);
            setToken(order.token);
        }
        setCurrentOrder(order);
    };

    return {
        // Context State
        branchCode,
        tableNo,
        customerCount,
        token,
        setToken, // Expose เผื่อกรณี logout

        // Data
        menu,
        addons,
        currentOrder, // รวม currentTable เดิมและ currentOrder
        history,

        // Actions
        fetchMenu,
        fetchAddons,
        fetchCurrentOrder: _fetchCurrentOrderData, // Expose function
        fetchHistory: _fetchHistoryData,           // Expose function
        createOrder,
        checkTable,
        addProductToCart,
        addAddonToProduct,
        updateCart,
        removeProductFromCart,
        removeAddonFromCart,
        updateProductQty,
        updateAddonQty,
        checkoutOrder,
        createPayment,
        checkPaymentStatus,
        handleOrderCreated, // เผื่อกรณี manual update

        // Loading States
        menuLoading,
        addonsLoading,
        orderLoading,
        checkoutLoading,
        currentOrderLoading,
        historyLoading,
        qtyLoading,
        paymentLoading,
        paymentStatusLoading,

        // Other States
        error,
        paymentQr,
        setPaymentQr,
        paymentStatus,
        hasMore,
        deptList,
        currentDeptIndexRef,
        currentDeptRef,
        hasMoreRef,
        pageRef,
    };
};