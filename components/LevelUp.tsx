"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type LevelUpProps = {
  show: boolean;
  onClose: () => void;
  level?: number;
  children?: React.ReactNode;
};

export default function LevelUp({ show, onClose, level, children }: LevelUpProps) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-hidden="true"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Level up"
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center"
            initial={{ scale: 0.9, rotate: -2, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()} // no cerrar al click interno
          >
            {children ?? (
              <>
                <h2 className="text-2xl font-bold mb-1">¡Subiste de nivel!</h2>
                {typeof level === "number" && (
                  <p className="text-lg opacity-80">Nivel {level}</p>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="mt-5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
