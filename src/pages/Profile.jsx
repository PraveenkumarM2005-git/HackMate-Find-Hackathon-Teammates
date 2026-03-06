import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Github, Code, Save, CheckCircle, Rocket } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [skillInput, setSkillInput] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            setProfile(data);
            setSkillInput(data.skills?.join(', ') || '');
        }
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        const skillsArray = skillInput.split(',').map(s => s.trim()).filter(s => s !== '');

        const { error } = await supabase
            .from('profiles')
            .update({
                skills: skillsArray,
                bio: profile.bio,
                role: profile.role,
                github_url: profile.github_url,
                name: profile.name,
                hackathons_count: parseInt(profile.hackathons_count || 0)
            })
            .eq('id', profile.id);

        if (error) {
            setMessage('Error updating profile: ' + error.message);
        } else {
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        }
        setSaving(false);
    };

    if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading profile...</div>;
    if (!profile) return <div className="flex-center" style={{ height: '60vh' }}>Please log in to view your profile.</div>;

    return (
        <div className="container animate-fade-in" style={{ maxWidth: '900px', paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                {/* Left Column - User Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                            <img
                                src={profile.avatar_url || `https://github.com/${profile.github_url?.split('/').pop() || 'github'}.png`}
                                alt="Avatar"
                                style={{ width: '140px', height: '140px', borderRadius: '50%', border: '4px solid var(--primary)', objectFit: 'cover' }}
                                onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + profile.name}
                            />
                            <div className="premium-gradient" style={{ position: 'absolute', bottom: '5px', right: '5px', width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center', border: '3px solid var(--bg-card)' }}>
                                <CheckCircle size={16} color="white" />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{profile.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{profile.email}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <Github size={18} color="var(--primary)" />
                                {profile.github_url ? (
                                    <a
                                        href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {profile.github_url.replace('https://', '')}
                                    </a>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>No GitHub linked</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <Code size={18} color="var(--primary)" />
                                <span style={{ color: 'var(--text-muted)' }}>{profile.role || 'Developer'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <Rocket size={18} color="var(--primary)" />
                                <span style={{ color: 'var(--text-muted)' }}>{profile.hackathons_count || 0} Hackathons</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Edit Form */}
                <div className="glass-card">
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={24} className="premium-gradient-text" /> Customize Profile
                    </h3>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>Full Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Your Name"
                                    value={profile.name || ''}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>Hackathons Won/Participated</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="0"
                                    value={profile.hackathons_count || 0}
                                    onChange={(e) => setProfile({ ...profile, hackathons_count: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>Professional Role</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Full Stack Developer"
                                    value={profile.role || ''}
                                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>GitHub Profile URL</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="github.com/username"
                                    value={profile.github_url || ''}
                                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>Technical Skills (Comma separated)</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="React, Node.js, Python, Supabase..."
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>These skills are used for the smart matching algorithm.</p>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '600' }}>Bio & Vision</label>
                            <textarea
                                rows="4"
                                className="input-field"
                                style={{ resize: 'none' }}
                                placeholder="Write a short bio about your hackathon journey and goals..."
                                value={profile.bio || ''}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                <Save size={20} />
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                            {message && (
                                <span style={{ color: 'var(--success)', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <CheckCircle size={18} /> {message}
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
