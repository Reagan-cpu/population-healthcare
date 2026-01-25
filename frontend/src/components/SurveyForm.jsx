import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, User, Home, MapPin, Phone, Users, Plus, Trash2, HeartPulse, Sparkles, AlertCircle, ChevronDown, ChevronUp, ShieldCheck, GraduationCap, Contact } from 'lucide-react';

const SurveyForm = ({ onSuccess }) => {
    const [familyData, setFamilyData] = useState({
        village: '',
        house_number: '',
        head_name: '',
        family_mobile: '',
        member_count: 1,
        child_0_2_m: 0,
        child_0_2_f: 0,
        child_2_5_m: 0,
        child_2_5_f: 0,
        child_10_15_m: 0,
        child_10_15_f: 0
    });

    const [members, setMembers] = useState([createEmptyMember(true)]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [expandedMember, setExpandedMember] = useState(0);

    const diseaseOptions = [
        'Diabetes', 'Hypertension', 'Thyroid', 'Asthma',
        'Heart Disease', 'Arthritis', 'Kidney Disease', 'Cancer', 'None'
    ];

    function createEmptyMember(isHead = false) {
        return {
            full_name: '',
            dob: '',
            age: '',
            gender: '',
            aadhar_number: '',
            relation_to_head: isHead ? 'Self (Head)' : '',
            education: '',
            caste: '',
            diseases: [],
            is_pregnant: 'No',
            anc_details: {
                pregnancy_month: '',
                anc_visits: '',
                tetanus_injection: 'No',
                iron_supplements: 'No',
                children_no: '',
                lmp_date: '',
                sam_status: 'No',
                mam_status: 'No',
                thalassemia_status: 'No'
            }
        };
    }

    const handleFamilyChange = (e) => {
        const { name, value } = e.target;

        // Mobile Number Validation: Only digits, max 10
        if (name === 'family_mobile') {
            const onlyNums = value.replace(/[^0-9]/g, '');
            if (onlyNums.length <= 10) {
                setFamilyData(prev => ({ ...prev, [name]: onlyNums }));
            }
            return;
        }


        setFamilyData(prev => ({ ...prev, [name]: value }));

        if (name === 'head_name') {
            setMembers(prev => {
                const updated = [...prev];
                if (updated[0]) updated[0].full_name = value;
                return updated;
            });
        }

        if (name === 'member_count') {
            const count = parseInt(value) || 0;
            if (count > 0) {
                setMembers(prev => {
                    if (prev.length < count) {
                        const newMembers = Array(count - prev.length).fill(null).map(() => createEmptyMember());
                        return [...prev, ...newMembers];
                    } else {
                        return prev.slice(0, count);
                    }
                });
            }
        }
    };


    const calculateAge = (dob) => {
        if (!dob) return '';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : 0;
    };

    const handleMemberChange = (index, e) => {
        const { name, value } = e.target;
        const updatedMembers = [...members];

        if (name.startsWith('anc_')) {
            const field = name.replace('anc_', '');
            updatedMembers[index].anc_details = {
                ...updatedMembers[index].anc_details,
                [field]: value
            };
        } else {
            updatedMembers[index][name] = value;
            if (name === 'dob') {
                updatedMembers[index].age = calculateAge(value);
            }
            if (index === 0 && name === 'full_name') {
                setFamilyData(prev => ({ ...prev, head_name: value }));
            }
        }

        setMembers(updatedMembers);
    };

    const handleDiseaseToggle = (index, disease) => {
        const updatedMembers = [...members];
        const currentDiseases = updatedMembers[index].diseases;

        let newDiseases;
        if (disease === 'None') {
            newDiseases = ['None'];
        } else {
            const filtered = currentDiseases.filter(d => d !== 'None');
            if (filtered.includes(disease)) {
                newDiseases = filtered.filter(d => d !== disease);
            } else {
                newDiseases = [...filtered, disease];
            }
        }

        updatedMembers[index].diseases = newDiseases;
        setMembers(updatedMembers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const aadhars = members.map(m => m.aadhar_number.trim()).filter(a => a !== '');
        if (new Set(aadhars).size !== aadhars.length) {
            setMessage({ type: 'error', text: 'Duplicate Aadhar Card Numbers detected within the form.' });
            setLoading(false);
            return;
        }

        // Phone Length Validation
        if (familyData.family_mobile.length !== 10) {
            setMessage({ type: 'error', text: 'Please enter a valid 10-digit mobile number.' });
            setLoading(false);
            return;
        }


        try {
            const { data: household, error: hError } = await supabase
                .from('households')
                .insert([{
                    village: familyData.village,
                    house_number: familyData.house_number,
                    head_name: familyData.head_name,
                    family_mobile: familyData.family_mobile,
                    child_0_2_m: parseInt(familyData.child_0_2_m),
                    child_0_2_f: parseInt(familyData.child_0_2_f),
                    child_2_5_m: parseInt(familyData.child_2_5_m),
                    child_2_5_f: parseInt(familyData.child_2_5_f),
                    child_10_15_m: parseInt(familyData.child_10_15_m),
                    child_10_15_f: parseInt(familyData.child_10_15_f)
                }])
                .select()
                .single();

            if (hError) throw hError;

            for (const member of members) {
                const { data: mData, error: mError } = await supabase
                    .from('household_members')
                    .insert([{
                        household_id: household.id,
                        full_name: member.full_name,
                        dob: member.dob,
                        age: member.age,
                        gender: member.gender,
                        relation_to_head: member.relation_to_head,
                        aadhar_number: member.aadhar_number,
                        diseases: member.diseases,
                        education: member.education,
                        caste: member.caste,
                        pregnant: member.is_pregnant === 'Yes'
                    }])
                    .select()
                    .single();

                if (mError) {
                    if (mError.code === '23505') throw new Error(`Aadhar ${member.aadhar_number} is already registered in the system.`);
                    throw mError;
                }

                await supabase.from('general_health_surveys').insert([{
                    member_id: mData.id,
                    diseases: member.diseases,
                    education: member.education,
                    caste: member.caste
                }]);

                if (member.gender === 'Female' && member.is_pregnant === 'Yes') {
                    const { anc_details } = member;
                    await supabase.from('anc_surveys').insert([{
                        member_id: mData.id,
                        lmp_date: anc_details.lmp_date,
                        pregnancy_month: parseInt(anc_details.pregnancy_month),
                        anc_visits: parseInt(anc_details.anc_visits),
                        tetanus: anc_details.tetanus_injection === 'Yes',
                        iron_supplements: anc_details.iron_supplements === 'Yes',
                        sam: anc_details.sam_status === 'Yes',
                        mam: anc_details.mam_status === 'Yes',
                        thalassemia: anc_details.thalassemia_status === 'Yes'
                    }]);
                }
            }

            setMessage({ type: 'success', text: 'Relational Household Registry finalized successfully!' });
            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Submission error:', error);
            setMessage({ type: 'error', text: error.message || 'Submission failed. Please check your network or database schema.' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFamilyData({
            village: '',
            house_number: '',
            head_name: '',
            family_mobile: '',
            member_count: 1,
            child_0_2_m: 0,
            child_0_2_f: 0,
            child_2_5_m: 0,
            child_2_5_f: 0,
            child_10_15_m: 0,
            child_10_15_f: 0
        });
        setMembers([createEmptyMember(true)]);
        setExpandedMember(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card container"
            style={{ width: '900px', maxWidth: '100%', padding: '40px', margin: '0 auto' }}
        >
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <div style={{
                    backgroundColor: '#3b82f615',
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.2)'
                }}>
                    <ShieldCheck size={36} color="#3b82f6" />
                </div>
                <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Household Health Registry
                </h2>
                <p style={{ color: '#64748b', marginTop: '10px', fontSize: '1.1rem' }}>Comprehensive Population Health Monitoring</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Household Context Section */}
                <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '30px',
                    borderRadius: '24px',
                    marginBottom: '40px',
                    border: '1px solid #e2e8f0'
                }}>
                    <h4 style={{ margin: '0 0 25px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '1.2rem' }}>
                        <Home size={22} color="#3b82f6" /> Household Metadata
                    </h4>

                    <div className="survey-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px' }}>
                        <div className="form-group">
                            <label>Village Name</label>
                            <input name="village" value={familyData.village} onChange={handleFamilyChange} required placeholder="Village" />
                        </div>

                        <div className="form-group">
                            <label>House No./Landmark</label>
                            <input name="house_number" value={familyData.house_number} onChange={handleFamilyChange} required placeholder="Building/Door No." />
                        </div>

                        <div className="form-group">
                            <label>Family Head Name</label>
                            <input name="head_name" value={familyData.head_name} onChange={handleFamilyChange} required placeholder="Full Name" />
                        </div>

                        <div className="form-group">
                            <label>Registered Mobile</label>
                            <input type="tel" name="family_mobile" value={familyData.family_mobile} onChange={handleFamilyChange} required placeholder="10-digit number" />
                        </div>

                        <div className="form-group">
                            <label>Total Members</label>
                            <div style={{ position: 'relative' }}>
                                <Users size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input type="number" name="member_count" value={familyData.member_count} onChange={handleFamilyChange} min="1" max="25" required />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', paddingTop: '25px', borderTop: '1px solid #e2e8f0' }}>
                        <h5 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Children Demographic Summary</h5>
                        <div className="survey-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                            <div className="form-group">
                                <label>0-2 Years (Male/Female)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="number" name="child_0_2_m" value={familyData.child_0_2_m} onChange={handleFamilyChange} min="0" placeholder="M" />
                                    <input type="number" name="child_0_2_f" value={familyData.child_0_2_f} onChange={handleFamilyChange} min="0" placeholder="F" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>2-5 Years (Male/Female)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="number" name="child_2_5_m" value={familyData.child_2_5_m} onChange={handleFamilyChange} min="0" placeholder="M" />
                                    <input type="number" name="child_2_5_f" value={familyData.child_2_5_f} onChange={handleFamilyChange} min="0" placeholder="F" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>10-15 Years (Male/Female)</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="number" name="child_10_15_m" value={familyData.child_10_15_m} onChange={handleFamilyChange} min="0" placeholder="M" />
                                    <input type="number" name="child_10_15_f" value={familyData.child_10_15_f} onChange={handleFamilyChange} min="0" placeholder="F" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Member Details */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontSize: '1.2rem' }}>
                            <User size={22} color="#6366f1" /> Resident Health Profiles
                        </h4>
                    </div>

                    {members.map((member, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <div
                                onClick={() => setExpandedMember(expandedMember === index ? -1 : index)}
                                style={{
                                    padding: '20px 28px',
                                    backgroundColor: 'white',
                                    color: '#1e293b',
                                    borderRadius: '18px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    border: expandedMember === index ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: '#eff6ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        color: '#3b82f6'
                                    }}>{index + 1}</div>
                                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                        {member.full_name || `Member ${index + 1}`}
                                        {index === 0 && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#64748b' }}>(Head of Household)</span>}
                                    </span>
                                </div>
                                {expandedMember === index ? <ChevronUp size={22} color="#3b82f6" /> : <ChevronDown size={22} color="#64748b" />}
                            </div>

                            <AnimatePresence>
                                {expandedMember === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ padding: '35px', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 22px 22px', backgroundColor: 'white' }}>

                                            {/* Section: Basic Info */}
                                            <div style={{ marginBottom: '35px' }}>
                                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6366f1', marginBottom: '20px', fontSize: '1.1rem' }}>
                                                    <Contact size={18} /> Basic Identification
                                                </h5>
                                                <div className="survey-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div className="form-group">
                                                        <label>Full Name</label>
                                                        <input name="full_name" value={member.full_name} onChange={(e) => handleMemberChange(index, e)} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Aadhar Number</label>
                                                        <input name="aadhar_number" value={member.aadhar_number} onChange={(e) => handleMemberChange(index, e)} required maxLength="12" />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Relation to Head</label>
                                                        {index === 0 ? <input value="Self (Head)" disabled style={{ backgroundColor: '#f8fafc' }} /> :
                                                            <input name="relation_to_head" value={member.relation_to_head} onChange={(e) => handleMemberChange(index, e)} required placeholder="e.g. Spouse" />}
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Gender Identity</label>
                                                        <select name="gender" value={member.gender} onChange={(e) => handleMemberChange(index, e)} required>
                                                            <option value="">Select Option</option>
                                                            <option value="Male">Male</option>
                                                            <option value="Female">Female</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Date of Birth</label>
                                                        <input type="date" name="dob" value={member.dob} onChange={(e) => handleMemberChange(index, e)} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Calibrated Age</label>
                                                        <input type="number" value={member.age} readOnly disabled style={{ backgroundColor: '#f1f5f9' }} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Education Status</label>
                                                        <input name="education" value={member.education} onChange={(e) => handleMemberChange(index, e)} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Caste Category</label>
                                                        <input name="caste" value={member.caste} onChange={(e) => handleMemberChange(index, e)} required />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section: Medical History */}
                                            <div style={{ marginBottom: '35px' }}>
                                                <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '15px', fontSize: '1.1rem' }}>
                                                    <HeartPulse size={18} /> Clinical History
                                                </h5>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                                    gap: '10px',
                                                    backgroundColor: '#fef2f2',
                                                    padding: '16px',
                                                    borderRadius: '18px',
                                                    border: '1px solid #fee2e2'
                                                }}>
                                                    {diseaseOptions.map(disease => (
                                                        <label key={disease} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            backgroundColor: member.diseases.includes(disease) ? 'white' : 'white',
                                                            padding: '8px 10px',
                                                            borderRadius: '8px',
                                                            border: member.diseases.includes(disease) ? '1px solid #ef4444' : '1px solid transparent',
                                                            boxShadow: member.diseases.includes(disease) ? '0 2px 4px rgba(239, 68, 68, 0.1)' : 'none'
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={member.diseases.includes(disease)}
                                                                onChange={() => handleDiseaseToggle(index, disease)}
                                                                style={{ width: 'auto' }}
                                                            />
                                                            {disease}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Section: Specialized ANC */}
                                            {member.gender === 'Female' && (
                                                <div style={{ marginBottom: '10px' }}>
                                                    <div className="form-group" style={{ marginBottom: member.is_pregnant === 'Yes' ? '25px' : '0' }}>
                                                        <label style={{ color: '#8b5cf6', fontWeight: '800' }}>Pregnancy Status Enrollment</label>
                                                        <select
                                                            name="is_pregnant"
                                                            value={member.is_pregnant}
                                                            onChange={(e) => handleMemberChange(index, e)}
                                                            style={{ border: '2px solid #ddd6fe', backgroundColor: '#f5f3ff' }}
                                                        >
                                                            <option value="No">No - Not Applicable</option>
                                                            <option value="Yes">Yes - Active Pregnancy</option>
                                                        </select>
                                                    </div>

                                                    {member.is_pregnant === 'Yes' && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 15 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            style={{
                                                                backgroundColor: '#f0fdf4',
                                                                padding: '30px',
                                                                borderRadius: '22px',
                                                                border: '1px solid #bbf7d0',
                                                                boxShadow: '0 4px 12px -2px rgba(22, 163, 74, 0.05)'
                                                            }}
                                                        >
                                                            <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', marginBottom: '25px', fontSize: '1.1rem' }}>
                                                                <Sparkles size={18} /> Antenatal Care Questionnaire
                                                            </h5>
                                                            <div className="survey-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                                                                <div className="form-group">
                                                                    <label>Last Menstrual Period (LMP)</label>
                                                                    <input type="date" name="anc_lmp_date" value={member.anc_details.lmp_date} onChange={(e) => handleMemberChange(index, e)} required />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Month of Pregnancy (1-9)</label>
                                                                    <input type="number" name="anc_pregnancy_month" value={member.anc_details.pregnancy_month} onChange={(e) => handleMemberChange(index, e)} required />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Registered ANC Visits</label>
                                                                    <input type="number" name="anc_anc_visits" value={member.anc_details.anc_visits} onChange={(e) => handleMemberChange(index, e)} required />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Tetanus Toxoid Status</label>
                                                                    <select name="anc_tetanus_injection" value={member.anc_details.tetanus_injection} onChange={(e) => handleMemberChange(index, e)}>
                                                                        <option value="No">Not Taken</option>
                                                                        <option value="Yes">Administered</option>
                                                                    </select>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Iron Supplements</label>
                                                                    <select name="anc_iron_supplements" value={member.anc_details.iron_supplements} onChange={(e) => handleMemberChange(index, e)}>
                                                                        <option value="No">No</option>
                                                                        <option value="Yes">Yes</option>
                                                                    </select>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Severe Acute Malnutrition(SAM)?</label>
                                                                    <select name="anc_sam_status" value={member.anc_details.sam_status} onChange={(e) => handleMemberChange(index, e)}>
                                                                        <option value="No">Normal</option>
                                                                        <option value="Yes">SAM Detected</option>
                                                                    </select>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Moderate Acute Malnutrition(MAM)?</label>
                                                                    <select name="anc_mam_status" value={member.anc_details.mam_status} onChange={(e) => handleMemberChange(index, e)}>
                                                                        <option value="No">Normal</option>
                                                                        <option value="Yes">MAM Detected</option>
                                                                    </select>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Thalassemia Status</label>
                                                                    <select name="anc_thalassemia_status" value={member.anc_details.thalassemia_status} onChange={(e) => handleMemberChange(index, e)}>
                                                                        <option value="No">Negative</option>
                                                                        <option value="Yes">Positive</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Submit Section */}
                <div style={{ marginTop: '50px' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            height: '68px',
                            fontSize: '1.4rem',
                            borderRadius: '20px',
                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={28} /> : (
                            <>
                                <Users size={24} /> Submit Healthcare Data
                            </>
                        )}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8', marginTop: '20px' }}>
                        Submission performs 4-tier relational indexing on Supabase secure cloud.
                    </p>
                </div>

                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: '30px',
                            padding: '20px',
                            borderRadius: '16px',
                            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                            color: message.type === 'success' ? '#166534' : '#991b1b',
                            textAlign: 'center',
                            fontWeight: '700',
                            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                            fontSize: '1.1rem'
                        }}
                    >
                        {message.text}
                    </motion.div>
                )}
            </form>
        </motion.div>
    );
};

export default SurveyForm;
