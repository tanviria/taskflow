import React from 'react';
import { Plus, Volume2, VolumeX, Download, CheckSquare, Menu, X, Keyboard } from 'lucide-react';
import { ViewType } from '../types/todo';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  onOpenNewTaskModal: () => void;
  onOpenExportModal: () => void;
  onOpenShortcutsModal: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onOpenNewTaskModal,
  onOpenExportModal,
  onOpenShortcutsModal,
  isMuted,
  onToggleSound,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const navItems: { view: ViewType; label: string }[] = [
    { view: 'today', label: 'Today' },
    { view: 'upcoming', label: 'Upcoming' },
    { view: 'inbox', label: 'Inbox' },
    { view: 'all', label: 'All Tasks' },
    { view: 'focus', label: 'Focus Timer' },
    { view: 'insights', label: 'Insights' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      {/* Zone 1: Mobile Menu Toggle + Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onSelectView('today');
          }}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-sm cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-sm shadow-xs">
            <CheckSquare className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Taskflow</span>
        </button>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-1 sm:gap-4 lg:gap-6 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => {
                sounds.playClick();
                onSelectView(item.view);
              }}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-slate-900 font-semibold bg-slate-100/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            onOpenShortcutsModal();
          }}
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
          className="hidden sm:flex p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Keyboard className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute sound effects (M)' : 'Mute sound effects (M)'}
          aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4.5 h-4.5 text-rose-500" /> : <Volume2 className="w-4.5 h-4.5" />}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenExportModal();
          }}
          title="Export / Backup Tasks"
          aria-label="Export or backup tasks"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenNewTaskModal();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};

