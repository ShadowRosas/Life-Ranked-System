
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import './Login.css';

export function Login() {
    const { login } = useGame();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSuccess = async (response: any) => {
        if (response.credential) {
            const success = await login(response.credential);
            if (success) {
                navigate('/');
            }
        }
    };

    const handleError = () => {
        console.error('Login Failed');
        alert('Google Login Failed. Please try again.');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="login-header"
                >
                    <h1>{t('dash_welcome')}</h1>
                    <p>{t('login_tagline')}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="login-card"
                >
                    <h2>{t('login_welcome')}</h2>
                    <p className="login-subtitle">{t('login_subtitle')}</p>


                    <div className="google-btn-wrapper">
                        <GoogleLogin
                            onSuccess={handleSuccess}
                            onError={handleError}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            text="continue_with"
                        />
                    </div>

                    <div className="login-divider">
                        <span>OR (DEV MODE)</span>
                    </div>

                    <form className="dev-login-form" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const email = formData.get('email') as string;
                        if (!email) return;

                        // Construct fake token for backend dev-mode fallback
                        // Format: header.payload.signature
                        const payload = JSON.stringify({
                            email: email,
                            name: email.split('@')[0],
                            picture: '',
                            sub: 'dev_' + email.replace(/[^a-zA-Z0-9]/g, '')
                        });
                        const fakeToken = `fake.${btoa(payload)}.signature`;

                        login(fakeToken).then(success => {
                            if (success) navigate('/');
                        });
                    }}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email..."
                            defaultValue="theshadowrosas@gmail.com"
                            required
                            className="dev-input"
                        />
                        <button type="submit" className="dev-btn">
                            Dev Login
                        </button>
                    </form>

                    <div className="login-benefits">
                        <div className="benefit-item">
                            <span>🏆</span>
                            <p>{t('login_benefits_ranks')}</p>
                        </div>
                        <div className="benefit-item">
                            <span>☁️</span>
                            <p>{t('login_benefits_cloud')}</p>
                        </div>
                        <div className="benefit-item">
                            <span>🔥</span>
                            <p>{t('login_benefits_compete')}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
