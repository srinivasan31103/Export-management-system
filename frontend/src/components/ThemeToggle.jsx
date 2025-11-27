import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/useStore';

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useThemeStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDarkMode}
      className="relative inline-flex items-center justify-center w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label="Toggle dark mode"
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-1.5"
        initial={false}
      >
        <Sun className="h-4 w-4 text-yellow-500" />
        <Moon className="h-4 w-4 text-blue-400" />
      </motion.div>

      <motion.div
        className="absolute left-1 w-6 h-6 bg-white dark:bg-gray-900 rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: darkMode ? 22 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {darkMode ? (
          <Moon className="h-3.5 w-3.5 text-blue-400" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
