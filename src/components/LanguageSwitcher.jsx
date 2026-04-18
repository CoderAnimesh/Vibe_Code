import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
      <Globe size={16} color="#94a3b8" />
      <select 
        value={i18n.language.split('-')[0]} 
        onChange={handleLanguageChange}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#e2e8f0',
          fontSize: '0.85rem',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif'
        }}
      >
        <option value="en" style={{ color: '#000' }}>English</option>
        <option value="hi" style={{ color: '#000' }}>हिंदी (Hindi)</option>
      </select>
    </div>
  );
}
