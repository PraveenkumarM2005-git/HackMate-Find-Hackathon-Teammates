import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Github, LogOut, LayoutDashboard, PlusCircle, Search, User, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('Error logging in:', error.message);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav style={{
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="premium-gradient flex-center" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                    <Zap size={20} color="white" fill="white" />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.025em' }}>
                    Hack<span className="premium-gradient-text">Mate</span>
                </h1>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/explore" style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Explore</Link>

                {user ? (
                    <>
                        <Link to="/create" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            <PlusCircle size={18} />
                            Post Idea
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to="/profile">
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--primary)' }}
                                />
                            </Link>
                            <button onClick={handleLogout} style={{ color: 'var(--text-muted)' }}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <button onClick={handleLogin} className="btn-primary">
                        <Github size={18} />
                        Login with GitHub
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
