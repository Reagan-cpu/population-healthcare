import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, Database, Search, Activity, Sparkles, AlertTriangle, LayoutDashboard, FileText, ClipboardList } from 'lucide-react';

const AdminDashboard = () => {
    const [generalData, setGeneralData] = useState([]);
    const [antenatalData, setAntenatalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'general', 'anc'

    const fetchData = async () => {
        try {
            const [genRes, ancRes] = await Promise.all([
                supabase.from('general_surveys').select('*').order('created_at', { ascending: false }),
                supabase.from('anc_surveys').select('*').order('created_at', { ascending: false })
            ]);

            if (genRes.error) throw genRes.error;
            if (ancRes.error) throw ancRes.error;

            setGeneralData(genRes.data);
            setAntenatalData(ancRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredGeneral = generalData.filter(item =>
        item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.adhar_number?.includes(searchTerm)
    );

    const filteredAntenatal = antenatalData.filter(item =>
        item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.adhar_number?.includes(searchTerm)
    );

    const criticalCount = antenatalData.filter(item =>
        item.sam_status === 'Yes' || item.thalassemia_status === 'Yes'
    ).length;

    const totalRecords = generalData.length + antenatalData.length;

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Activity size={48} color="#3b82f6" />
            </motion.div>
            <p style={{ color: '#64748b', fontWeight: '500' }}>Synchronizing Health Dataset...</p>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '1400px', padding: '20px' }}>
            {/* Header Section */}
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Intelligence
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '8px' }}>Population-wide health monitoring dashboard</p>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Universal Search..."
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

            {/* Tab Navigation */}
            <div className="admin-tabs" style={{
                display: 'flex',
                gap: '8px',
                backgroundColor: '#f1f5f9',
                padding: '6px',
                borderRadius: '16px',
                width: 'fit-content',
                marginBottom: '40px',
                boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
            }}>
                <TabButton
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                    icon={<LayoutDashboard size={18} />}
                    label="Executive Overview"
                />
                <TabButton
                    active={activeTab === 'general'}
                    onClick={() => setActiveTab('general')}
                    icon={<FileText size={18} />}
                    label="General Health"
                />
                <TabButton
                    active={activeTab === 'anc'}
                    onClick={() => setActiveTab('anc')}
                    icon={<ClipboardList size={18} />}
                    label="Antenatal Care"
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && (
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            <StatsCard
                                icon={<Users color="#3b82f6" size={32} />}
                                label="Total Population Records"
                                value={totalRecords}
                                color="#3b82f6"
                                subtext="Combined datasets"
                            />
                            <StatsCard
                                icon={<Activity color="#10b981" size={32} />}
                                label="General Health Entries"
                                value={generalData.length}
                                color="#10b981"
                                subtext="Routine survey data"
                            />
                            <StatsCard
                                icon={<Sparkles color="#8b5cf6" size={32} />}
                                label="Active ANC Cases"
                                value={antenatalData.length}
                                color="#8b5cf6"
                                subtext="Pregnancy monitoring"
                            />
                            <StatsCard
                                icon={<AlertTriangle color="#ef4444" size={32} />}
                                label="High-Risk ANC Cases"
                                value={criticalCount}
                                color="#ef4444"
                                subtext="SAM/Thalassemia alert"
                                highRisk
                            />
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto', borderRadius: '20px' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Activity color="#10b981" />
                                <h3 style={{ margin: 0 }}>General Health Dataset</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr>
                                        <th style={thStyle}>Patient Profile</th>
                                        <th style={thStyle}>Vital Stats</th>
                                        <th style={thStyle}>Medical History</th>
                                        <th style={thStyle}>Education & Social</th>
                                        <th style={thStyle}>Family Status</th>
                                        <th style={thStyle}>Identification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGeneral.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.full_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>DOB: {item.dob}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                                                    {item.age}y / {item.gender}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    {item.diseases?.length > 0 && item.diseases[0] !== 'None' ? item.diseases.map((d, i) => (
                                                        <span key={i} style={{ fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '6px' }}>{d}</span>
                                                    )) : <span style={{ color: '#94a3b8' }}>None Reported</span>}
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '0.9rem' }}>{item.education}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Caste: {item.caste}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                {item.pregnant_woman_present === 'Yes' && <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><Sparkles size={14} /> Pregnancy in Family</span>}
                                                <div style={{ fontSize: '0.8rem' }}>Kids: {item.kids_info || 'None'}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>ID: {item.adhar_number}</div>
                                                <div style={{ fontSize: '0.85rem' }}>Mob: {item.mobile_no}</div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredGeneral.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                                <Database size={40} style={{ opacity: 0.3, marginBottom: '10px' }} /><br />
                                                No results found for "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'anc' && (
                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto', borderRadius: '20px' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #f0fdf4', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Sparkles color="#8b5cf6" />
                                <h3 style={{ margin: 0 }}>Antenatal Care Registry</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
                                <thead style={{ backgroundColor: '#f0fdf4' }}>
                                    <tr>
                                        <th style={thStyle}>Expectant Mother</th>
                                        <th style={thStyle}>Pregnancy Progress</th>
                                        <th style={thStyle}>Clinical Screening</th>
                                        <th style={thStyle}>Medical Alerts</th>
                                        <th style={thStyle}>Past History</th>
                                        <th style={thStyle}>Contact & ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAntenatal.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.full_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Age: {item.age}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '500' }}>Month {item.pregnancy_month}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>LMP: {item.lmp_date}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#10b981' }}>{item.anc_visits} Visits Done</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <Badge label="TT Injection" active={item.tetanus_injection === 'Yes'} />
                                                    <Badge label="Iron Supp." active={item.iron_supplements === 'Yes'} />
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <AlertBadge label="SAM" active={item.sam_status === 'Yes'} />
                                                    <AlertBadge label="MAM" active={item.mam_status === 'Yes'} />
                                                    <AlertBadge label="Thalassemia" active={item.thalassemia_status === 'Yes'} />
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '0.9rem' }}>Children: {item.children_no}</div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>ID: {item.adhar_number}</div>
                                                <div style={{ fontSize: '0.85rem' }}>Mob: {item.mobile_no}</div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredAntenatal.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                                <Database size={40} style={{ opacity: 0.3, marginBottom: '10px' }} /><br />
                                                No ANC cases found for "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// --- Helper Components ---

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 24px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: active ? 'white' : 'transparent',
            color: active ? '#1e293b' : '#64748b',
            fontWeight: active ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: active ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'
        }}
    >
        {icon}
        {label}
    </button>
);

