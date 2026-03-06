import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Users, Calendar, Shield, Send, CheckCircle, AlertCircle, MessageCircle, Code, Zap, Github } from 'lucide-react';

const ProjectDetail = () => {
    const [user, setUser] = useState(null);
    const [project, setProject] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinMessage, setJoinMessage] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [hasRequested, setHasRequested] = useState(false);
    const [status, setStatus] = useState(null);
    const [matchScore, setMatchScore] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [id]);

    const calculateMatch = (userSkills, requiredSkills) => {
        if (!requiredSkills || requiredSkills.length === 0) return 0;
        const matches = requiredSkills.filter(skill =>
            userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
        );
        return Math.round((matches.length / requiredSkills.length) * 100);
    };

    const fetchData = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        // Fetch project details
        const { data: projData, error } = await supabase
            .from('projects')
            .select('*, profiles(id, name, email, github_url, skills)')
            .eq('id', id)
            .single();

        if (error || !projData) {
            navigate('/explore');
            return;
        }

        setProject(projData);

        if (session) {
            const owner = projData.creator_id === session.user.id;
            setIsOwner(owner);

            // Fetch user profile for matching
            const { data: myProfile } = await supabase
                .from('profiles')
                .select('skills')
                .eq('id', session.user.id)
                .single();

            if (myProfile) {
                const score = calculateMatch(myProfile.skills || [], projData.required_skills || []);
                setMatchScore(score);
            }

            // Check if user already requested
            const { data: reqData } = await supabase
                .from('join_requests')
                .select('*')
                .eq('project_id', id)
                .eq('user_id', session.user.id);

            if (reqData && reqData.length > 0) {
                setHasRequested(true);
                setStatus(reqData[0].status);
            }

            // If owner, fetch all requests
            if (owner) {
                const { data: allReqs } = await supabase
                    .from('join_requests')
                    .select('*, profiles(id, name, skills, github_url, hackathons_count)')
                    .eq('project_id', id);

                // Enrichment with local match score for owner view
                if (allReqs) {
                    const enriched = allReqs.map(r => {
                        return {
                            ...r,
                            matchScore: calculateMatch(r.profiles.skills || [], projData.required_skills || [])
                        };
                    });
                    setRequests(enriched);
                }
            }
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (!user) return navigate('/');

        const { error } = await supabase
            .from('join_requests')
            .insert({
                project_id: id,
                user_id: user.id,
                message: joinMessage
            });

        if (error) alert(error.message);
        else fetchData();
    };

    const handleRequestStatus = async (reqId, newStatus) => {
        const { error } = await supabase
            .from('join_requests')
            .update({ status: newStatus })
            .eq('id', reqId);

        if (error) alert(error.message);
        else fetchData();
    };

    if (loading) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="premium-gradient animate-float" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Preparing Project Data...</p>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '3rem', alignItems: 'start' }}>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                                    {project.hackathon_name}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <Calendar size={14} />
                                    {new Date(project.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            {!isOwner && user && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: matchScore > 60 ? 'var(--success)' : 'var(--primary)',
                                    fontWeight: '800',
                                    fontSize: '1rem',
                                    background: matchScore > 60 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.75rem'
                                }}>
                                    <Zap size={18} fill="currentColor" />
                                    {matchScore}% Compatibility
                                </div>
                            )}
                        </div>

                        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.1' }}>{project.title}</h1>
                        <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '2.5rem', lineHeight: '1.8', opacity: 0.9 }}>
                            {project.description}
                        </p>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Code size={20} color="var(--primary)" /> Tech Stack Required
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1rem' }}>
                            {project.required_skills?.map(skill => (
                                <span key={skill} className="badge" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', borderRadius: '0.75rem' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {(status === 'accepted' || isOwner) && (
                        <div className="glass-card" style={{ border: `2px solid ${status === 'accepted' ? 'var(--success)' : 'var(--primary)'}`, background: 'rgba(255, 255, 255, 0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div className="premium-gradient" style={{ width: '60px', height: '60px', borderRadius: '1rem', display: 'grid', placeItems: 'center' }}>
                                    {status === 'accepted' ? <CheckCircle size={32} color="white" /> : <MessageCircle size={32} color="white" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                                        {status === 'accepted' ? 'Application Accepted!' : 'Team Headquarters'}
                                    </h4>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        {status === 'accepted'
                                            ? 'You are now a part of this squad. Time to build something epic.'
                                            : 'Access the secure team channel to coordinate with your members.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/chat/${id}`)}
                                    className="btn-primary"
                                    style={{ background: status === 'accepted' ? 'var(--success)' : 'var(--primary)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
                                >
                                    <MessageCircle size={20} /> Open Team Chat
                                </button>
                            </div>
                        </div>
                    )}

                    {isOwner && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Users size={28} className="premium-gradient-text" />
                                Recruitment Dashboard
                                <span className="badge" style={{ marginLeft: '1rem' }}>{requests.length} Requests</span>
                            </h3>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {requests.map(req => (
                                    <div key={req.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            <img
                                                src={`https://github.com/${req.profiles?.github_url?.split('/').pop() || 'github'}.png`}
                                                alt="Avatar"
                                                style={{ width: '64px', height: '64px', borderRadius: '1rem', border: '2px solid var(--primary)' }}
                                            />
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{req.profiles.name}</h4>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{req.profiles.hackathons_count || 0} Hackathons Completed</p>
                                                    </div>
                                                    <div style={{
                                                        color: req.matchScore > 60 ? 'var(--success)' : 'var(--primary)',
                                                        fontWeight: '800',
                                                        fontSize: '0.9rem',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '0.6rem'
                                                    }}>
                                                        {req.matchScore}% Match
                                                    </div>
                                                </div>
                                                <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>"{req.message}"</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                    {req.profiles.skills?.map(s => (
                                                        <span key={s} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.4rem', border: '1px solid var(--glass-border)' }}>
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>

                                                {req.status === 'pending' ? (
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <button onClick={() => handleRequestStatus(req.id, 'accepted')} className="btn-primary" style={{ flex: 1, background: 'var(--success)', color: 'white' }}>
                                                            Approve Member
                                                        </button>
                                                        <button onClick={() => handleRequestStatus(req.id, 'rejected')} className="btn-outline" style={{ flex: 1 }}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{
                                                            flex: 1,
                                                            textAlign: 'center',
                                                            padding: '0.75rem',
                                                            borderRadius: '0.75rem',
                                                            background: req.status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                            color: req.status === 'accepted' ? 'var(--success)' : 'var(--error)',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            Status: {req.status}
                                                        </div>
                                                        {req.status === 'accepted' && (
                                                            <button
                                                                onClick={() => navigate(`/chat/${id}`)}
                                                                className="btn-primary"
                                                                style={{ background: 'var(--success)', fontSize: '0.85rem', padding: '0.75rem 1.25rem' }}
                                                            >
                                                                <MessageCircle size={16} /> Chat
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {requests.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.25rem', border: '1px dashed var(--glass-border)' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>Waiting for the first brave hacker to apply...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={18} color="var(--primary)" /> Visionary Leader
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                                src={`https://github.com/${project.profiles?.github_url?.split('/').pop() || 'github'}.png`}
                                alt="Avatar"
                                style={{ width: '56px', height: '56px', borderRadius: '1rem', border: '2px solid var(--glass-border)' }}
                                onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + project.profiles?.name}
                            />
                            <div>
                                <h5 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{project.profiles?.name}</h5>
                                <a href={project.profiles?.github_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Github size={12} /> GitHub Profile
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={18} color="var(--primary)" /> Availability
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{project.team_size}</span>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Slots Open</span>
                        </div>
                    </div>

                    {!isOwner && !hasRequested && (
                        <div className="glass-card" style={{ border: '1px solid var(--primary)', background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.05), transparent)' }}>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>Ready to Apply?</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Introduce yourself to the team leader and explain how you can help.</p>
                            <textarea
                                className="input-field"
                                placeholder="Example: Hey! I have 2 years of experience with React and I've won 2 hackathons before. I can help with the ML integration as well."
                                style={{ marginBottom: '1.5rem', height: '120px', fontSize: '0.9rem' }}
                                value={joinMessage}
                                onChange={(e) => setJoinMessage(e.target.value)}
                            ></textarea>
                            <button
                                onClick={handleJoin}
                                className="btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <Send size={20} /> Submit Application
                            </button>
                        </div>
                    )}

                    {hasRequested && status === 'pending' && (
                        <div className="glass-card" style={{ textAlign: 'center', border: '1px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                            <div className="premium-gradient animate-float" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem' }}>
                                <AlertCircle size={24} color="white" />
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Application Under Review</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>The project leader is currently evaluating your skills. You'll be notified of the decision here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ProjectDetail;
