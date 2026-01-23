import React, { useState } from 'react';
import SurveyForm from './components/SurveyForm';
import AdminDashboard from './components/AdminDashboard';
import { Activity } from 'lucide-react';

function App() {
    const [view, setView] = useState('survey'); // 'survey' or 'admin'

    return (
        <div className="app-container">
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 40px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6' }}>
                    <Activity size={28} strokeWidth={2.5} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>HealthPulse</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setView('survey')}
                        className={`btn ${view === 'survey' ? 'btn-primary' : ''}`}
                        style={{ backgroundColor: view === 'survey' ? '#3b82f6' : 'transparent', color: view === 'survey' ? 'white' : '#64748b' }}
                    >
                        Take Survey
                    </button>
                    <button
                        onClick={() => setView('admin')}
                        className={`btn ${view === 'admin' ? 'btn-primary' : ''}`}
                        style={{ backgroundColor: view === 'admin' ? '#3b82f6' : 'transparent', color: view === 'admin' ? 'white' : '#64748b' }}
                    >
                        Admin View
                    </button>
                </div>
            </nav>

            <main style={{ padding: '20px' }}>
                {view === 'survey' ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
                        <SurveyForm onSuccess={() => { }} />
                    </div>
                ) : (
                    <AdminDashboard />
                )}
            </main>

            <footer style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
                &copy; 2024 HealthPulse Population Dataset. All rights reserved.
            </footer>
        </div>
    );
}

export default App;
