import { useEffect, useState } from 'react';
import { Search, Filter, Star, ArrowRight, Landmark, CalendarDays, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'most-downloaded', label: 'Most Downloaded' },
];

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

const HeaderIllustration = () => (
  <svg viewBox="0 0 180 120" className="hidden sm:block w-40 h-28 shrink-0">
    <ellipse cx="90" cy="95" rx="85" ry="22" fill="#FBEFDA" />
    <rect x="55" y="30" width="18" height="60" rx="2" fill="#8B6BC7" />
    <rect x="75" y="25" width="18" height="65" rx="2" fill="#E8A93A" />
    <rect x="95" y="35" width="18" height="55" rx="2" fill="#378ADD" />
    <rect x="30" y="70" width="16" height="20" rx="3" fill="#3F7D5C" />
    <ellipse cx="38" cy="64" rx="9" ry="6" fill="#3F7D5C" opacity="0.5" />
    <circle cx="140" cy="35" r="2.5" fill="#E8A93A" />
    <circle cx="150" cy="50" r="1.8" fill="#E8A93A" />
    <circle cx="132" cy="48" r="1.5" fill="#E8A93A" />
  </svg>
);

const getExt = (url) => {
  if (!url) return 'FILE';
  const parts = url.split('.');
  return parts[parts.length - 1].toUpperCase().slice(0, 4);
};

