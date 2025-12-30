
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Project, Folder, Note, ScriptDNA, RoutePath, UserSettings, ScoringTemplate } from './types';
import { Sidebar } from './components/Layout/Sidebar';
import { Footer } from './components/Layout/Footer';
import { LandingView, LandingNavbar } from './components/Landing/LandingView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { CreationDashboard } from './components/Creation/CreationDashboard';
import { NotesView } from './components/Notes/NotesView';
import { PricingView } from './components/Pricing/PricingView';
import { DNAView } from './components/DNA/DNAView';
import { SpinnerIcon } from './components/Icons';

export default function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [currentRoute, setCurrentRoute] = useState<RoutePath>('/home/dashboard');

    // Data States
    const [projects, setProjects] = useState<Project[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [dnas, setDnas] = useState<ScriptDNA[]>([]);
    // NEW: Global Scoring Templates
    const [scoringTemplates, setScoringTemplates] = useState<ScoringTemplate[]>([]);

    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    // Settings State
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

    // --- AUTH & DATA INITIALIZATION ---
    useEffect(() => {
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setSession(session);
                if (session) {
                    loadUserData(session.user.id);
                } else {
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.warn("Session check failed", err);
                setLoading(false);
            });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
            setSession(nextSession);
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                if (nextSession) {
                    loadUserData(nextSession.user.id, true);
                }
            } else if (event === 'SIGNED_OUT') {
                setProjects([]);
                setFolders([]);
                setNotes([]);
                setDnas([]);
                setScoringTemplates([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Realtime subscription for DNAs
    useEffect(() => {
        if (!session) return;

        const channel = supabase
            .channel('dna_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'dnas',
                    filter: `user_id=eq.${session.user.id}`
                },
                async () => {
                    // Reload DNAs when any change occurs
                    const { data: dnasData } = await supabase
                        .from('dnas')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false });

                    if (dnasData) {
                        setDnas(dnasData.map((d: any) => ({
                            id: d.id,
                            name: d.name,
                            source_urls: d.source_urls,
                            analysis: d.analysis,
                            raw_transcript_summary: d.raw_transcript_summary
                        })));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user.id]);

    // Realtime subscription for Projects
    useEffect(() => {
        if (!session) return;

        const channel = supabase
            .channel('project_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'projects',
                    filter: `user_id=eq.${session.user.id}`
                },
                async () => {
                    // Reload projects when any change occurs
                    const { data: projectsData } = await supabase
                        .from('projects')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('updated_at', { ascending: false });

                    if (projectsData) {
                        setProjects(projectsData.map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            updatedAt: p.updated_at,
                            folderId: p.folder_id,
                            data: p.data
                        })));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user.id]);

    const loadUserData = async (userId: string, silent: boolean = false) => {
        if (!silent) setLoading(true);
        try {
            // 1. Load Settings
            const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
            setUserSettings(settings || { openrouter_key: '', youtube_key: '' });

            // 2. Load Core Data in Parallel (Added scoring_templates)
            const [projRes, foldRes, noteRes, dnaRes, scoreRes] = await Promise.all([
                supabase.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
                supabase.from('folders').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
                supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
                supabase.from('dnas').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('scoring_templates').select('*').eq('user_id', userId).order('created_at', { ascending: false })
            ]);

            // Map Database Columns (snake_case) to App Types (camelCase)
            if (projRes.data) {
                setProjects(projRes.data.map((p: any) => ({
                    id: p.id,
                    folderId: p.folder_id,
                    name: p.name,
                    updatedAt: p.updated_at,
                    data: p.data
                })));
            }

            if (foldRes.data) {
                setFolders(foldRes.data.map((f: any) => ({
                    id: f.id,
                    name: f.name
                })));
            }

            if (noteRes.data) {
                setNotes(noteRes.data.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    content: n.content,
                    color: n.color,
                    updatedAt: n.updated_at
                })));
            }

            if (dnaRes.data) {
                setDnas(dnaRes.data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    source_urls: d.source_urls,
                    analysis: d.analysis,
                    raw_transcript_summary: d.raw_transcript_summary
                })));
            }

            if (scoreRes.data) {
                setScoringTemplates(scoreRes.data.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    criteria: s.criteria
                })));
            }

        } catch (e) {
            console.error("Error loading user data:", e);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleEmailAuth = async (email: string, pass: string, isSignUp: boolean) => {
        setAuthLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password: pass });
                if (error) throw error;
                alert("Đăng ký thành công! Hãy kiểm tra email xác thực hoặc đăng nhập.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
                if (error) throw error;
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); };

    // --- PROJECT HANDLERS (Supabase) ---

    const handleUpdateProject = async (updatedProject: Project) => {
        // Optimistic Update
        setProjects(prev => {
            const exists = prev.find(p => p.id === updatedProject.id);
            if (exists) return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
            return [updatedProject, ...prev];
        });

        if (!session) return;

        // DB Sync
        const { error } = await supabase.from('projects').upsert({
            id: updatedProject.id,
            user_id: session.user.id,
            folder_id: updatedProject.folderId || null,
            name: updatedProject.name,
            updated_at: updatedProject.updatedAt,
            data: updatedProject.data
        });
        if (error) {
            console.error("Update project error:", JSON.stringify(error, null, 2));
        }
    };

    const createNewProject = async (folderId?: string) => {
        if (!session) return;
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name: 'Untitled Project',
            updatedAt: Date.now(),
            folderId: folderId,
            data: {
                mode: null,
                language: 'English',
                userDraft: { id: 'draft', title: '', description: '', script: '', uniquePoints: '' },
                virals: [],
                flops: [],
                targetWordCount: '',
                blueprint: null,
                result: null,
                step: 'input',
                availableDNAs: [],
                scoringTemplates: [] // Legacy field kept empty
            }
        };

        await handleUpdateProject(newProject);
        setActiveProjectId(newProject.id);
        navigate('/home/creating');
    };

    const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) setActiveProjectId(null);
        if (!session) return;
        await supabase.from('projects').delete().eq('id', id).eq('user_id', session.user.id);
    };

    const handleRenameProject = async (id: string, newName: string) => {
        const project = projects.find(p => p.id === id);
        if (!project) return;
        const updated = { ...project, name: newName };
        await handleUpdateProject(updated);
    };

    const handleMoveProject = async (projectId: string, folderId?: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const updated = { ...project, folderId: folderId };
        await handleUpdateProject(updated);
    };

    const handleCreateFolder = async (name: string) => {
        if (!session) return;
        const newFolderId = `folder-${Date.now()}`;
        setFolders(prev => [...prev, { id: newFolderId, name }]);
        await supabase.from('folders').insert({ id: newFolderId, user_id: session.user.id, name: name });
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!session) return;

        // Remove from local state first for better UX
        setFolders(prev => prev.filter(f => f.id !== folderId));

        // Move all projects in this folder to root (set folderId to undefined)
        setProjects(prev => prev.map(p => p.folderId === folderId ? { ...p, folderId: undefined } : p));

        // Delete folder from database
        await supabase.from('folders').delete().eq('id', folderId).eq('user_id', session.user.id);

        // Update projects in database to move them to root
        await supabase.from('projects').update({ folderId: null }).eq('folderId', folderId).eq('user_id', session.user.id);
    };

    // --- NOTE HANDLERS ---
    const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
        const note = notes.find(n => n.id === id);
        if (!note || !session) return;
        const updatedNote = { ...note, ...updates, updatedAt: Date.now() };
        setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
        await supabase.from('notes').upsert({ id: updatedNote.id, user_id: session.user.id, title: updatedNote.title, content: updatedNote.content, color: updatedNote.color, updated_at: updatedNote.updatedAt });
    };
    const handleCreateNote = async () => {
        if (!session) return;
        const newNote: Note = { id: `note-${Date.now()}`, title: '', content: '', updatedAt: Date.now(), color: 'yellow' };
        setNotes(prev => [newNote, ...prev]);
        await supabase.from('notes').insert({ id: newNote.id, user_id: session.user.id, title: '', content: '', color: 'yellow', updated_at: newNote.updatedAt });
    };
    const handleDeleteNote = async (id: string) => {
        if (!session) return;
        setNotes(prev => prev.filter(n => n.id !== id));
        await supabase.from('notes').delete().eq('id', id).eq('user_id', session.user.id);
    };

    // --- DNA HANDLERS ---
    const handleSaveDNA = async (dna: ScriptDNA) => {
        if (!session) {
            console.error('No session when trying to save DNA');
            alert('Bạn cần đăng nhập để lưu DNA');
            return;
        }

        console.log('=== SAVING DNA ===');
        console.log('DNA ID:', dna.id);
        console.log('DNA Name:', dna.name);
        console.log('User ID:', session.user.id);
        console.log('DNA Data:', dna);

        // Optimistic update
        setDnas(prev => {
            const exists = prev.find(d => d.id === dna.id);
            if (exists) {
                console.log('DNA exists, updating...');
                return prev.map(d => d.id === dna.id ? dna : d);
            }
            console.log('DNA is new, adding...');
            return [dna, ...prev];
        });

        try {
            const payload = {
                id: dna.id,
                user_id: session.user.id,
                name: dna.name,
                source_urls: dna.source_urls || [],
                analysis: dna.analysis || {},
                raw_transcript_summary: dna.raw_transcript_summary || null
            };

            console.log('Payload to Supabase:', payload);

            const { data, error } = await supabase
                .from('dnas')
                .upsert(payload)
                .select();

            if (error) {
                console.error('=== DATABASE ERROR ===');
                console.error('Error Code:', error.code);
                console.error('Error Message:', error.message);
                console.error('Error Details:', error.details);
                console.error('Error Hint:', error.hint);
                alert(`LỖI LƯU DNA:\n${error.message}\n\nChi tiết: ${error.details || 'Không có'}\n\nGợi ý: ${error.hint || 'Kiểm tra RLS policies'}`);

                // Revert optimistic update
                setDnas(prev => prev.filter(d => d.id !== dna.id));
            } else {
                console.log('=== SUCCESS ===');
                console.log('Saved DNA:', data);
            }
        } catch (err: any) {
            console.error('=== EXCEPTION ===');
            console.error('Exception:', err);
            alert(`Lỗi không xác định: ${err.message}`);
            setDnas(prev => prev.filter(d => d.id !== dna.id));
        }
    };
    const handleUpdateDNA = async (dna: ScriptDNA) => {
        if (!session) return;
        setDnas(prev => prev.map(d => d.id === dna.id ? dna : d));
        await supabase.from('dnas').upsert({ id: dna.id, user_id: session.user.id, name: dna.name, source_urls: dna.source_urls, analysis: dna.analysis, raw_transcript_summary: dna.raw_transcript_summary });
    };
    const handleDeleteDNA = async (id: string) => {
        if (!session) return;
        setDnas(prev => prev.filter(d => d.id !== id));
        await supabase.from('dnas').delete().eq('id', id).eq('user_id', session.user.id);
    };

    // --- NEW: GLOBAL SCORING TEMPLATE HANDLERS ---
    const handleSaveTemplate = async (template: ScoringTemplate) => {
        if (!session) return;
        // Optimistic check: Update if exists, Add if new
        const exists = scoringTemplates.some(t => t.id === template.id);

        if (exists) {
            setScoringTemplates(prev => prev.map(t => t.id === template.id ? template : t));
        } else {
            setScoringTemplates(prev => [template, ...prev]);
        }

        await supabase.from('scoring_templates').upsert({
            id: template.id,
            user_id: session.user.id,
            name: template.name,
            criteria: template.criteria
        });
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!session) return;
        setScoringTemplates(prev => prev.filter(t => t.id !== id));
        await supabase.from('scoring_templates').delete().eq('id', id).eq('user_id', session.user.id);
    };

    const navigate = (path: RoutePath) => { setCurrentRoute(path); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    // --- RENDERING ---
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white"><SpinnerIcon className="w-8 h-8 animate-spin text-zinc-500" /></div>;

    if (!session) {
        return (
            <div className="min-h-screen flex flex-col bg-black">
                <LandingNavbar onNavigate={() => { }} />
                <main className="flex-grow pt-24 pb-20">
                    <LandingView
                        onNavigate={() => { }}
                        onAuth={handleEmailAuth}
                        authLoading={authLoading}
                    />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-black text-white">
            <Sidebar
                currentRoute={currentRoute}
                onNavigate={navigate}
                onLogout={handleLogout}
                userEmail={session.user.email}
                openRouterKey={userSettings?.openrouter_key}
            />
            <main className="flex-1 md:ml-64 p-4 md:p-6 overflow-y-auto min-h-screen">
                <div className="w-full max-w-[98%] mx-auto mt-16 md:mt-0">
                    {currentRoute === '/home/dashboard' && (
                        <DashboardView projects={projects} folders={folders} dnas={dnas} onOpenProject={(id) => { setActiveProjectId(id); navigate('/home/creating'); }} onNewProject={createNewProject} onDeleteProject={handleDeleteProject} onRenameProject={handleRenameProject} onCreateFolder={handleCreateFolder} onDeleteFolder={handleDeleteFolder} onMoveProject={handleMoveProject} />
                    )}
                    {currentRoute === '/home/creating' && (
                        <CreationDashboard
                            key={activeProjectId || 'new-creation'}
                            project={projects.find(p => p.id === activeProjectId)}
                            onUpdateProject={handleUpdateProject}
                            globalDNAs={dnas}
                            // PASSING GLOBAL TEMPLATES
                            globalScoringTemplates={scoringTemplates}
                            onSaveGlobalTemplate={handleSaveTemplate}
                            onDeleteGlobalTemplate={handleDeleteTemplate}
                            userSettings={userSettings}
                        />
                    )}
                    {currentRoute === '/home/dna' && (
                        <DNAView savedDNAs={dnas} onSaveDNA={handleSaveDNA} onDeleteDNA={handleDeleteDNA} onUpdateDNA={handleUpdateDNA} userSettings={userSettings} />
                    )}
                    {currentRoute === '/home/notes' && (
                        <NotesView notes={notes} onCreate={handleCreateNote} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} />
                    )}
                    {currentRoute === '/home/pricing' && (
                        <PricingView />
                    )}
                </div>
                <Footer simple />
            </main>
        </div>
    );
}
