const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase credentials missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

// --- General Health Surveys Endpoints ---

app.get('/api/general-surveys', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('general_surveys')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching general surveys:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/general-surveys', async (req, res) => {
    try {
        const {
            full_name, dob, age, gender, adhar_number,
            diseases, education, caste, pregnant_woman_present,
            mobile_no, kids_info
        } = req.body;

        const { data, error } = await supabase
            .from('general_surveys')
            .insert([{
                full_name, dob, age, gender, adhar_number,
                diseases, education, caste, pregnant_woman_present,
                mobile_no, kids_info
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error submitting general survey:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- Antenatal Care (ANC) Surveys Endpoints ---

app.get('/api/anc-surveys', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('anc_surveys')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching ANC surveys:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/anc-surveys', async (req, res) => {
    try {
        const {
            full_name, dob, age, gender, adhar_number,
            diseases, education, caste, mobile_no,
            anc_details // This contains lmp_date, children_no, etc.
        } = req.body;

        const {
            lmp_date, children_no, pregnancy_month, anc_visits,
            tetanus_injection, iron_supplements, sam_status, mam_status, thalassemia_status
        } = anc_details || {};

        const { data, error } = await supabase
            .from('anc_surveys')
            .insert([{
                full_name, dob, age, gender, adhar_number,
                diseases, education, caste, mobile_no,
                lmp_date, children_no, pregnancy_month, anc_visits,
                tetanus_injection, iron_supplements, sam_status, mam_status, thalassemia_status
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error submitting ANC survey:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start server locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel serverless functions
module.exports = app;
