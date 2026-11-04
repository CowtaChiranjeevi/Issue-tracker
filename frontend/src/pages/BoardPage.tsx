import React, { useEffect, useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import api from '../api/client';
import type { Issue, IssueStatus, IssuePriority, Project } from '../types';
import { Modal } from '../components/Modal';
import {
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  CircleDashed,
  Search,
  Filter,
  FolderPlus,
  X,
  Trash2,
  Edit3,
} from 'lucide-react';

const COLUMNS: { id: IssueStatus; label: string; icon: React.ReactNode }[] = [
  { id: 'BACKLOG', label: 'Backlog', icon: <CircleDashed className="h-4 w-4 text-slate-400" /> },
  { id: 'TODO', label: 'To Do', icon: <CircleDashed className="h-4 w-4 text-blue-500" /> },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: <Clock className="h-4 w-4 text-amber-500" /> },
  { id: 'IN_REVIEW', label: 'In Review', icon: <AlertCircle className="h-4 w-4 text-purple-500" /> },
  { id: 'DONE', label: 'Done', icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
];

const priorityColor: Record<IssuePriority, string> = {
  LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  MEDIUM: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
  HIGH: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700/50',
  URGENT: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-700/50',
};

export const BoardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Modal States
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<IssuePriority>('MEDIUM');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjKey, setNewProjKey] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<IssuePriority>('MEDIUM');
  const [editStatus, setEditStatus] = useState<IssueStatus>('BACKLOG');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchIssues(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.get<Project[]>('/projects');
      setProjects(res.data);
      if (res.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchIssues = async (projectId: number) => {
    try {
      const res = await api.get<Issue[]>(`/issues/project/${projectId}`);
      setIssues(res.data);
    } catch (err) {
      console.error('Failed to load issues', err);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const issueId = Number(draggableId);
    const targetStatus = destination.droppableId as IssueStatus;

    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: targetStatus } : i))
    );

    try {
      await api.patch(`/issues/${issueId}/status`, { status: targetStatus });
    } catch (err) {
      if (selectedProjectId) fetchIssues(selectedProjectId);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjKey.trim()) return;

    try {
      const res = await api.post<Project>('/projects', {
        name: newProjName,
        key: newProjKey.toUpperCase(),
        description: newProjDesc,
      });
      setProjects((prev) => [...prev, res.data]);
      setSelectedProjectId(res.data.id);
      setIsProjectModalOpen(false);
      setNewProjName('');
      setNewProjKey('');
      setNewProjDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newTitle.trim()) return;

    try {
      const res = await api.post<Issue>('/issues', {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        projectId: selectedProjectId,
      });
      setIssues((prev) => [...prev, res.data]);
      setIsIssueModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewPriority('MEDIUM');
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (issue: Issue) => {
    setActiveIssue(issue);
    setEditTitle(issue.title);
    setEditDesc(issue.description || '');
    setEditPriority(issue.priority);
    setEditStatus(issue.status);
  };

  const handleUpdateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIssue) return;

    try {
      const res = await api.put<Issue>(`/issues/${activeIssue.id}`, {
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        status: editStatus,
      });
      setIssues((prev) => prev.map((i) => (i.id === activeIssue.id ? res.data : i)));
      setActiveIssue(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIssue = async (id: number) => {
    if (!window.confirm('Delete this issue?')) return;
    try {
      await api.delete(`/issues/${id}`);
      setIssues((prev) => prev.filter((i) => i.id !== id));
      setActiveIssue(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${issue.projectKey}-${issue.id}`.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        selectedPriority === 'ALL' || issue.priority === selectedPriority;

      return matchesSearch && matchesPriority;
    });
  }, [issues, searchQuery, selectedPriority]);

  return (
    <div className="min-h-[calc(100vh-61px)] bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Project:
          </label>
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center space-x-1 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition shadow-sm"
          >
            <FolderPlus className="h-3.5 w-3.5 text-indigo-500" />
            <span>New Project</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-64 rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-md px-2 py-1 shadow-sm">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 items-start">
          {COLUMNS.map((col) => {
            const columnIssues = filteredIssues.filter((i) => i.status === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/60 p-3 min-h-[520px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    {col.icon}
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {col.label}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    {columnIssues.length}
                  </span>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2.5 transition-colors rounded-lg p-1 ${
                        snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/40' : ''
                      }`}
                    >
                      {columnIssues.map((issue, index) => (
                        <Draggable key={issue.id} draggableId={issue.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openEditModal(issue)}
                              className={`group cursor-pointer rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700 ${
                                snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500/50' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-semibold">
                                  {issue.projectKey}-{issue.id}
                                </span>
                                <span
                                  className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                                    priorityColor[issue.priority]
                                  }`}
                                >
                                  {issue.priority}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {issue.title}
                              </h4>
                              {issue.description && (
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {issue.description}
                                </p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Smooth Issue Creation Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Issue</h3>
          <button onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g., Implement optimistic lock handling"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              placeholder="Issue details..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as IssuePriority)}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="rounded-md border border-slate-300 dark:border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Create Issue
            </button>
          </div>
        </form>
      </Modal>

      {/* Smooth Project Creation Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Project</h3>
          <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Project Name</label>
            <input
              type="text"
              required
              value={newProjName}
              onChange={(e) => {
                setNewProjName(e.target.value);
                if (!newProjKey) setNewProjKey(e.target.value.slice(0, 4).toUpperCase());
              }}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g., Mobile App"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Project Key</label>
            <input
              type="text"
              required
              maxLength={10}
              value={newProjKey}
              onChange={(e) => setNewProjKey(e.target.value.toUpperCase())}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono uppercase focus:border-indigo-500 focus:outline-none"
              placeholder="MOB"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              rows={2}
              value={newProjDesc}
              onChange={(e) => setNewProjDesc(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(false)}
              className="rounded-md border border-slate-300 dark:border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Smooth Issue Edit Modal (Features 2 & 3: Smooth Transition & Click Outside) */}
      <Modal isOpen={!!activeIssue} onClose={() => setActiveIssue(null)} maxWidth="max-w-lg">
        {activeIssue && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                {activeIssue.projectKey}-{activeIssue.id}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteIssue(activeIssue.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition"
                  title="Delete Issue"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setActiveIssue(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                    className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as IssuePriority)}
                    className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveIssue(null)}
                  className="rounded-md border border-slate-300 dark:border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};