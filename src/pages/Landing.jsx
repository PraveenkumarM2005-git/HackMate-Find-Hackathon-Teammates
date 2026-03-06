import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, MessageSquare, Target, Github } from 'lucide-react';

const Landing = () => {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section style={{
                padding: '8rem 2rem',
                textAlign: 'center',
                background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)'
            }}>
                <div className="badge" style={{ marginBottom: '1.5rem' }}>Now in Beta</div>
                <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    Build your dream team <br />
                    <span className="premium-gradient-text">faster than ever.</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                    HackMate uses smart matching to connect you with developers who have exactly the skills your project needs.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/explore" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        Find a Team
                    </Link>
                    <Link to="/create" className="btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        Post a Project
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container" style={{ paddingBottom: '8rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    <div className="glass-card">
                        <div className="premium-gradient" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', marginBottom: '1.5rem' }}>
                            <Zap size={20} color="white" />
                        </div>
                        <h3>Smart Matching</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Our algorithm calculates match scores based on your skills and project requirements.</p>
                    </div>

                    <div className="glass-card">
                        <div className="premium-gradient" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', marginBottom: '1.5rem' }}>
                            <MessageSquare size={20} color="white" />
                        </div>
                        <h3>Real-time Chat</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Once you're accepted into a team, jump straight into a private project chat.</p>
                    </div>

                    <div className="glass-card">
                        <div className="premium-gradient" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', marginBottom: '1.5rem' }}>
                            <Users size={20} color="white" />
                        </div>
                        <h3>Manage Requests</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Review join requests with skill match percentages and accept the best fit.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
