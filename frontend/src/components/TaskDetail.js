import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const actionIcon = (action) => {
  if (action.includes('created'))   return '✦';
  if (action.includes('status'))    return '⇄';
  if (action.includes('priority'))  return '⚑';
  if (action.includes('comment'))   return '💬';
  if (action.includes('subtask'))   return '☑';
  if (action.includes('recurring')) return '↺';
  if (action.includes('due date'))  return '📅';
  return '✎';
};

export default function TaskDetail({ task, onClose }) {
  const [comments, setComments]   = useState([]);
  const [activity, setActivity]   = useState([]);
  const [newComment, setNewComment] = useState('');
  const [tab, setTab]             = useState('comments');
  const [loading, setLoading]     = useState(true);
  const [posting, setPosting]     = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, aRes] = await Promise.all([
        axios.get(`/api/tasks/${task._id}/comments`),
        axios.get(`/api/tasks/${task._id}/activity`),
      ]);
      setComments(cRes.data);
      setActivity(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [task._id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await axios.post(`/api/tasks/${task._id}/comments`, { text: newComment.trim() });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/tasks/${task._id}/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) { console.error(err); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal detail-modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title" style={{ marginBottom: '4px' }}>{task.title}</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
              {task.recurring?.enabled && <span className="recurring-badge">↺ {task.recurring.frequency}</span>}
              {task.tags?.map(t => <span key={t} className="task-tag">#{t}</span>)}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        {task.description && (
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '1.2rem', lineHeight: 1.6 }}>{task.description}</p>
        )}

        {/* Tabs */}
        <div className="detail-tabs">
          <button className={`detail-tab ${tab === 'comments' ? 'active' : ''}`} onClick={() => setTab('comments')}>
            💬 Comments {comments.length > 0 && <span className="tab-count">{comments.length}</span>}
          </button>
          <button className={`detail-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
            ⏱ Activity {activity.length > 0 && <span className="tab-count">{activity.length}</span>}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Loading...</div>
        ) : tab === 'comments' ? (
          <div className="detail-body">
            {/* Add comment */}
            <form onSubmit={handleComment} className="comment-form">
              <textarea
                className="form-input"
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={2}
                style={{ resize: 'none' }}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment(e))}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '7px 16px' }} disabled={posting || !newComment.trim()}>
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>

            {comments.length === 0 ? (
              <div className="empty-col" style={{ padding: '1.5rem' }}>
                <span className="empty-col-icon">💬</span>No comments yet
              </div>
            ) : (
              <div className="comments-list">
                {comments.map(c => (
                  <div key={c._id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-avatar">{c.userName?.[0]?.toUpperCase()}</div>
                      <div>
                        <span className="comment-author">{c.userName}</span>
                        <span className="comment-time">{timeAgo(c.createdAt)} · {formatDate(c.createdAt)}</span>
                      </div>
                      <button className="icon-btn delete" style={{ marginLeft: 'auto' }} onClick={() => handleDeleteComment(c._id)} title="Delete">✕</button>
                    </div>
                    <p className="comment-text">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="detail-body">
            {activity.length === 0 ? (
              <div className="empty-col" style={{ padding: '1.5rem' }}>
                <span className="empty-col-icon">⏱</span>No activity yet
              </div>
            ) : (
              <div className="activity-list">
                {activity.map(a => (
                  <div key={a._id} className="activity-item">
                    <span className="activity-icon">{actionIcon(a.action)}</span>
                    <div className="activity-content">
                      <span className="activity-user">{a.userName}</span>
                      <span className="activity-action"> {a.action}</span>
                      {a.from && a.to && (
                        <span className="activity-change">
                          <span className="activity-from">{a.from}</span>
                          <span> → </span>
                          <span className="activity-to">{a.to}</span>
                        </span>
                      )}
                    </div>
                    <span className="activity-time">{timeAgo(a.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}