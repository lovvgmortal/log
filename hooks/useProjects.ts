import React, { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Project, Folder } from '../types';
import { Session } from '@supabase/supabase-js';

export const useProjects = (session: Session | null) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        if (!session) return;

        try {
            const [projRes, foldRes] = await Promise.all([
                supabase.from('projects').select('*').eq('user_id', session.user.id).order('updated_at', { ascending: false }),
                supabase.from('folders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true }),
            ]);

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
        } catch (e) {
            console.error("Error loading projects:", e);
        }
    }, [session]);

    const handleUpdateProject = useCallback(async (updatedProject: Project) => {
        // Optimistic update
        setProjects(prev => {
            const exists = prev.find(p => p.id === updatedProject.id);
            if (exists) return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
            return [updatedProject, ...prev];
        });

        if (!session) return;

        // DB sync
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
    }, [session]);

    const createNewProject = useCallback(async (folderId?: string) => {
        if (!session) return null;

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
                scoringTemplates: []
            }
        };

        await handleUpdateProject(newProject);
        setActiveProjectId(newProject.id);
        return newProject.id;
    }, [session, handleUpdateProject]);

    const handleDeleteProject = useCallback(async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) setActiveProjectId(null);
        if (!session) return;
        await supabase.from('projects').delete().eq('id', id).eq('user_id', session.user.id);
    }, [session, activeProjectId]);

    const handleRenameProject = useCallback(async (id: string, newName: string) => {
        const project = projects.find(p => p.id === id);
        if (!project) return;
        const updated = { ...project, name: newName };
        await handleUpdateProject(updated);
    }, [projects, handleUpdateProject]);

    const handleMoveProject = useCallback(async (projectId: string, folderId?: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const updated = { ...project, folderId: folderId };
        await handleUpdateProject(updated);
    }, [projects, handleUpdateProject]);

    const handleCreateFolder = useCallback(async (name: string) => {
        if (!session) return;
        const newFolderId = `folder-${Date.now()}`;
        setFolders(prev => [...prev, { id: newFolderId, name }]);
        await supabase.from('folders').insert({ id: newFolderId, user_id: session.user.id, name: name });
    }, [session]);

    return {
        projects,
        folders,
        activeProjectId,
        setActiveProjectId,
        loadProjects,
        handleUpdateProject,
        createNewProject,
        handleDeleteProject,
        handleRenameProject,
        handleMoveProject,
        handleCreateFolder,
    };
};
