import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NotificationsListener() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        getSession();

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        let myProjectIds = [];
        let myJoinedProjectIds = [];
        const myProjectsMap = {};
        const joinedProjectsMap = {};

        const setupListener = async () => {
            // Fetch projects I lead
            const { data: myProjects } = await supabase
                .from('projects')
                .select('id, title')
                .eq('creator_id', user.id);

            myProjects?.forEach(p => {
                myProjectIds.push(p.id);
                myProjectsMap[p.id] = p.title;
            });

            // Fetch projects I joined
            const { data: joinedProjects } = await supabase
                .from('join_requests')
                .select('project_id, projects(title)')
                .eq('user_id', user.id)
                .eq('status', 'accepted');

            joinedProjects?.forEach(r => {
                myJoinedProjectIds.push(r.project_id);
                joinedProjectsMap[r.project_id] = r.projects?.title;
            });

            const channel = supabase.channel('global-notifications-' + user.id)
                // Listen to new join requests
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'join_requests' }, async (payload) => {
                    if (myProjectIds.includes(payload.new.project_id)) {
                        // New request for my project!
                        const { data: profile } = await supabase.from('profiles').select('name').eq('id', payload.new.user_id).single();
                        const projectName = myProjectsMap[payload.new.project_id];

                        toast(
                            <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/project/${payload.new.project_id}`)}>
                                <div style={{ fontWeight: 'bold' }}>New Application!</div>
                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{profile?.name || 'Someone'} applied to {projectName}.</div>
                            </div>,
                            {
                                icon: '👋',
                                style: { borderRadius: '10px', background: '#0f172a', color: '#fff', border: '1px solid var(--primary)' },
                            }
                        );
                    }
                })
                // Listen to accepted requests
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'join_requests', filter: `user_id=eq.${user.id}` }, async (payload) => {
                    if (payload.new.status === 'accepted' && payload.old.status !== 'accepted') {
                        const { data: project } = await supabase.from('projects').select('title').eq('id', payload.new.project_id).single();
                        toast.success(
                            <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/chat/${payload.new.project_id}`)}>
                                <div style={{ fontWeight: 'bold' }}>Application Accepted!</div>
                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>You are now in {project?.title || 'the project'}!</div>
                            </div>,
                            {
                                style: { borderRadius: '10px', background: '#0f172a', color: '#fff', border: '1px solid var(--success)' },
                            }
                        );
                        // Update my joined projects dynamically
                        if (!myJoinedProjectIds.includes(payload.new.project_id)) {
                            myJoinedProjectIds.push(payload.new.project_id);
                            joinedProjectsMap[payload.new.project_id] = project?.title;
                        }
                    }
                })
                // Listen to group messages
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                    const { project_id, sender_id, content } = payload.new;

                    if (sender_id === user.id) return; // Don't notify if we sent it

                    if (myProjectIds.includes(project_id) || myJoinedProjectIds.includes(project_id)) {
                        // Don't toast if we are currently looking at this chat
                        if (location.pathname === `/chat/${project_id}`) return;

                        const projectName = myProjectsMap[project_id] || joinedProjectsMap[project_id] || 'Team HQ';
                        const { data: profile } = await supabase.from('profiles').select('name').eq('id', sender_id).single();

                        toast(
                            <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/chat/${project_id}`)}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>{projectName}</div>
                                <div style={{ fontSize: '0.9rem', color: '#f8fafc' }}>
                                    <span style={{ color: '#94a3b8' }}>{profile?.name || 'Member'}:</span> {content.length > 30 ? content.slice(0, 30) + '...' : content}
                                </div>
                            </div>,
                            {
                                icon: '💬',
                                style: { borderRadius: '10px', background: '#0f172a', color: '#fff', border: '1px solid var(--glass-border)' },
                                duration: 5000
                            }
                        );
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        const cleanup = setupListener();
        return () => { cleanup.then(f => f && f()); };
    }, [user, location.pathname, navigate]);

    return null;
}
