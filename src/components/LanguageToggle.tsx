
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    const toggle = () => {
        setLanguage(language === 'es' ? 'en' : 'es');
    };

    return (
        <motion.button
            className="language-toggle"
            onClick={toggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 12px',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.875rem'
            }}
        >
            <Globe size={16} />
            <span>{language.toUpperCase()}</span>
        </motion.button>
    );
}
