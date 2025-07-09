import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      onClick={toggleDarkMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: isDarkMode ? '#374151' : '#f3f4f6',
        border: '2px solid',
        borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
        borderRadius: '50px',
        width: '48px',
        height: '24px',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        transition: 'all 0.3s ease',
        outline: 'none'
      }}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          boxShadow: isDarkMode 
            ? '0 2px 4px rgba(0,0,0,0.3)' 
            : '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: isDarkMode ? '#fbbf24' : '#f59e0b'
        }}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </motion.div>
    </motion.button>
  );
};

export default DarkModeToggle; 