const ResourceList = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  
  const [filters, setFilters] = useState({
    search: '',
    branch: '',
    semester: '',
    subject: '',
  });
  
  const [sortBy, setSortBy] = useState('latest');
  const [showOtherBranches, setShowOtherBranches] = useState(false);

  const fetchResources = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('search', filters.search);
      
      // AUTO-FILTER: Students see only their branch by default
      if (user?.role === 'student' && !showOtherBranches) {
        params.append('branch', user?.branch || filters.branch);
      } else {
        params.append('branch', filters.branch);
      }
      
      params.append('semester', filters.semester);
      params.append('subject', filters.subject);
      params.append('page', page);
      params.append('limit', 10);
      
      const { data } = await api.get('/resources', { params });
      setResources(data.resources);
      setTotal(data.total);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources.');
      } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/bookmarks');
      setBookmarkedIds(new Set(data.map((b) => b.resource && b.resource._id)));
    } catch (err) {
      setBookmarkedIds(new Set());
    }
  };

  useEffect(() => {
    fetchResources(1);
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOtherBranches]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchResources(1);
  };
  
  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchResources(p);
  };

  const toggleBookmark = async (resourceId) => {
    const isBookmarked = bookmarkedIds.has(resourceId);
    try {
      if (isBookmarked) {
        await api.delete('/bookmarks/' + resourceId);
        const next = new Set(bookmarkedIds);
        next.delete(resourceId);
        setBookmarkedIds(next);
        showToast('Removed from bookmarks', 'info');
      } else {
        await api.post('/bookmarks/' + resourceId);
        const next = new Set(bookmarkedIds);
        next.add(resourceId);
        setBookmarkedIds(next);
        showToast('Added to bookmarks', 'success');
      }
    } catch (err) {
      setError('Could not update bookmark.');
    }
  };

  const sortedResources = [...resources].sort((a, b) => {
    if (sortBy === 'most-viewed') return b.viewCount - a.viewCount;
    if (sortBy === 'most-downloaded') return b.downloadCount - a.downloadCount;
    return 0;
  });

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="font-display text-3xl text-ink">Browse Resources</h1>
            <p className="text-sm text-slate mt-1">Explore notes, question papers, assignments and more.</p>
            {user?.role === 'student' && (
              <p className="text-xs text-slate mt-2">
                {showOtherBranches ? '👀 Viewing all branches' : `📚 Viewing ${user?.branch} branch only`}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {user?.role === 'student' && (
              <button
                onClick={() => setShowOtherBranches(!showOtherBranches)}
                className="text-sm font-medium px-3 py-1.5 rounded-lg border border-hairline bg-white hover:bg-paper transition-colors whitespace-nowrap"
              >
                {showOtherBranches ? 'Show My Branch Only' : 'Explore Other Branches'}
              </button>
            )}
            <HeaderIllustration />
          </div>
        </div>

        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-3 mb-4 bg-white border border-hairline p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 py-2 flex-1 min-w-[150px]">
            <Search size={15} color="#B8B2A3" strokeWidth={2} />
            <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search resources..." className="text-sm focus:outline-none flex-1 bg-transparent" />
          </div>
          <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 py-2">
            <Landmark size={15} color="#B8B2A3" strokeWidth={2} />
            <input type="text" name="branch" value={filters.branch} onChange={handleFilterChange} placeholder="Branch" className="text-sm focus:outline-none w-20 bg-transparent" />
          </div>
          <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 py-2">
            <CalendarDays size={15} color="#B8B2A3" strokeWidth={2} />
            <input type="number" name="semester" value={filters.semester} onChange={handleFilterChange} placeholder="Sem" className="text-sm focus:outline-none w-14 bg-transparent" />
          </div>
          <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 py-2">
            <BookOpen size={15} color="#B8B2A3" strokeWidth={2} />
            <input type="text" name="subject" value={filters.subject} onChange={handleFilterChange} placeholder="Subject" className="text-sm focus:outline-none w-24 bg-transparent" />
          </div>
          <button type="submit" className="flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink/90">
            <Filter size={14} strokeWidth={2} /> Filter
          </button>
        </form>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate"><span className="font-semibold text-ink">{total}</span> resource{total !== 1 ? 's' : ''} found</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate">Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-hairline rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-ink">
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : sortedResources.length === 0 ? (
          <div className="text-slate text-sm">
            <p>No resources found.</p>
            {user?.role === 'student' && !showOtherBranches && (
              <p className="text-xs text-slate mt-2">Try toggling "Explore Other Branches" to see resources from other departments.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedResources.map((r) => {
              const link = r.fileUrl || r.externalLink;
              const isBookmarked = bookmarkedIds.has(r._id);
              const tabColor = TYPE_COLOR[r.type] || '#5B6478';
              const ext = r.type === 'external-link' ? 'LINK' : getExt(r.fileUrl);

              return (
                <div key={r._id} className="flex items-center gap-4 bg-white border border-hairline rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: tabColor + '14' }}>
                    <span className="text-[10px] font-mono font-bold" style={{ color: tabColor }}>{ext}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={'/resources/' + r._id} className="text-base font-semibold text-ink hover:underline">{r.title}</Link>
                    <p className="text-xs text-slate mt-1">{r.branch} &middot; Semester {r.semester} &middot; {r.subject}</p>
                    <p className="text-xs text-slate mt-1">{r.viewCount} views &middot; {r.downloadCount} downloads &middot; Uploaded by {r.uploadedBy?.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(r._id)}
                    title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Star size={19} color={isBookmarked ? '#E8A93A' : '#D8D2C4'} fill={isBookmarked ? '#E8A93A' : 'none'} strokeWidth={1.75} />
                  </button>
                  {link ? (
                    <div className="flex items-center gap-2">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap" style={{ color: tabColor, backgroundColor: tabColor + '14' }}>
                        View <ArrowRight size={14} strokeWidth={2} />
                      </a>
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.get('/resources/' + r._id + '/download', { responseType: 'blob' });
                            const blob = res.data;
                            let filename = r.fileUrl?.split('?')[0].split('/').pop() || 'resource';
                            const disposition = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition']);
                            if (disposition) {
                              const match = disposition.match(/filename\*?=([^;]+)/i);
                              if (match) {
                                filename = decodeURIComponent(match[1].replace(/UTF-8''/, '').replace(/"/g, '').trim());
                              }
                            }
                            const urlObj = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = urlObj;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(urlObj);
                            showToast('Downloaded', 'success');
                          } catch (err) {
                            setError('Could not download resource.');
                          }
                        }}
                        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap"
                        style={{ color: tabColor }}
                      >
                        Download <ArrowRight size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-6">
            <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1} className="text-sm px-3 py-1.5 rounded-lg border border-hairline bg-white disabled:opacity-40 hover:border-ink">&larr;</button>
            {pageNumbers.map((p) => (
              <button key={p} type="button" onClick={() => goToPage(p)} className={'text-sm px-3.5 py-1.5 rounded-lg border font-medium ' + (p === page ? 'bg-ink text-paper border-ink' : 'bg-white text-ink border-hairline hover:border-ink')}>{p}</button>
            ))}
            <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="text-sm px-3 py-1.5 rounded-lg border border-hairline bg-white disabled:opacity-40 hover:border-ink">&rarr;</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResourceList;