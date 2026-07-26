import { useEffect, useState } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/notices');
        setNotices(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notices.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Notice Board</h1>
        <p className="text-xs font-mono text-slate mb-6">announcements for you</p>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : notices.length === 0 ? (
          <p className="text-slate text-sm">No notices right now.</p>
        ) : (
          <div className="space-y-2.5">
            {notices.map((n) => (
              <div key={n._id} className="flex bg-white border border-hairline rounded-r-lg overflow-hidden">
                <div style={{ width: '5px', backgroundColor: n.priority === 'high' ? '#C7576B' : '#E3DFD3' }}></div>
                <div className="flex-1 px-4 py-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-ink">{n.title}</h3>
                    <span className="text-xs font-mono text-slate uppercase">{n.category}</span>
                  </div>
                  <p className="text-sm text-ink/80 mt-1">{n.description}</p>
                  <p className="text-xs font-mono text-slate mt-2">
                    {n.postedBy?.name}
                    {n.eventDate ? ' \u00b7 event: ' + new Date(n.eventDate).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NoticeBoard;