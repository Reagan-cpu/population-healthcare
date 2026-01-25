import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Home, MapPin, Search, Activity, Sparkles, Building2, ChevronRight, LayoutDashboard, Database, ArrowLeft, HeartPulse, ShieldCheck, AlertCircle, Baby, Zap } from 'lucide-react';

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
                                {villages
                                    .filter(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(village => (
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
                                            <th style={thStyle}>Family Head Name</th>
                                            <th style={thStyle}>Family Count</th>
                                            <th style={thStyle}>Phone No.</th>
                                            <th style={thStyle}>Pregnant Member Present?</th>
                                            <th style={thStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {households
                                            .filter(h => h.village === currentNav.id)
                                            .filter(h =>
                                                h.head_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                h.house_number.toLowerCase().includes(searchTerm.toLowerCase())
                                            )
                                            .map(house => {
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
                                                                    color: '#16a34a',
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: '700',
                                                                    backgroundColor: '#f0fdf4',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '6px',
                                                                }}>
                                                                    Yes
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No</span>
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

                            {/* Household Children Summary */}
                            {(() => {
                                const house = households.find(h => h.id === currentNav.id);
                                if (!house) return null;
                                return (
                                    <div className="glass-card" style={{
                                        padding: '25px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '24px',
                                        boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#8b5cf6' }}></div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ backgroundColor: '#f5f3ff', padding: '10px', borderRadius: '14px' }}>
                                                    <Baby size={22} color="#8b5cf6" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Household Demographic Overview</div>
                                                    <h4 style={{ margin: 0, color: '#1e293b' }}>Children and Adolescents</h4>
                                                </div>
                                            </div>
                                            <div style={{ backgroundColor: '#f8fafc', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                                <Zap size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} color="#f59e0b" />
                                                Live Registry Data
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                            <MetricSummary label="Infants (0-2 Yrs)" m={house.child_0_2_m} f={house.child_0_2_f} color="#3b82f6" />
                                            <MetricSummary label="Early Child (2-5 Yrs)" m={house.child_2_5_m} f={house.child_2_5_f} color="#10b981" />
                                            <MetricSummary label="Teen/Adolescent (10-15 Yrs)" m={house.child_10_15_m} f={house.child_10_15_f} color="#f59e0b" />
                                        </div>
                                    </div>
                                );
                            })()}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                                {households
                                    .find(h => h.id === currentNav.id).household_members
                                    ?.filter(m => m.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((member) => (
                                        <motion.div
                                            key={member.id}
                                            whileHover={{ y: -5 }}
                                            className="glass-card"
                                            style={{
                                                padding: '32px',
                                                position: 'relative',
                                                border: '1px solid #e2e8f0',
                                                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '24px'
                                            }}
                                        >
                                            {member.pregnant && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '20px',
                                                    right: '20px',
                                                    backgroundColor: '#f5f3ff',
                                                    color: '#8b5cf6',
                                                    padding: '6px 14px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '800',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    border: '1px solid #ddd6fe',
                                                    boxShadow: '0 2px 4px rgba(139, 92, 246, 0.1)'
                                                }}>
                                                    <Sparkles size={14} /> Pregnant
                                                </div>
                                            )}

                                            {/* Profile Header */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{
                                                    backgroundColor: '#f1f5f9',
                                                    width: '64px',
                                                    height: '64px',
                                                    borderRadius: '18px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                                                }}>
                                                    <User size={32} color="#64748b" />
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{member.full_name}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                                                        <span style={{ color: '#3b82f6', fontWeight: '700' }}>{member.relation_to_head}</span>
                                                        <span style={{ color: '#cbd5e1' }}>•</span>
                                                        <span>{member.age} yrs</span>
                                                        <span style={{ color: '#cbd5e1' }}>•</span>
                                                        <span>{member.gender}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Grid */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '20px',
                                                padding: '20px',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '20px',
                                                border: '1px solid #f1f5f9'
                                            }}>
                                                <div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Aadhar</div>
                                                    <div style={{ fontWeight: '700', color: '#334155', fontSize: '0.95rem' }}>{member.aadhar_number}</div>
                                                </div>
                                                <div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Education</div>
                                                    <div style={{ fontWeight: '700', color: '#334155', fontSize: '0.95rem' }}>{member.education}</div>
                                                </div>
                                            </div>

                                            {/* Health Section */}
                                            <div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <HeartPulse size={12} color="#ef4444" /> Health History
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {member.diseases?.length > 0 && member.diseases[0] !== 'None' ? member.diseases.map(d => (
                                                        <span key={d} style={{
                                                            backgroundColor: '#fee2e2',
                                                            color: '#dc2626',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            border: '1px solid #fecaca'
                                                        }}>{d}</span>
                                                    )) : (
                                                        <span style={{
                                                            color: '#10b981',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '700',
                                                            backgroundColor: '#ecfdf5',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #d1fae5'
                                                        }}>
                                                            <ShieldCheck size={16} /> Healthy
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <MemberSurveys memberId={member.id} isPregnant={member.pregnant} />
                                        </motion.div>
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

const MetricSummary = ({ label, m, f, color }) => (
    <div style={{
        backgroundColor: '#f8fafc',
        padding: '16px 20px',
        borderRadius: '20px',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    }}>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>{label}</div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0 shadow-sm' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '6px', borderRadius: '8px' }}>
                    <User size={14} color="#3b82f6" fill="#3b82f6" />
                </div>
                <div>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Boys</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>{m || 0}</div>
                </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0 shadow-sm' }}>
                <div style={{ backgroundColor: '#fdf2f8', padding: '6px', borderRadius: '8px' }}>
                    <User size={14} color="#db2777" fill="#db2777" />
                </div>
                <div>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Girls</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>{f || 0}</div>
                </div>
            </div>
        </div>
    </div>
);

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
