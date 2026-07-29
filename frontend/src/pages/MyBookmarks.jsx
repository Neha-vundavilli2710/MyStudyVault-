import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const TYPE_COLOR = {
  'lecture-notes': '#378ADD',
  assignment: '#8B6BC7',
  'question-paper': '#E8A93A',
  syllabus: '#3F7D5C',
  'reference-material': '#5B6478',
  'lab-material': '#C7576B',
  'external-link': '#3F7D5C',
  other: '#5B6478',
};

const getExt = (url) => {
  if (!url) return 'LINK';
  const clean = url.split('?')[0];
  const parts = clean.split('.');
  const ext = parts.length > 1 ? parts.pop().toUpperCase() : '';
  return ext && ext.length <= 4 ? ext : 'FILE';
};

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
        <h1 className="font-display text-3xl text-ink">My Bookmarks</h1>
        <div className="w-10 h-0.5 bg-amber mt-2 mb-2"></div>
        <p className="text-sm text-slate mb-6">saved for later</p>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <p className="text-slate text-sm">You haven't bookmarked anything yet.</p>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => {
              const r = b.resource;
              if (!r) return null;
              const link = r.fileUrl || r.externalLink;
              const tabColor = TYPE_COLOR[r.type] || '#5B6478';
              const ext = r.type === 'external-link' ? 'LINK' : getExt(r.fileUrl);

              return (
                <div key={b._id} className="flex items-center gap-4 bg-white border-2 rounded-xl p-4 shadow-sm" style={{ borderColor: '#E8A93A' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tabColor + '1A' }}>
                    <span className="text-[10px] font-mono font-bold" style={{ color: tabColor }}>{ext}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-ink">{r.title}</h2>
                    <p className="text-xs text-slate mt-1">{r.branch} &middot; SEM {r.semester} &middot; {r.subject}</p>
                    <p className="text-xs text-slate mt-1">Uploaded by {r.uploadedBy?.name}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <button type="button" onClick={() => removeBookmark(r._id)} className="text-sm font-medium text-red-600 hover:underline">
                      Remove
                    </button>
                    <span className="w-px h-4 bg-hairline"></span>
                    {link ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const { data } = await api.get('/resources/' + r._id + '/download');
                            window.open(data.url, '_blank');
                          } catch (err) {
                            setError('Could not open resource.');
                          }
                        }}
                        className="text-sm font-medium text-ink hover:underline flex items-center gap-1"
                      >
                        Open <ArrowRight size={14} strokeWidth={2} />
                      </button>
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