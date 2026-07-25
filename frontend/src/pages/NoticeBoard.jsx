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
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Notice Board</h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : notices.length === 0 ? (
          <p className="text-gray-500 text-sm">No notices right now.</p>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n._id}
                className={
                  'bg-white p-4 rounded-lg shadow border-l-4 ' +
                  (n.priority === 'high' ? 'border-red-400' : 'border-gray-200')
                }
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">{n.title}</h3>
                  <span className="text-xs text-gray-400 uppercase">{n.category}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{n.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Posted by {n.postedBy?.name}
                  {n.eventDate ? ' - Event: ' + new Date(n.eventDate).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NoticeBoard;