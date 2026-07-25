import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

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
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Browse Resources</h1>

        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-lg shadow"
        >
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search..."
            className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-[150px]"
          />
          <input
            type="text"
            name="branch"
            value={filters.branch}
            onChange={handleFilterChange}
            placeholder="Branch"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28"
          />
          <input
            type="number"
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
            placeholder="Sem"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-20"
          />
          <input
            type="text"
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            placeholder="Subject"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            Filter
          </button>
        </form>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : resources.length === 0 ? (
          <p className="text-gray-500 text-sm">No resources found.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              {total} resource{total !== 1 ? 's' : ''} found
            </p>

            {resources.map((r) => {
              const link = r.fileUrl || r.externalLink;
              const isBookmarked = bookmarkedIds.has(r._id);
              const starLabel = isBookmarked ? 'Remove bookmark' : 'Add bookmark';
              const starSymbol = isBookmarked ? '\u2605' : '\u2606';
              const starColor = isBookmarked ? '#d97706' : '#9ca3af';

              return (
                <div key={r._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-start">
                  <div>
                    <Link to={'/resources/' + r._id} className="font-medium text-gray-800 hover:underline">{r.title}</Link>
                    <p className="text-sm text-gray-500">
                      {r.subject} - {r.branch} - Sem {r.semester} - {r.type}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded by {r.uploadedBy?.name} - {r.viewCount} views - {r.downloadCount} downloads
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleBookmark(r._id)}
                      title={starLabel}
                      style={{ color: starColor, fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {starSymbol}
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

export default ResourceList;