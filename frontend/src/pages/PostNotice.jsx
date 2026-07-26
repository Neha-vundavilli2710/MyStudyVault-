import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const CATEGORIES = ['examination', 'assignment', 'event', 'academic', 'department', 'general'];
const fieldClass = 'w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink';
const labelClass = 'block text-xs font-mono text-slate mb-1.5 uppercase tracking-wide';

const PostNotice = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: 'general', branch: '', semester: '',
    priority: 'normal', eventDate: '', expiryDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.semester) payload.semester = Number(payload.semester);
      if (!payload.eventDate) delete payload.eventDate;
      if (!payload.expiryDate) delete payload.expiryDate;

      await api.post('/notices', payload);
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Post Notice</h1>
        <p className="text-xs font-mono text-slate mb-6">announce to students</p>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-hairline p-6 rounded-lg">
          <div>
            <label className={labelClass}>Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className={fieldClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={fieldClass}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className={fieldClass}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Branch (optional)</label>
              <input type="text" name="branch" value={form.branch} onChange={handleChange} placeholder="Leave blank for all" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Semester (optional)</label>
              <input type="number" name="semester" value={form.semester} onChange={handleChange} min={1} max={8} placeholder="Leave blank for all" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Event Date (optional)</label>
              <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Expiry Date (optional)</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className={fieldClass} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-ink text-paper py-2.5 rounded text-sm font-medium hover:bg-ink/90 disabled:opacity-50">
            {loading ? 'Posting...' : 'Post Notice'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostNotice;