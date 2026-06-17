import React, { useState, useEffect, useRef } from 'react';

export default function TaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const tagInputRef = useRef();

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, { title: subtaskInput.trim(), completed: false }]);
    setSubtaskInput('');
  };

  const toggleSubtask = (idx) => {
    setSubtasks(subtasks.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (idx) => setSubtasks(subtasks.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ title, description, status, priority, dueDate: dueDate || null, tags, subtasks });
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit task' : 'New task'}</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-input" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" placeholder="Add details (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due date</label>
              <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(press Enter or comma to add)</span></label>
            <div className="tags-input-wrap" onClick={() => tagInputRef.current?.focus()}>
              {tags.map(tag => (
                <span key={tag} className="tag-pill">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? 'e.g. frontend, urgent...' : ''}
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="form-group">
            <label className="form-label">Subtasks <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({subtasks.filter(s => s.completed).length}/{subtasks.length} done)</span></label>
            <div className="subtasks-section">
              {subtasks.map((s, i) => (
                <div key={i} className="subtask-item">
                  <input type="checkbox" className="subtask-checkbox" checked={s.completed} onChange={() => toggleSubtask(i)} />
                  <span className={`subtask-text ${s.completed ? 'done' : ''}`}>{s.title}</span>
                  <button type="button" className="icon-btn delete" onClick={() => removeSubtask(i)}>✕</button>
                </div>
              ))}
              <div className="subtask-add">
                <input
                  value={subtaskInput}
                  onChange={e => setSubtaskInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                  placeholder="Add a subtask..."
                />
                <button type="button" onClick={addSubtask}>+ Add</button>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading}>
              {loading ? 'Saving...' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
