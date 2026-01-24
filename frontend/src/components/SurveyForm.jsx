import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Loader2, User, BookOpen, Baby, ShieldCheck, HeartPulse, Sparkles, AlertCircle } from 'lucide-react';

const SurveyForm = ({ onSuccess }) => {
    // ... (rest of the component state remains same)
    const [surveyType, setSurveyType] = useState('general'); // 'general' or 'antenatal'
    const [formData, setFormData] = useState({
        full_name: '',
        dob: '',
        age: '',
        gender: '',
        adhar_number: '',
        diseases: [],
        education: '',
        caste: '',
        pregnant_woman_present: 'No',
        mobile_no: '',
        kids_info: '',
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
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const diseaseOptions = [
        'Diabetes', 'Hypertension', 'Thyroid', 'Asthma',
        'Heart Disease', 'Arthritis', 'Kidney Disease', 'Cancer', 'None'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('anc_')) {
            const field = name.replace('anc_', '');
            setFormData(prev => ({
                ...prev,
                anc_details: { ...prev.anc_details, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDiseaseToggle = (disease) => {
        const updatedDiseases = formData.diseases.includes(disease)
            ? formData.diseases.filter(d => d !== disease)
            : [...formData.diseases, disease];

        if (disease === 'None') {
            setFormData(prev => ({ ...prev, diseases: ['None'] }));
        } else {
            setFormData(prev => ({
                ...prev,
                diseases: updatedDiseases.filter(d => d !== 'None')
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let error;
            if (surveyType === 'general') {
                const { error: err } = await supabase
                    .from('general_surveys')
                    .insert([{
                        full_name: formData.full_name,
                        dob: formData.dob,
                        age: formData.age,
                        gender: formData.gender,
                        adhar_number: formData.adhar_number,
                        diseases: formData.diseases,
                        education: formData.education,
                        caste: formData.caste,
                        pregnant_woman_present: formData.pregnant_woman_present,
                        mobile_no: formData.mobile_no,
                        kids_info: formData.kids_info
                    }]);
                error = err;
            } else {
                const { lmp_date, children_no, pregnancy_month, anc_visits, tetanus_injection, iron_supplements, sam_status, mam_status, thalassemia_status } = formData.anc_details;
                const { error: err } = await supabase
                    .from('anc_surveys')
                    .insert([{
                        full_name: formData.full_name,
                        dob: formData.dob,
                        age: formData.age,
                        gender: formData.gender,
                        adhar_number: formData.adhar_number,
                        diseases: formData.diseases,
                        education: formData.education,
                        caste: formData.caste,
                        mobile_no: formData.mobile_no,
                        lmp_date,
                        children_no,
                        pregnancy_month,
                        anc_visits,
                        tetanus_injection,
                        iron_supplements,
                        sam_status,
                        mam_status,
                        thalassemia_status
                    }]);
                error = err;
            }

            if (error) throw error;

            setMessage({ type: 'success', text: 'Survey submitted successfully! Data saved to specialized table.' });
            resetForm();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Submission error:', error);
            setMessage({ type: 'error', text: 'Failed to submit survey. Please verify Supabase connection.' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            full_name: '', dob: '', age: '', gender: '', adhar_number: '',
            diseases: [], education: '', caste: '', pregnant_woman_present: 'No',
            mobile_no: '', kids_info: '',
            anc_details: {
                pregnancy_month: '', anc_visits: '', tetanus_injection: 'No',
                iron_supplements: 'No', children_no: '', lmp_date: '',
                sam_status: 'No', mam_status: 'No', thalassemia_status: 'No'
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card container"
            style={{ maxWidth: '800px', padding: '30px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                <button
                    type="button"
                    className={`btn ${surveyType === 'general' ? 'btn-primary' : ''}`}
                    onClick={() => setSurveyType('general')}
                    style={{ flex: 1, backgroundColor: surveyType === 'general' ? '#3b82f6' : '#f1f5f9', color: surveyType === 'general' ? 'white' : '#64748b' }}
                >
                    General Health
                </button>
                <button
                    type="button"
                    className={`btn ${surveyType === 'antenatal' ? 'btn-primary' : ''}`}
                    onClick={() => setSurveyType('antenatal')}
                    style={{ flex: 1, backgroundColor: surveyType === 'antenatal' ? '#10b981' : '#f1f5f9', color: surveyType === 'antenatal' ? 'white' : '#64748b' }}
                >
                    Antenatal Care
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                {surveyType === 'general' ? <ShieldCheck size={40} color="#3b82f6" /> : <Sparkles size={40} color="#10b981" />}
                <div>
                    <h2 style={{ margin: 0 }}>{surveyType === 'general' ? 'General Health Survey' : 'Antenatal Care Survey'}</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Comprehensive population health dataset entry</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Common Details */}
                <div style={{ gridColumn: 'span 2' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#64748b' }}>
                        <User size={18} /> Basic Information
                    </h4>
                </div>

                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Full Name" />
                </div>

                <div className="form-group">
                    <label>Mobile Number</label>
                    <input type="tel" name="mobile_no" value={formData.mobile_no} onChange={handleChange} required placeholder="10-digit mobile" />
                </div>

                <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} required placeholder="Age" />
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Adhar Card Number</label>
                    <input type="text" name="adhar_number" value={formData.adhar_number} onChange={handleChange} required placeholder="12-digit Adhar" />
                </div>

                <div className="form-group">
                    <label>Education</label>
                    <input type="text" name="education" value={formData.education} onChange={handleChange} required placeholder="Primary, Degree etc." />
                </div>

                <div className="form-group">
                    <label>Caste</label>
                    <input type="text" name="caste" value={formData.caste} onChange={handleChange} required placeholder="Enter Caste" />
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#ef4444' }}>
                        <HeartPulse size={18} /> Existing Diseases
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', backgroundColor: '#fef2f2', padding: '15px', borderRadius: '12px' }}>
                        {diseaseOptions.map(disease => (
                            <label key={disease} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: 'auto' }}
                                    checked={formData.diseases.includes(disease)}
                                    onChange={() => handleDiseaseToggle(disease)}
                                />
                                {disease}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Conditional Sections */}
                {surveyType === 'general' ? (
                    <>
                        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#10b981' }}>
                                <Baby size={18} /> Family Details
                            </h4>
                        </div>
                        <div className="form-group">
                            <label>Is any pregnant woman present in family?</label>
                            <select name="pregnant_woman_present" value={formData.pregnant_woman_present} onChange={handleChange}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Kids Info (Gender & Age)</label>
                            <textarea name="kids_info" value={formData.kids_info} onChange={handleChange} placeholder="e.g. Boy (5), Girl (2)" style={{ height: '60px', resize: 'none' }} />
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#f59e0b' }}>
                                <BookOpen size={18} /> Antenatal Care (ANC) Details
                            </h4>
                        </div>
                        <div className="form-group">
                            <label>Last Menstrual Period (LMP) Date</label>
                            <input type="date" name="anc_lmp_date" value={formData.anc_details.lmp_date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Number of Children</label>
                            <input type="number" name="anc_children_no" min="0" value={formData.anc_details.children_no} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Month of Pregnancy (1-9)</label>
                            <input type="number" name="anc_pregnancy_month" min="1" max="9" value={formData.anc_details.pregnancy_month} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>ANC visits completed</label>
                            <input type="number" name="anc_anc_visits" min="0" value={formData.anc_details.anc_visits} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Tetanus Injection?</label>
                            <select name="anc_tetanus_injection" value={formData.anc_details.tetanus_injection} onChange={handleChange}>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Iron Supplements?</label>
                            <select name="anc_iron_supplements" value={formData.anc_details.iron_supplements} onChange={handleChange}>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {/* Critical Malnutrition & Blood Tests */}
                        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#dc2626' }}>
                                <AlertCircle size={18} /> Medical Screening
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem' }}>Severe Acute Malnutrition (SAM)?</label>
                                    <select name="anc_sam_status" value={formData.anc_details.sam_status} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem' }}>Moderate Malnutrition (MAM)?</label>
                                    <select name="anc_mam_status" value={formData.anc_details.mam_status} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem' }}>Thalassaemia status?</label>
                                    <select name="anc_thalassemia_status" value={formData.anc_details.thalassemia_status} onChange={handleChange}>
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div style={{ gridColumn: 'span 2', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Submit Dataset'}
                    </button>
                </div>

                {message.text && (
                    <div style={{
                        gridColumn: 'span 2',
                        marginTop: '20px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {message.text}
                    </div>
                )}
            </form>
        </motion.div>
    );
};

export default SurveyForm;
