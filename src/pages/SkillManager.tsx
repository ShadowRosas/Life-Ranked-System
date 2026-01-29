// ==========================================
// SKILL MANAGER PAGE (UPDATED)
// ==========================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Plus, Trash2 } from 'lucide-react';
import { SkillTemplate } from '../types';
import { RANK_CONFIGS } from '../lib/rankSystem';
import './SkillManager.css';

// SKILL_AREAS removed - now uses state.areas

const PREDEFINED_TEMPLATES: SkillTemplate[] = [
    { name: 'Coding', icon: '💻', color: '#3b82f6', area: 'Programación' },
    { name: 'Fitness', icon: '💪', color: '#ef4444', area: 'Salud' },
    { name: 'Reading', icon: '📚', color: '#eab308', area: 'Estudio' },
    { name: 'Writing', icon: '✍️', color: '#a855f7', area: 'Arte' },
    { name: 'Language', icon: '🗣️', color: '#22c55e', area: 'Estudio' },
    { name: 'Music', icon: '🎸', color: '#f97316', area: 'Arte' },
];

export function SkillManager() {
    const { state, addSkill, deleteSkill, addArea, deleteArea } = useGame();
    const navigate = useNavigate();

    const [customName, setCustomName] = useState('');
    const [customIcon, setCustomIcon] = useState('⚡');
    const [customColor, setCustomColor] = useState('#ff4655');
    const [customArea, setCustomArea] = useState(state.areas?.[0] || 'Otros');
    const [newAreaName, setNewAreaName] = useState('');
    const [initialRank, setInitialRank] = useState('iron');

    const handleAddTemplate = (template: SkillTemplate) => {
        addSkill(template.name, template.icon, template.color, initialRank, template.area);
        navigate('/');
    };

    const handleAddCustom = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customName.trim()) return;
        addSkill(customName, customIcon, customColor, initialRank, customArea);
        navigate('/');
    };

    const handleAddArea = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAreaName.trim()) return;
        addArea(newAreaName.trim());
        setNewAreaName('');
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}? All ranked progress will be lost forever.`)) {
            deleteSkill(id);
        }
    };

    return (
        <div className="skill-manager page">
            <div className="container">
                <h1 className="mb-xl">MANAGE SKILLS</h1>

                <div className="skill-manager__grid">
                    <div className="skill-manager__section">
                        <h2>ADD NEW SKILL</h2>

                        <div className="form-group mb-lg">
                            <label>Starting Rank (Placement)</label>
                            <select
                                value={initialRank}
                                onChange={(e) => setInitialRank(e.target.value)}
                                className="rank-selector"
                            >
                                {RANK_CONFIGS.map(config => (
                                    <option key={config.rank} value={config.rank}>
                                        {config.nameEs}
                                    </option>
                                ))}
                            </select>
                            <p className="text-muted text-sm mt-sm">
                                Select your estimated skill level. Be honest.
                            </p>
                        </div>

                        <div className="templates-grid">
                            {PREDEFINED_TEMPLATES.map(template => (
                                <button
                                    key={template.name}
                                    className="template-card"
                                    onClick={() => handleAddTemplate(template)}
                                    style={{ '--color': template.color } as React.CSSProperties}
                                >
                                    <span className="template-card__icon">{template.icon}</span>
                                    <span className="template-card__name">{template.name}</span>
                                    <div className="template-card__add">
                                        <Plus size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="custom-skill-form">
                            <h3>Custom Skill</h3>
                            <form onSubmit={handleAddCustom}>
                                <div className="form-group mb-sm">
                                    <label>Area (Category)</label>
                                    <select
                                        value={customArea}
                                        onChange={(e) => setCustomArea(e.target.value)}
                                        className="rank-selector" // reuse style
                                    >
                                        {(state.areas || []).map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Skill Name</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="e.g. Meditation"
                                        maxLength={20}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Icon</label>
                                        <input
                                            type="text"
                                            value={customIcon}
                                            onChange={(e) => setCustomIcon(e.target.value)}
                                            maxLength={2}
                                            className="text-center"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Color</label>
                                        <input
                                            type="color"
                                            value={customColor}
                                            onChange={(e) => setCustomColor(e.target.value)}
                                            className="color-input"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={!customName.trim()}
                                >
                                    Create Custom Skill
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="skill-manager__section">
                        <h2>MANAGE AREAS</h2>
                        <div className="custom-skill-form mb-lg">
                            <form onSubmit={handleAddArea} className="form-row">
                                <input
                                    type="text"
                                    value={newAreaName}
                                    onChange={(e) => setNewAreaName(e.target.value)}
                                    placeholder="New Area Name"
                                    className="flex-1"
                                />
                                <button type="submit" className="btn btn-primary" disabled={!newAreaName.trim()}>
                                    <Plus size={18} />
                                </button>
                            </form>
                        </div>

                        <div className="active-skills-list">
                            {(state.areas || []).map(area => (
                                <div key={area} className="manage-skill-item">
                                    <div className="manage-skill-item__info">
                                        <span className="manage-skill-item__name">{area}</span>
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-icon btn-danger-hover"
                                        onClick={() => deleteArea(area)}
                                        disabled={(state.areas || []).length <= 1} // Keep at least one area
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <h2 className="mt-xl">ACTIVE SKILLS</h2>
                        {state.skills.length === 0 ? (
                            <p className="text-muted">No active skills.</p>
                        ) : (
                            <div className="active-skills-list">
                                {state.skills.map(skill => (
                                    <div key={skill.id} className="manage-skill-item">
                                        <div className="manage-skill-item__icon">{skill.icon}</div>
                                        <div className="manage-skill-item__info">
                                            <span className="manage-skill-item__name">{skill.name}</span>
                                            <span className="manage-skill-item__rank">{skill.rank} {skill.division}</span>
                                        </div>
                                        <button
                                            className="btn btn-secondary btn-icon btn-danger-hover"
                                            onClick={() => handleDelete(skill.id, skill.name)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
