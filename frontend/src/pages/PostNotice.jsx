import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Grid2x2, Flag, Calendar, Send } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';

const CATEGORIES = ['general', 'examination', 'assignment', 'event', 'academic', 'department'];
const labelClass = 'block text-sm font-medium text-ink mb-1.5';
const fieldClass = 'w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink bg-white';

const HeaderIllustration = () => (
  <svg viewBox="0 0 160 90" className="hidden sm:block w-32 h-20 shrink-0">
    <path d="M20 45 L45 30 L45 60 L20 55 Z" fill="#E8A93A" />
    <rect x="12" y="42" width="8" height="13" rx="2" fill="#E8A93A" />
    <path d="M8 20 L14 12 M6 40 L16 40 M8 60 L14 68" stroke="#E8A93A" strokeWidth="2" strokeLinecap="round" />
    <rect x="90" y="15" width="42" height="55" rx="3" fill="#FAF7F0" stroke="#1B2A4A" strokeWidth="2.5" />
    <rect x="107" y="10" width="8" height="10" rx="1" fill="#378ADD" />
    <line x1="98" y1="30" x2="124" y2="30" stroke="#D9C9A3" strokeWidth="2" />
    <line x1="98" y1="38" x2="124" y2="38" stroke="#D9C9A3" strokeWidth="2" />
    <line x1="98" y1="46" x2="115" y2="46" stroke="#D9C9A3" strokeWidth="2" />
    <path d="M100 56 L106 62 L118 50" stroke="#3F7D5C" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PostNotice = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

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
      showToast('Notice posted successfully!');
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post notice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Megaphone size={22} color="#E8A93A" strokeWidth={1.75} className="shrink-0" />
            <div>
              <h1 className="font-display text-2xl text-ink">Post Notice</h1>
              <p className="text-sm text-slate mt-0.5">Announce important updates to your students</p>
            </div>
          </div>
          <HeaderIllustration />
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-hairline p-6 rounded-xl shadow-sm">
          <div>
            <label className={labelClass}>Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Enter notice title" required className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Write your notice details..." required rows={3} className={fieldClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8A93A14' }}>
                  <Grid2x2 size={15} color="#E8A93A" strokeWidth={1.75} />
                </div>
                <select name="category" value={form.category} onChange={handleChange} className={fieldClass}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Priority <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8A93A14' }}>
                  <Flag size={15} color="#E8A93A" strokeWidth={1.75} />
                </div>
                <select name="priority" value={form.priority} onChange={handleChange} className={fieldClass}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Branch (Optional)</label>
              <input type="text" name="branch" value={form.branch} onChange={handleChange} placeholder="Select branch or leave blank for all" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Semester (Optional)</label>
              <input type="number" name="semester" value={form.semester} onChange={handleChange} min={1} max={8} placeholder="Leave blank for all" className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Event Date (Optional)</label>
              <div className="flex items-center gap-2">
                <Calendar size={15} color="#5B6478" strokeWidth={1.75} className="shrink-0" />
                <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} className={fieldClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Expiry Date (Optional)</label>
              <div className="flex items-center gap-2">
                <Calendar size={15} color="#5B6478" strokeWidth={1.75} className="shrink-0" />
                <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className={fieldClass} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-3 rounded-lg text-sm font-medium hover:bg-ink/90 disabled:opacity-50">
            <Send size={16} strokeWidth={2} />
            {loading ? 'Posting...' : 'Post Notice'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostNotice;