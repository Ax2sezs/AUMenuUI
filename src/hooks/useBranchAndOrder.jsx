import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFetchData } from "./useFetchData";

export function useBranchAndOrder() {
  const location = useLocation();
  const { fetchCurrentOrder, fetchHistory } = useFetchData();

  const [branchCode, setBranchCode] = useState(() => localStorage.getItem("branchCode") || "");
  const [tableNo, setTableNo] = useState(() => localStorage.getItem("tableNo") || "");
  const [customerCount, setCustomerCount] = useState(() => localStorage.getItem("customerCount") || "");
  const [currentOrder, setCurrentOrder] = useState(() => {
    const table = localStorage.getItem("tableNo");
    return table ? { ord_CustTable: table } : null;
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);

  // อ่าน branch / table / pax จาก query param
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

    if (location.pathname !== "/landing" && (code || table || pax)) {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  // โหลด currentOrder เมื่อ token มีค่า
  useEffect(() => {
    if (!token) return;

    const loadOrder = async () => {
      try {
        const data = await fetchCurrentOrder(token);
        // อัปเดตเฉพาะถ้า order เปลี่ยนจริง
        if (JSON.stringify(data) !== JSON.stringify(currentOrder)) {
          setCurrentOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch current order:", err);
      }
    };

    loadOrder();
  }, [token]); // currentOrder ไม่ต้องใส่ใน dep เพื่อป้องกัน loop


  useEffect(() => {
    if (!token) return;

    const loadHistory = async () => {
      try {
        const data = await fetchHistory(token);
        if (data) setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [token]);

  const handleOrderCreated = (order) => {
    sessionStorage.removeItem("finishedOrderId");
    if (order?.branchCode) {
      localStorage.setItem("branchCode", order.branchCode);
      setBranchCode(order.branchCode);
    }
    if (order?.token) {
      sessionStorage.setItem("token", order.token);
      setToken(order.token); // อัปเดต state token
    }
    setCurrentOrder(order);
  };

  return {
    branchCode,
    tableNo,
    customerCount,
    currentOrder,
    setCurrentOrder,
    handleOrderCreated,
    loading,
    history,
    setHistory,
    token,
    setToken,
  };
}
