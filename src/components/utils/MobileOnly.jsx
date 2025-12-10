// src/components/MobileOnly.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export const MobileOnly = ({ children }) => {
    const ua = navigator.userAgent || navigator.vendor || "";
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    console.log(navigator.userAgent);

    if (!isMobile) {
        return <Navigate to="/alert" replace />;
    }

    return children;
};
