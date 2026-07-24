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

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const removeBookmark = async (resourceId) => {
    try {
      await api.delete('/bookmarks/' + resourceId);
      const remaining = bookmarks.filter((b) => !b.resource || b.resource._id !== resourceId);
      setBookmarks(remaining);
    } catch (err) {
      setError('Could not remove bookmark.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Bookmarks</h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <p className="text-gray-500 text-sm">You haven't bookmarked anything yet.</p>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => {
              const r = b.resource;
              if (!r) return null;
              const link = r.fileUrl || r.externalLink;

              return (
                <div key={b._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-start">
                  <div>
                    <h2 className="font-medium text-gray-800">{r.title}</h2>
                    <p className="text-sm text-gray-500">
                      {r.subject} - {r.branch} - Sem {r.semester} - {r.type}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded by {r.uploadedBy?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => removeBookmark(r._id)} className="text-sm text-red-500 hover:underline">
                      Remove
                    </button>
                    {link ? (
                      <a href={link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                        Open
                      </a>
                    ) : null}
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