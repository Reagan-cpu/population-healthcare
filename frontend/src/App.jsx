import React, { useState, useEffect } from 'react';
import SurveyForm from './components/SurveyForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { Activity, ClipboardList, LayoutDashboard, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const [view, setView] = useState('survey'); // 'survey' or 'admin'
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authStatus = localStorage.getItem('admin_auth');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
        localStorage.setItem('admin_auth', 'true');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_auth');
        setView('survey');
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav className="navbar" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 40px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setView('survey')}>
                    <div style={{
                        backgroundColor: '#3b82f6',
                        padding: '8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }}>
                        <Activity size={24} color="white" />
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '1.4rem', color: '#1e293b', letterSpacing: '-0.02em' }}>HealthPulse</span>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '4px',
                    backgroundColor: '#f1f5f9',
                    padding: '4px',
                    borderRadius: '14px'
                }}>
                    <NavButton
                        active={view === 'survey'}
                        onClick={() => setView('survey')}
                        icon={<ClipboardList size={18} />}
                        label="Take Survey"
                    />
                    <NavButton
                        active={view === 'admin'}
                        onClick={() => setView('admin')}
                        icon={<LayoutDashboard size={18} />}
                        label="Admin Dashboard"
                    />
                    {isAuthenticated && view === 'admin' && (
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '11px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#ef4444',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LogOut size={18} />
                            <span style={{ fontSize: '0.95rem' }}>Logout</span>
                        </button>
                    )}
                </div>
            </nav>

            <main style={{ flex: 1, padding: '40px 20px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view + (isAuthenticated ? '_auth' : '_unauth')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {view === 'survey' ? (
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <SurveyForm onSuccess={() => { }} />
                            </div>
                        ) : (
                            isAuthenticated ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer style={{
                textAlign: 'center',
                padding: '40px',
                color: '#94a3b8',
                fontSize: '0.9rem',
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                marginTop: '60px'
            }}>
                &copy; 2024 HealthPulse Population Dataset.
                <span style={{ marginLeft: '10px', color: '#cbd5e1' }}>|</span>
                <span style={{ marginLeft: '10px' }}>State Health Infrastructure Development</span>
            </footer>
        </div>
    );
}

const NavButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '11px',
            border: 'none',
            backgroundColor: active ? 'white' : 'transparent',
            color: active ? '#3b82f6' : '#64748b',
            fontWeight: active ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: active ? '0 2px 8px -2px rgba(0,0,0,0.1)' : 'none'
        }}
    >
        {icon}
        <span style={{ fontSize: '0.95rem' }}>{label}</span>
    </button>
);

export default App;
