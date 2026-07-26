import { useEffect, useState } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const MyBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/bookmarks');
      setBookmarks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  const removeBookmark = async (resourceId) => {
    try {
      await api.delete('/bookmarks/' + resourceId);
      setBookmarks((prev) => prev.filter((b) => !b.resource || b.resource._id !== resourceId));
    } catch (err) {
      setError('Could not remove bookmark.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="font-display text-2xl text-ink mb-1">My Bookmarks</h1>
        <p className="text-xs font-mono text-slate mb-6">saved for later</p>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <p className="text-slate text-sm">You haven't bookmarked anything yet.</p>
        ) : (
          <div className="space-y-2.5">
            {bookmarks.map((b) => {
              const r = b.resource;
              if (!r) return null;
              const link = r.fileUrl || r.externalLink;
              return (
                <div key={b._id} className="flex bg-white border border-hairline rounded-r-lg overflow-hidden">
                  <div style={{ width: '5px', backgroundColor: '#E8A93A' }}></div>
                  <div className="flex justify-between items-start flex-1 px-4 py-3">
                    <div>
                      <h2 className="text-sm font-medium text-ink">{r.title}</h2>
                      <p className="text-xs font-mono text-slate mt-1">
                        {r.branch} &middot; SEM {r.semester} &middot; {r.subject}
                      </p>
                      <p className="text-xs text-slate mt-1">Uploaded by {r.uploadedBy?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => removeBookmark(r._id)} className="text-xs font-mono text-red-600 hover:underline">
                        remove
                      </button>
                      {link ? (
                        <a href={link} target="_blank" rel="noreferrer" className="text-xs font-mono text-ink hover:underline whitespace-nowrap">
                          open &rarr;
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBookmarks;