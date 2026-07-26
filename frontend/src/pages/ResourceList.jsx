import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const [filters, setFilters] = useState({
    branch: '',
    semester: '',
    subject: '',
    type: '',
    search: '',
  });

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const { data } = await api.get('/resources', { params });
      setResources(data.resources);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/bookmarks');
      const ids = data.map((b) => b.resource && b.resource._id);
      setBookmarkedIds(new Set(ids));
    } catch (err) {
      setBookmarkedIds(new Set());
    }
  };

  useEffect(() => {
    fetchResources();
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const toggleBookmark = async (resourceId) => {
    const isBookmarked = bookmarkedIds.has(resourceId);

    if (isBookmarked) {
      try {
        await api.delete('/bookmarks/' + resourceId);
        const next = new Set(bookmarkedIds);
        next.delete(resourceId);
        setBookmarkedIds(next);
      } catch (err) {
        setError('Could not remove bookmark.');
      }
    } else {
      try {
        await api.post('/bookmarks/' + resourceId);
        const next = new Set(bookmarkedIds);
        next.add(resourceId);
        setBookmarkedIds(next);
      } catch (err) {
        setError('Could not add bookmark.');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Browse Resources</h1>
        <p className="text-xs font-mono text-slate mb-6">the catalog</p>

        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-3 mb-6 bg-white border border-hairline p-4 rounded-lg">
          <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search..." className="border border-hairline rounded px-3 py-1.5 text-sm flex-1 min-w-[150px] focus:outline-none focus:ring-1 focus:ring-ink" />
          <input type="text" name="branch" value={filters.branch} onChange={handleFilterChange} placeholder="Branch" className="border border-hairline rounded px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-ink" />
          <input type="number" name="semester" value={filters.semester} onChange={handleFilterChange} placeholder="Sem" className="border border-hairline rounded px-3 py-1.5 text-sm w-20 focus:outline-none focus:ring-1 focus:ring-ink" />
          <input type="text" name="subject" value={filters.subject} onChange={handleFilterChange} placeholder="Subject" className="border border-hairline rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-ink" />
          <button type="submit" className="bg-ink text-paper px-4 py-1.5 rounded text-sm hover:bg-ink/90">
            Filter
          </button>
        </form>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : resources.length === 0 ? (
          <p className="text-slate text-sm">No resources found.</p>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs font-mono text-slate">
              {total} resource{total !== 1 ? 's' : ''} found
            </p>

            {resources.map((r) => {
              const link = r.fileUrl || r.externalLink;
              const isBookmarked = bookmarkedIds.has(r._id);
              const tabColor = TYPE_COLOR[r.type] || '#5B6478';

              return (
                <div key={r._id} className="flex bg-white border border-hairline rounded-r-lg overflow-hidden">
                  <div style={{ width: '5px', backgroundColor: tabColor }}></div>
                  <div className="flex justify-between items-start flex-1 px-4 py-3">
                    <div>
                      <Link to={'/resources/' + r._id} className="text-sm font-medium text-ink hover:underline">
                        {r.title}
                      </Link>
                      <p className="text-xs font-mono text-slate mt-1">
                        {r.branch} &middot; SEM {r.semester} &middot; {r.subject}
                      </p>
                      <p className="text-xs text-slate mt-1">
                        {r.type} &middot; {r.uploadedBy?.name} &middot; {r.viewCount} views &middot; {r.downloadCount} downloads
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleBookmark(r._id)}
                        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        style={{ color: isBookmarked ? '#E8A93A' : '#B8B2A3', fontSize: '17px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {isBookmarked ? '\u2605' : '\u2606'}
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

export default ResourceList;