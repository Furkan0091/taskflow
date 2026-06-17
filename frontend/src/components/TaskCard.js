import React from 'react';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr) => dateStr && new Date(dateStr) < new Date() && task.status !== 'done';

  const nextStatus = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
  const nextLabel = { todo: '→ Start', inprogress: '→ Done', done: '↺ Reopen' };

  const totalSubs = task.subtasks?.length || 0;
  const doneSubs = task.subtasks?.filter(s => s.completed).length || 0;
  const subPct = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

  return (
    <div className="task-card">
      <div className="task-card-top">
        <span className="task-title">{task.title}</span>
        <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="task-tags">
          {task.tags.map(tag => (
            <span key={tag} className="task-tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Subtask progress bar */}
      {totalSubs > 0 && (
        <div className="subtask-progress">
          <div className="subtask-progress-header">
            <span>subtasks</span>
            <span>{doneSubs}/{totalSubs} · {subPct}%</span>
          </div>
          <div className="subtask-bar-bg">
            <div className="subtask-bar-fill" style={{ width: `${subPct}%` }} />
          </div>
        </div>
      )}

      <div className="task-footer">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: '11px', padding: '3px 10px', fontFamily: 'var(--mono)' }}
            onClick={() => onStatusChange(task._id, nextStatus[task.status])}
          >
            {nextLabel[task.status]}
          </button>
          {task.dueDate && (
            <span className={`due-date ${isOverdue(task.dueDate) ? 'due-overdue' : ''}`}>
              {isOverdue(task.dueDate) ? '⚠ ' : ''}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <div className="task-actions">
          <button className="icon-btn" onClick={() => onEdit(task)} title="Edit">✎</button>
          <button className="icon-btn delete" onClick={() => onDelete(task._id)} title="Delete">✕</button>
        </div>
      </div>
    </div>
  );
}
