import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { key: 'todo', label: 'To Do', dotClass: 'dot-todo' },
  { key: 'inprogress', label: 'In Progress', dotClass: 'dot-inprogress' },
  { key: 'done', label: 'Done', dotClass: 'dot-done' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (filterPriority) params.priority = filterPriority;
      if (filterTag) params.tag = filterTag;
      if (search) params.search = search;
      const res = await axios.get('/api/tasks', { params });
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  }, [filterPriority, filterTag, search]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await axios.get('/api/tasks/meta/tags');
      setAllTags(res.data);
    } catch (err) { /* ignore */ }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchTags(); }, [fetchTags]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSave = async (data) => {
    try {
      if (editingTask) {
        await axios.put(`/api/tasks/${editingTask._id}`, data);
      } else {
        await axios.post('/api/tasks', data);
      }
      await fetchTasks();
      await fetchTags();
      setModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to save task', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.patch(`/api/tasks/${id}/status`, { status });
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
    } catch (err) { console.error(err); }
  };

  const handleEdit = (task) => { setEditingTask(task); setModalOpen(true); };
  const handleNewTask = () => { setEditingTask(null); setModalOpen(true); };

  const getByStatus = (status) => tasks.filter(t => t.status === status);

  const total = tasks.length;
  const doneCount = getByStatus('done').length;
  const overallPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const stats = {
    total,
    todo: getByStatus('todo').length,
    inprogress: getByStatus('inprogress').length,
    done: doneCount,
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-logo">
          <div className="navbar-logo-icon">✦</div>
          TaskFlow
        </div>
        <div className="navbar-right">
          <span className="navbar-user">Hey, <span>{user?.name?.split(' ')[0]}</span></span>
          <button className="btn btn-ghost" style={{ fontSize: '13px', padding: '7px 14px' }} onClick={logout}>Sign out</button>
        </div>
      </nav>

      <div className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My workspace</h1>
            <p className="page-subtitle">{stats.total} task{stats.total !== 1 ? 's' : ''} total</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleNewTask}>+ New task</button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value stat-total">{stats.total}</div></div>
          <div className="stat-card"><div className="stat-label">To Do</div><div className="stat-value stat-todo">{stats.todo}</div></div>
          <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value stat-inprogress">{stats.inprogress}</div></div>
          <div className="stat-card"><div className="stat-label">Done</div><div className="stat-value stat-done">{stats.done}</div></div>
        </div>

        {/* Overall progress bar */}
        {total > 0 && (
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">overall progress</span>
              <span className="progress-pct">{overallPct}% complete</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="tag-filter" style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>tags:</span>
            <span className={`tag-chip ${filterTag === '' ? 'active' : ''}`} onClick={() => setFilterTag('')}>all</span>
            {allTags.map(tag => (
              <span key={tag} className={`tag-chip ${filterTag === tag ? 'active' : ''}`} onClick={() => setFilterTag(filterTag === tag ? '' : tag)}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Board */}
        {tasks.length === 0 && (search || filterPriority || filterTag) ? (
          <div className="no-results">No tasks match your filters. <button className="btn btn-ghost" style={{ marginLeft: '8px', fontSize: '13px', padding: '5px 12px', display: 'inline-flex' }} onClick={() => { setSearchInput(''); setFilterPriority(''); setFilterTag(''); }}>Clear filters</button></div>
        ) : (
          <div className="board">
            {COLUMNS.map(col => {
              const colTasks = getByStatus(col.key);
              return (
                <div className="column" key={col.key}>
                  <div className="column-header">
                    <span className="column-title"><span className={`column-dot ${col.dotClass}`} />{col.label}</span>
                    <span className="column-count">{colTasks.length}</span>
                  </div>
                  <div className="column-body">
                    {colTasks.length === 0 ? (
                      <div className="empty-col"><span className="empty-col-icon">◻</span>No tasks here</div>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
