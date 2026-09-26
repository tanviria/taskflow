import React, { useState, useEffect } from 'react';
import { X, FolderPlus, FolderEdit } from 'lucide-react';
import { Project } from '../types/todo';
import { sounds } from '../utils/audio';

interface ProjectModalProps {
  project?: Project | null;
  onSaveProject: (project: Project) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#4f46e5', // indigo
  '#059669', // emerald
  '#7c3aed', // violet
  '#d97706', // amber
  '#dc2626', // red
  '#0284c7', // sky
  '#db2777', // pink
  '#475569', // slate
];

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onSaveProject, onClose }) => {
  const isEditing = Boolean(project);
  const [name, setName] = useState(project?.name || '');
  const [color, setColor] = useState(project?.color || PRESET_COLORS[0]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color);
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sounds.playClick();
    const updatedProject: Project = {
      id: project ? project.id : `project-${Date.now()}`,
      name: name.trim(),
      color,
    };

    onSaveProject(updatedProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <FolderEdit className="w-4 h-4 text-slate-700" />
            ) : (
              <FolderPlus className="w-4 h-4 text-slate-700" />
            )}
            <h2 className="text-sm font-semibold text-slate-900">
              {isEditing ? 'Edit Project' : 'New Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile App Redesign"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Color Accent
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-110 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

