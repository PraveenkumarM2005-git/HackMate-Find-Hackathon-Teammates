import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';

const Chat = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [project, setProject] = useState(null);
    const [user, setUser] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        const setup = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return navigate('/');
            setUser(session.user);
            await fetchProjectAndMessages(session.user);
        };
        setup();

        const channel = supabase
            .channel(`project:${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `project_id=eq.${id}`
            }, (payload) => {
                fetchNewMessage(payload.new);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchProjectAndMessages = async (currentUser) => {
        const { data: projectData } = await supabase
            .from('projects')
            .select('title, creator_id')
            .eq('id', id)
            .single();

        const { data: requestData } = await supabase
            .from('join_requests')
            .select('status')
            .eq('project_id', id)
            .eq('user_id', currentUser.id)
            .eq('status', 'accepted');

        if (projectData.creator_id !== currentUser.id && (!requestData || requestData.length === 0)) {
            navigate(`/project/${id}`);
            return;
        }

        setProject(projectData);

        // Fetch current user's profile for optimistic messages
        const { data: myProfile } = await supabase
            .from('profiles')
            .select('id, name, github_url')
            .eq('id', currentUser.id)
            .single();
        if (myProfile) {
            userProfileRef.current = myProfile;
        }

        // Fetch messages without FK join to avoid 400 errors
        const { data: msgs, error } = await supabase
            .from('messages')
            .select('*')
            .eq('project_id', id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
            return;
        }

        if (msgs && msgs.length > 0) {
            // Get unique sender IDs and fetch their profiles separately
            const senderIds = [...new Set(msgs.map(m => m.sender_id))];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, name, github_url')
                .in('id', senderIds);

            const profileMap = {};
            (profiles || []).forEach(p => { profileMap[p.id] = p; });

            const enrichedMsgs = msgs.map(m => ({
                ...m,
                profiles: profileMap[m.sender_id] || { name: 'Unknown' }
            }));
            setMessages(enrichedMsgs);
        } else {
            setMessages([]);
        }
    };
    const userProfileRef = useRef(null);

    const fetchNewMessage = async (msg) => {
        // Skip if we already have this message (from optimistic update)
        setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return prev;
        });

        // Check if message already exists before adding
        const alreadyExists = messages.some(m => m.id === msg.id);
        if (alreadyExists) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, github_url')
            .eq('id', msg.sender_id)
            .single();

        setMessages(prev => {
            // Double-check to prevent race conditions
            if (prev.some(m => m.id === msg.id)) return prev;
            // Also remove any optimistic message that matches
            const filtered = prev.filter(m => !(m._optimistic && m.content === msg.content && m.sender_id === msg.sender_id));
            return [...filtered, { ...msg, profiles: profile || { name: 'Unknown' } }];
        });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage;
        setNewMessage('');

        // Optimistically add message to UI immediately
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            project_id: id,
            sender_id: user.id,
            content: messageContent,
            created_at: new Date().toISOString(),
            profiles: userProfileRef.current || { name: 'You' },
            _optimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);

        const { data, error } = await supabase
            .from('messages')
            .insert({
                project_id: id,
                sender_id: user.id,
                content: messageContent
            })
            .select()
            .single();

        if (error) {
            alert(error.message);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        } else if (data) {
            // Replace optimistic message with real one
            setMessages(prev => prev.map(m =>
                m.id === optimisticMsg.id ? { ...data, profiles: optimisticMsg.profiles } : m
            ));
        }
    };

    if (!project) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="premium-gradient animate-float" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Connecting to Team Secure Channel...</p>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', paddingTop: '2rem', paddingBottom: '2rem' }}>
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, borderColor: 'var(--primary)' }}>
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <button onClick={() => navigate(`/project/${id}`)} className="btn-outline" style={{ padding: '0.5rem', borderRadius: '0.75rem' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{project.title} <span className="premium-gradient-text">HQ</span></h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Channel Active</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '-0.5rem' }}>
                        {/* We could show team avatars here */}
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.03) 0%, transparent 70%)' }}>
                    {messages.length === 0 && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5 }}>
                            <MessageSquare size={48} style={{ marginBottom: '1rem' }} />
                            <p>No transmissions yet.<br />Break the ice!</p>
                        </div>
                    )}
                    {messages.map((msg, i) => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div
                                key={msg.id || i}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '75%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.4rem',
                                    flexDirection: isMe ? 'row-reverse' : 'row'
                                }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isMe ? 'var(--primary)' : 'var(--text-muted)' }}>
                                        {msg.profiles?.name}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                                        {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div style={{
                                    padding: '1rem 1.5rem',
                                    borderRadius: '1.25rem',
                                    background: isMe ? 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.05)',
                                    border: isMe ? 'none' : '1px solid var(--glass-border)',
                                    color: 'white',
                                    boxShadow: isMe ? '0 10px 20px -10px var(--primary-glow)' : 'none',
                                    borderBottomRightRadius: isMe ? '0.25rem' : '1.25rem',
                                    borderBottomLeftRadius: isMe ? '1.25rem' : '0.25rem',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)' }}>
                    <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Type a message to the team..."
                            style={{ height: '3.5rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--glass-border)' }}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" style={{ height: '3.5rem', width: '3.5rem', padding: 0, justifyContent: 'center', borderRadius: '1rem' }}>
                            <Send size={22} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
