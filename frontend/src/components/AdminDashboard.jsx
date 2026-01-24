import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Database, Search, Activity, Sparkles, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
    const [generalData, setGeneralData] = useState([]);
    const [antenatalData, setAntenatalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Dataset...</div>;

    const criticalCount = antenatalData.filter(item =>
        item.sam_status === 'Yes' || item.thalassemia_status === 'Yes'
    ).length;

    const totalRecords = generalData.length + antenatalData.length;

    return (
        <div className="container" style={{ maxWidth: '1400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Health Dataset Administration</h1>
                    <p style={{ color: '#64748b' }}>Project data stored in separate specialized tables</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by Name, Adhar..."
                        style={{ paddingLeft: '40px', width: '300px', borderRadius: '12px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatsCard icon={<Users color="#3b82f6" />} label="Total Records" value={totalRecords} />
                <StatsCard icon={<Activity color="#10b981" />} label="General Surveys" value={generalData.length} />
                <StatsCard icon={<Sparkles color="#f59e0b" />} label="ANC Surveys" value={antenatalData.length} />
                <StatsCard icon={<AlertTriangle color="#ef4444" />} label="Critical ANC Cases" value={criticalCount} />
            </div>

            {/* Table 1: General Health Surveys */}
            <div style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Activity color="#3b82f6" />
                    <h2 style={{ margin: 0 }}>General Health Dataset (general_surveys)</h2>
                </div>
                <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={thStyle}>Full Name</th>
                                <th style={thStyle}>Age/Gender</th>
                                <th style={thStyle}>Diseases</th>
                                <th style={thStyle}>Education/Caste</th>
                                <th style={thStyle}>Pregnant in Family?</th>
                                <th style={thStyle}>Kids Info</th>
                                <th style={thStyle}>Adhar & Mobile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGeneral.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}><strong>{item.full_name}</strong></td>
                                    <td style={tdStyle}>{item.age} / {item.gender}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {item.diseases?.map((d, i) => (
                                                <span key={i} style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 4px', borderRadius: '4px' }}>{d}</span>
                                            )) || 'None'}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>{item.education}<br /><small>{item.caste}</small></td>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: 'bold', color: item.pregnant_woman_present === 'Yes' ? '#ef4444' : 'inherit' }}>
                                            {item.pregnant_woman_present}
                                        </span>
                                    </td>
                                    <td style={tdStyle}><small>{item.kids_info || '-'}</small></td>
                                    <td style={tdStyle}>
                                        <code>{item.adhar_number}</code><br />
                                        <small>{item.mobile_no}</small>
                                    </td>
                                </tr>
                            ))}
                            {filteredGeneral.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No General Health records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Table 2: Antenatal Care (ANC) Surveys */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Sparkles color="#10b981" />
                    <h2 style={{ margin: 0 }}>Antenatal Care Dataset (anc_surveys)</h2>
                </div>
                <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1300px' }}>
                        <thead style={{ backgroundColor: '#f0fdf4' }}>
                            <tr>
                                <th style={thStyle}>Full Name</th>
                                <th style={thStyle}>LMP Date</th>
                                <th style={thStyle}>ANC Info</th>
                                <th style={thStyle}>Nutrition Status</th>
                                <th style={thStyle}>Thalassemia</th>
                                <th style={thStyle}>Children</th>
                                <th style={thStyle}>Adhar & Mobile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAntenatal.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}><strong>{item.full_name}</strong></td>
                                    <td style={tdStyle}>{item.lmp_date}</td>
                                    <td style={tdStyle}>
                                        Month: {item.pregnancy_month}<br />
                                        Visits: {item.anc_visits}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ color: item.sam_status === 'Yes' ? '#ef4444' : 'inherit', fontWeight: 'bold' }}>SAM: {item.sam_status}</span><br />
                                        MAM: {item.mam_status}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ color: item.thalassemia_status === 'Yes' ? '#ef4444' : 'inherit', fontWeight: 'bold' }}>
                                            {item.thalassemia_status}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{item.children_no}</td>
                                    <td style={tdStyle}>
                                        <code>{item.adhar_number}</code><br />
                                        <small>{item.mobile_no}</small>
                                    </td>
                                </tr>
                            ))}
                            {filteredAntenatal.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No ANC records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const thStyle = { padding: '16px 20px', fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' };
const tdStyle = { padding: '16px 20px', fontSize: '0.9rem', verticalAlign: 'top' };

const StatsCard = ({ icon, label, value }) => (
    <motion.div whileHover={{ scale: 1.02 }} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{label}</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{value}</div>
    </motion.div>
);

export default AdminDashboard;
