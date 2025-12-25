import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./Header";
import SearchBar from "./SearchBar";

export default function HeaderScrollWrapper({ cartCount, navigate, setIsCartOpen }) {
  const [scrolled, setScrolled] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrolled(window.scrollY > 60); // scroll ลงเกิน 60px ให้หด
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  return (
    <div className="sticky top-0 z-50 bg-bg">
      {/* Header จะ fade out */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Header
              onLogoClick={() => navigate("/menu")}
              onCartClick={() => setIsCartOpen(true)}
              cartCount={cartCount}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SearchBar จะ slide ขึ้นแทน */}
      <motion.div
        initial={{ y: scrolled ? -10 : 0, opacity: scrolled ? 1 : 0 }}
        animate={{ y: scrolled ? 0 : -10, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`${scrolled ? "shadow-md bg-white" : "bg-bg"} transition-all`}
      >
        <SearchBar />
      </motion.div>
    </div>
  );
}
