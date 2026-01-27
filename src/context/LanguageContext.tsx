
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language } from '../lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['en'], params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('es'); // Default to Spanish as per user preference likely

    const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>) => {
        let text = translations[language][key] || translations['en'][key] || key;

        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                text = text.replace(`{${paramKey}}`, String(paramValue));
            });
        }

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
