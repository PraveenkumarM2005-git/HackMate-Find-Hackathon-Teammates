import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Github, LogOut, LayoutDashboard, PlusCircle, Search, User, Zap, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
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

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                queryParams: {
                    prompt: 'consent',
                },
            },
        });
        if (error) console.error('Error logging in:', error.message);
    };


    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav style={{
            padding: '1rem',
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
                <div className="premium-gradient flex-center" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                    <Zap size={18} color="white" fill="white" />
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.025em', margin: 0 }}>
                    Hack<span className="premium-gradient-text">Mate</span>
                </h1>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={toggleTheme} style={{ color: 'var(--text-muted)' }} title="Toggle Theme">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link to="/explore" className="hide-mobile" style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.9rem' }}>Explore</Link>

                {user ? (
                    <>
                        <Link to="/create" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                            <PlusCircle size={16} />
                            <span className="hide-mobile">Post Idea</span>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Link to="/profile">
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid var(--primary)' }}
                                />
                            </Link>
                            <button onClick={handleLogout} style={{ color: 'var(--text-muted)' }}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <button onClick={handleLogin} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto' }}>
                        <Github size={16} />
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
