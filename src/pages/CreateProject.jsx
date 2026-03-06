import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Rocket, Sparkles, AlertCircle } from 'lucide-react';

const CreateProject = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        hackathon_name: '',
        team_size: 2,
        required_skills: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);
        };
        checkUser();
    }, []);

    if (loading) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="premium-gradient animate-float" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Initializing Workspace...</p>
        </div>
    );

    if (!user) return (
        <div className="container flex-center animate-fade-in" style={{ height: '80vh', flexDirection: 'column', textAlign: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '450px', padding: '3rem' }}>
                <Rocket size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Launch your <span className="premium-gradient-text">Idea</span></h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign in to post your project idea and start recruiting top developers for your team.</p>
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    Back to Hub
                </button>
            </div>
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user) {
            setError('System timeout. Please refresh and log in again.');
            setLoading(false);
            return;
        }

        try {
            const skillsArray = formData.required_skills.split(',').map(s => s.trim()).filter(s => s !== '');

            console.log('Attempting to post project:', {
                title: formData.title,
                creator_id: user.id,
                skills: skillsArray
            });

            const { data, error: insertError } = await supabase
                .from('projects')
                .insert([
                    {
                        title: formData.title,
                        description: formData.description,
                        hackathon_name: formData.hackathon_name,
                        team_size: parseInt(formData.team_size) || 2,
                        required_skills: skillsArray,
                        creator_id: user.id
                    }
                ])
                .select();

            if (insertError) {
                console.error('Supabase project insertion error:', insertError);
                setError(`Database Error: ${insertError.message || insertError.details || 'Check if the "projects" table exists in your SQL Editor.'}`);
            } else {
                console.log('Project posted successfully:', data);
                navigate('/explore');
            }
        } catch (err) {
            console.error('Critical Fetch/Network Error:', err);
            setError(`Network Error: ${err.message}. Please restart your Vite server (Ctrl+C and npm run dev) and ensure you have run the SQL queries in Supabase.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '700px', paddingTop: '4rem', paddingBottom: '6rem' }}>
            <div className="glass-card" style={{ padding: '3rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="premium-gradient animate-float" style={{ width: '80px', height: '80px', borderRadius: '2rem', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem', boxShadow: '0 20px 40px var(--primary-glow)' }}>
                        <Rocket size={40} color="white" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Launch Your <span className="premium-gradient-text">Vision</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Define your project and find the elite team you deserve.</p>
                </div>

                {error && (
                    <div style={{ padding: '1rem 1.5rem', borderRadius: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <AlertCircle size={20} />
                        <span style={{ fontWeight: '500' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '0.25rem' }}>Project Title</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="e.g. Decentralized Governance Hub"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '0.25rem' }}>Hackathon Name</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="e.g. Smart India Hackathon"
                                value={formData.hackathon_name}
                                onChange={(e) => setFormData({ ...formData, hackathon_name: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <label style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '0.25rem' }}>Team Capacity</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                required
                                className="input-field"
                                value={formData.team_size}
                                onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '0.25rem' }}>Required Expertise (Comma separated)</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="React, PyTorch, Solidity, UI Design..."
                            value={formData.required_skills}
                            onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '600' }}>
                            <Sparkles size={14} /> Smart matching will prioritize these skills.
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', paddingLeft: '0.25rem' }}>Project Blueprint</label>
                        <textarea
                            rows="5"
                            required
                            className="input-field"
                            style={{ resize: 'none', lineHeight: '1.7' }}
                            placeholder="Detail your project goals, technical stack, and exactly who you're looking for..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', height: '3.5rem', fontSize: '1.1rem', marginTop: '1rem' }}
                    >
                        {loading ? 'Transmitting Data...' : (
                            <>
                                <Rocket size={20} /> Deploy Project Idea
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateProject;
