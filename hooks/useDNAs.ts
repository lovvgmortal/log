import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ScriptDNA } from '../types';
import { Session } from '@supabase/supabase-js';

export const useDNAs = (session: Session | null) => {
    const [dnas, setDnas] = useState<ScriptDNA[]>([]);

    const loadDNAs = useCallback(async () => {
        if (!session) return;

        try {
            const { data } = await supabase
                .from('dnas')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setDnas(data.map((d: any) => ({
                    id: d.id,
                    name: d.name,
                    source_urls: d.source_urls,
                    user_notes: d.user_notes,
                    analysis: d.analysis,
                    raw_transcript_summary: d.raw_transcript_summary
                })));
            }
        } catch (e) {
            console.error("Error loading DNAs:", e);
        }
    }, [session]);

    const handleSaveDNA = useCallback(async (dna: ScriptDNA) => {
        if (!session) return;
        setDnas(prev => [dna, ...prev]);
        await supabase.from('dnas').insert({
            id: dna.id,
            user_id: session.user.id,
            name: dna.name,
            source_urls: dna.source_urls,
            user_notes: dna.user_notes,
            analysis: dna.analysis,
            raw_transcript_summary: dna.raw_transcript_summary
        });
    }, [session]);

    const handleUpdateDNA = useCallback(async (dna: ScriptDNA) => {
        if (!session) return;
        setDnas(prev => prev.map(d => d.id === dna.id ? dna : d));
        await supabase.from('dnas').upsert({
            id: dna.id,
            user_id: session.user.id,
            name: dna.name,
            source_urls: dna.source_urls,
            user_notes: dna.user_notes,
            analysis: dna.analysis,
            raw_transcript_summary: dna.raw_transcript_summary
        });
    }, [session]);

    const handleDeleteDNA = useCallback(async (id: string) => {
        if (!session) return;
        setDnas(prev => prev.filter(d => d.id !== id));
        await supabase.from('dnas').delete().eq('id', id).eq('user_id', session.user.id);
    }, [session]);

    return {
        dnas,
        loadDNAs,
        handleSaveDNA,
        handleUpdateDNA,
        handleDeleteDNA,
    };
};