const StatsCard = ({ icon, label, value, color, subtext, highRisk }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card"
        style={{
            padding: '30px',
            textAlign: 'left',
            borderRadius: '24px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            border: highRisk && value > 0 ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.2)',
            background: highRisk && value > 0 ? `linear-gradient(135deg, white 0%, ${color}05 100%)` : 'white'
        }}
    >
        <div style={{
            padding: '16px',
            backgroundColor: `${color}10`,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{subtext}</div>
        </div>
    </motion.div>
);

const Badge = ({ label, active }) => (
    <div style={{
        fontSize: '0.75rem',
        padding: '2px 8px',
        borderRadius: '6px',
        width: 'fit-content',
        backgroundColor: active ? '#dcfce7' : '#f1f5f9',
        color: active ? '#166534' : '#64748b',
        fontWeight: '500'
    }}>
        {label}: {active ? 'Yes' : 'No'}
    </div>
);

const AlertBadge = ({ label, active }) => (
    <div style={{
        fontSize: '0.75rem',
        padding: '4px 10px',
        borderRadius: '8px',
        width: 'fit-content',
        backgroundColor: active ? '#fee2e2' : '#f1f5f9',
        color: active ? '#991b1b' : '#94a3b8',
        fontWeight: active ? '700' : '400',
        border: active ? '1px solid #fecaca' : '1px solid transparent'
    }}>
        {label}: {active ? 'CRITICAL' : 'Clear'}
    </div>
);

const thStyle = { padding: '20px 24px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '20px 24px', fontSize: '0.95rem', verticalAlign: 'top' };

export default AdminDashboard;
