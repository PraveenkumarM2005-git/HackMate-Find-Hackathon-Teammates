import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Users, Zap, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Explore = () => {
    const [projects, setProjects] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setUser(null);
            } else {
                setUser(session.user);
                fetchProfileAndProjects(session.user.id);
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const fetchProfileAndProjects = async (userId) => {
        setLoading(true);
        // Fetch profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setUserProfile(profile);

        // Fetch projects
        const { data: projData } = await supabase
            .from('projects')
            .select('*, profiles(name, id)')
            .order('created_at', { ascending: false });

        if (projData) {
            // Local matching logic replaced the backend API
            const enrichedProjects = projData.map(project => {
                const userSkills = profile?.skills || [];
                const requiredSkills = project.required_skills || [];

                if (requiredSkills.length === 0) return { ...project, matchScore: 0 };

                const matches = requiredSkills.filter(skill =>
                    userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
                );

                const score = Math.round((matches.length / requiredSkills.length) * 100);
                return { ...project, matchScore: score };
            });
            setProjects(enrichedProjects);
        }
        setLoading(false);
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.required_skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="premium-gradient animate-float" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Discovering Projects...</p>
        </div>
    );

    if (!user) return (
        <div className="container flex-center animate-fade-in" style={{ height: '80vh', flexDirection: 'column', textAlign: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '450px', padding: '3rem' }}>
                <Zap size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Unlock <span className="premium-gradient-text">HackMate</span></h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Login with GitHub to browse projects, match with teams, and start building.</p>
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    Return to Home
                </button>
            </div>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        Find your next <span className="premium-gradient-text">challenge.</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Explore hackathon projects looking for your specific expertise.
                    </p>
                </div>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search projects or skills..."
                        className="input-field"
                        style={{ paddingLeft: '3.5rem' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '2rem'
            }}>
                {filteredProjects.map(project => (
                    <div key={project.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <span className="badge">{project.hackathon_name}</span>
                                {project.matchScore !== undefined && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        color: project.matchScore > 60 ? 'var(--success)' : 'var(--primary)',
                                        fontWeight: '800',
                                        fontSize: '0.9rem',
                                        background: project.matchScore > 60 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '0.5rem'
                                    }}>
                                        <Zap size={14} fill="currentColor" />
                                        {project.matchScore}% Match
                                    </div>
                                )}
                            </div>

                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>{project.title}</h3>
                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.95rem',
                                marginBottom: '1.5rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.6'
                            }}>
                                {project.description}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                {project.required_skills?.map(skill => (
                                    <span key={skill} style={{
                                        fontSize: '0.75rem',
                                        padding: '0.3rem 0.7rem',
                                        borderRadius: '0.5rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'var(--text-main)',
                                        fontWeight: '500'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <Users size={16} />
                                <span>{project.team_size} members needed</span>
                            </div>
                            <Link to={`/project/${project.id}`} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                                View Details <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}

                {filteredProjects.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>No projects found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
