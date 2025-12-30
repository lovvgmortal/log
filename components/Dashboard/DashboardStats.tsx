import React from 'react';
import { Project, ScriptDNA } from '../../types';
import { BarChartIcon, DnaIcon, CheckIcon, SparklesIcon } from '../Icons';

interface DashboardStatsProps {
    projects: Project[];
    dnas: ScriptDNA[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ projects, dnas }) => {
    // Calculate stats
    const totalProjects = projects.length;
    const totalDNAs = dnas.length;

    // Calculate success rate (projects with results)
    const completedProjects = projects.filter(p => p.data.result !== null).length;
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    // Calculate average score
    const projectsWithScores = projects.filter(p => p.data.lastScore);
    const avgScore = projectsWithScores.length > 0
        ? Math.round(projectsWithScores.reduce((sum, p) => sum + (p.data.lastScore?.total_score || 0), 0) / projectsWithScores.length)
        : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <BarChartIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{totalProjects}</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">Total Projects</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <DnaIcon className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{totalDNAs}</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">DNA Templates</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{successRate}%</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">Success Rate</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{avgScore}/100</span>
                </div>
                <p className="text-xs text-zinc-500 font-medium">Avg. Score</p>
            </div>
        </div>
    );
};
