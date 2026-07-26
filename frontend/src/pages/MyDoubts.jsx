import { useEffect, useState } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const statusColor = {
  open: 'text-slate',
  answered: '#378ADD',
  resolved: '#3F7D5C',
};

const MyDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ subject: '', title: '', description: '' });
  const [posting, setPosting] = useState(false);

  const fetchDoubts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/doubts');
      setDoubts(data.doubts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doubts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoubts(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPosting(true);
    try {
      await api.post('/doubts', form);
      setForm({ subject: '', title: '', description: '' });
      setSuccess('Doubt posted successfully.');
      fetchDoubts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post doubt.');
    } finally {
      setPosting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch('/doubts/' + id + '/resolve');
      fetchDoubts();
    } catch (err) {
      setError('Could not mark as resolved.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="font-display text-2xl text-ink mb-1">My Doubts</h1>
        <p className="text-xs font-mono text-slate mb-6">ask and track answers</p>

        <form onSubmit={handleSubmit} className="bg-white border border-hairline p-4 rounded-lg space-y-3 mb-8">
          <h2 className="text-xs font-mono text-slate uppercase tracking-wide">Post a new doubt</h2>
          <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject (e.g. Operating Systems)" required className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
          <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Short title" required className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your doubt in detail" required rows={3} className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
          <button type="submit" disabled={posting} className="bg-ink text-paper px-4 py-2 rounded text-sm hover:bg-ink/90 disabled:opacity-50">
            {posting ? 'Posting...' : 'Post Doubt'}
          </button>
        </form>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded p-2">{success}</div>}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : doubts.length === 0 ? (
          <p className="text-slate text-sm">You haven't posted any doubts yet.</p>
        ) : (
          <div className="space-y-4">
            {doubts.map((d) => (
              <div key={d._id} className="bg-white border border-hairline rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-ink">{d.title}</h3>
                    <p className="text-xs font-mono text-slate mt-0.5">{d.subject}</p>
                  </div>
                  <span className="text-xs font-mono font-medium" style={{ color: typeof statusColor[d.status] === 'string' && statusColor[d.status].startsWith('#') ? statusColor[d.status] : undefined }}>
                    {d.status}
                  </span>
                </div>
                <p className="text-sm text-ink/80 mt-2">{d.description}</p>

                {d.answers && d.answers.length > 0 && (
                  <div className="mt-3 border-t border-hairline pt-3 space-y-2">
                    {d.answers.map((a, idx) => (
                      <div key={idx} className="bg-paper rounded p-2">
                        <p className="text-sm text-ink/90">{a.text}</p>
                        <p className="text-xs font-mono text-slate mt-1">- {a.faculty?.name || 'Faculty'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {d.status === 'answered' && (
                  <button type="button" onClick={() => handleResolve(d._id)} className="mt-3 text-xs font-mono text-green-700 hover:underline">
                    mark as resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyDoubts;