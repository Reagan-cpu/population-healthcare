import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Home, MapPin, Search, Activity, Sparkles, Building2, ChevronRight, LayoutDashboard, Database, ArrowLeft, HeartPulse, ShieldCheck, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Navigation State
    const [navStack, setNavStack] = useState([{ level: 'villages', label: 'All Villages' }]);
    const currentNav = navStack[navStack.length - 1];

    const fetchData = async () => {
        try {
            // Fetch households with their members joined in
            const { data, error } = await supabase
                .from('households')
                .select(`
                    *,
                    household_members (*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHouseholds(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Derived Data for Villages
    const villages = Array.from(new Set(households.map(h => h.village)));

    // Stats calculation from relational data
    const getStats = () => {
        let totalMembers = 0;
        let pregnantCount = 0;
        households.forEach(h => {
            const members = h.household_members || [];
            totalMembers += members.length;
            members.forEach(m => {
                if (m.pregnant) pregnantCount++;
            });
        });
        return { totalHouses: households.length, totalMembers, pregnantCount, villageCount: villages.length };
    };

    const stats = getStats();

    // Navigation Handlers
    const pushView = (level, id, label) => {
        setNavStack(prev => [...prev, { level, id, label }]);
        setSearchTerm('');
    };

    const popView = () => {
        if (navStack.length > 1) {
            setNavStack(prev => prev.slice(0, -1));
        }
    };

    const goToLevel = (index) => {
        setNavStack(prev => prev.slice(0, index + 1));
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Activity size={48} color="#3b82f6" />
            </motion.div>
            <p style={{ color: '#64748b', fontWeight: '500' }}>Accessing Normalized Registry...</p>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '1400px', padding: '20px' }}>
            {/* Header */}
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Intelligence
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Relational Population Health Ecosystem</p>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: '100%', maxWidth: '400px' }}>
                    <div className="search-container" style={{ position: 'relative', width: '100%' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search Village/House/Name..."
                            style={{
                                paddingLeft: '40px',
                                width: '320px',
                                borderRadius: '14px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                                height: '48px'
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Global Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', backgroundColor: 'white', padding: '12px 20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                {navStack.map((nav, index) => (
                    <React.Fragment key={index}>
                        <button
                            onClick={() => goToLevel(index)}
                            style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: index === navStack.length - 1 ? '#3b82f6' : '#64748b',
                                fontWeight: index === navStack.length - 1 ? '700' : '500',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            {nav.label}
                        </button>
                        {index < navStack.length - 1 && <ChevronRight size={16} color="#cbd5e1" />}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentNav.level + currentNav.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {currentNav.level === 'villages' && (
                        <>
                            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                <StatsCard icon={<Building2 />} label="Active Villages" value={stats.villageCount} color="#3b82f6" />
                                <StatsCard icon={<Home />} label="Total Households" value={stats.totalHouses} color="#10b981" />
                                <StatsCard icon={<Users />} label="Resident Population" value={stats.totalMembers} color="#8b5cf6" />
                                <StatsCard icon={<Sparkles />} label="Active ANC Cases" value={stats.pregnantCount} color="#f59e0b" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                                {villages.map(village => (
                                    <div
                                        key={village}
                                        className="glass-card"
                                        onClick={() => pushView('households', village, village)}
                                        style={{ padding: '30px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div>
                                            <h3 style={{ margin: 0 }}>{village}</h3>
                                            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>
                                                {households.filter(h => h.village === village).length} Households
                                            </p>
                                        </div>
                                        <ChevronRight color="#3b82f6" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {currentNav.level === 'households' && (
                        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <button onClick={popView} className="btn" style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#f1f5f9' }}>
                                    <ArrowLeft size={18} />
                                </button>
                                <h3 style={{ margin: 0 }}>Family Registry: {currentNav.label}</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ backgroundColor: '#f8fafc' }}>
                                        <tr>
                                            <th style={thStyle}>House No.</th>
                                            <th style={thStyle}>Head Name</th>
                                            <th style={thStyle}>Family Count</th>
                                            <th style={thStyle}>Contact</th>
                                            <th style={thStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {households.filter(h => h.village === currentNav.id).map(house => {
                                            const hasPregnant = house.household_members?.some(m => m.pregnant);
                                            return (
                                                <tr key={house.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={tdStyle}>{house.house_number}</td>
                                                    <td style={tdStyle}>{house.head_name}</td>
                                                    <td style={tdStyle}>{house.household_members?.length || 0} Members</td>
                                                    <td style={tdStyle}>{house.family_mobile}</td>
                                                    <td style={tdStyle}>
                                                        {hasPregnant ? (
                                                            <span style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                color: '#8b5cf6',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '700',
                                                                backgroundColor: '#f5f3ff',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px',
                                                                width: 'fit-content'
                                                            }}>
                                                                <Sparkles size={12} /> ANC ACTIVE
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Regular</span>
                                                        )}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                                            onClick={() => pushView('residents', house.id, `House ${house.house_number}`)}
                                                        >
                                                            View Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {currentNav.level === 'residents' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <button onClick={popView} className="btn" style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
                                    <ArrowLeft size={18} />
                                </button>
                                <h3 style={{ margin: 0 }}>Residents of {currentNav.label}</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px' }}>
                                {households.find(h => h.id === currentNav.id).household_members?.map((member) => (
                                    <div key={member.id} className="glass-card" style={{ padding: '30px', position: 'relative' }}>
                                        {member.pregnant && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '20px',
                                                right: '20px',
                                                backgroundColor: '#f5f3ff',
                                                color: '#8b5cf6',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <Sparkles size={14} /> ANC ACTIVE
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                            <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '12px' }}>
                                                <User color="#64748b" />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0 }}>{member.full_name}</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                                                    {member.relation_to_head} • {member.age} yrs • {member.gender}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem' }}>
                                            <div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Aadhar</div>
                                                <div style={{ fontWeight: '500' }}>{member.aadhar_number}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Education</div>
                                                <div style={{ fontWeight: '500' }}>{member.education}</div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '8px' }}>Health History</div>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {member.diseases?.length > 0 && member.diseases[0] !== 'None' ? member.diseases.map(d => (
                                                    <span key={d} style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>{d}</span>
                                                )) : <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}><ShieldCheck size={14} /> Healthy</span>}
                                            </div>
                                        </div>

                                        <MemberSurveys memberId={member.id} isPregnant={member.pregnant} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Sub-component to fetch and show surveys for a specific member
const MemberSurveys = ({ memberId, isPregnant }) => {
    const [anc, setAnc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isPregnant) {
            supabase.from('anc_surveys')
                .select('*')
                .eq('member_id', memberId)
                .single()
                .then(({ data }) => setAnc(data))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [memberId, isPregnant]);

    if (loading) return null;

    return (
        <>
            {isPregnant && anc && (
                <div style={{ marginTop: '20px', padding: '18px', backgroundColor: '#f0fdf4', borderRadius: '14px', border: '1px solid #bbf7d0', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.05)' }}>
                    <h5 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px dashed #bbf7d0', paddingBottom: '10px' }}>
                        <Sparkles size={16} /> Antenatal Care (ANC) Details
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#16653490', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>LMP Date</span>
                            <span style={{ fontWeight: '600' }}>{anc.lmp_date || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#16653490', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Pregnancy Month</span>
                            <span style={{ fontWeight: '600' }}>{anc.pregnancy_month} Month</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#16653490', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>ANC Visits</span>
                            <span style={{ fontWeight: '600' }}>{anc.anc_visits} Completed</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#16653490', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Tetanus Status</span>
                            <span style={{ fontWeight: '600', color: anc.tetanus ? '#166534' : '#991b1b' }}>{anc.tetanus ? 'Administered' : 'Pending'}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#16653490', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>Iron Supplements</span>
                            <span style={{ fontWeight: '600', color: anc.iron_supplements ? '#166534' : '#991b1b' }}>{anc.iron_supplements ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    {(anc.sam || anc.mam || anc.thalassemia) && (
                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #bbf7d0' }}>
                            <div style={{ color: '#16653490', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Clinical Risk Indicators</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {anc.sam && <span style={riskBadgeStyle}>SAM Detected</span>}
                                {anc.mam && <span style={riskBadgeStyle}>MAM Detected</span>}
                                {anc.thalassemia && <span style={riskBadgeStyle}>Thalassemia +</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

const StatsCard = ({ icon, label, value, color }) => (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ backgroundColor: `${color}10`, padding: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {React.cloneElement(icon, { size: 28, color: color })}
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{value}</div>
        </div>
    </div>
);

const riskBadgeStyle = { backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' };
const thStyle = { padding: '16px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' };
const tdStyle = { padding: '16px 24px', fontSize: '0.95rem' };

export default AdminDashboard;
