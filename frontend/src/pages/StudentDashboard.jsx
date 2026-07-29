import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, FileText, Bookmark, HelpCircle, Megaphone, Sprout } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return Math.max(1, Math.floor(seconds / 60)) + ' min ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
  const days = Math.floor(seconds / 86400);
  if (days === 1) return 'Yesterday';
  return days + ' days ago';
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const HeaderIllustration = () => (
  <svg viewBox="0 0 180 110" className="hidden sm:block w-40 h-24 shrink-0">
    <rect x="45" y="20" width="90" height="65" rx="6" fill="#FFFFFF" stroke="#E3DFD3" strokeWidth="2" />
    <rect x="45" y="20" width="8" height="65" rx="4" fill="#378ADD" />
    <rect x="63" y="35" width="55" height="7" rx="2" fill="#1B2A4A" />
    <rect x="63" y="50" width="55" height="4" rx="1.5" fill="#E3DFD3" />
    <rect x="63" y="59" width="55" height="4" rx="1.5" fill="#E3DFD3" />
    <rect x="63" y="68" width="35" height="4" rx="1.5" fill="#E3DFD3" />
    <circle cx="140" cy="30" r="20" fill="#FBEFDA" />
    <path d="M140 20 L143 27 L150 28 L145 33 L146 40 L140 36 L134 40 L135 33 L130 28 L137 27 Z" fill="#E8A93A" />
  </svg>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState([]);
  const [notices, setNotices] = useState([]);
  const [doubtSummary, setDoubtSummary] = useState(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [resourceTotal, setResourceTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resourcesRes, allResourcesRes, noticesRes, doubtsRes, bookmarksRes] = await Promise.all([
          api.get('/resources/recent'),
          api.get('/resources', { params: { limit: 1 } }),
          api.get('/notices'),
          api.get('/doubts/summary'),
          api.get('/bookmarks'),
        ]);
        setRecent(resourcesRes.data);
        setResourceTotal(allResourcesRes.data.total || 0);
        setNotices(noticesRes.data.slice(0, 4));
        setDoubtSummary(doubtsRes.data);
        setBookmarkCount(bookmarksRes.data.length);
      } catch (err) {
        // non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/resources' + (search ? '?search=' + encodeURIComponent(search) : ''));
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-8 pt-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="font-display text-3xl text-ink flex items-center gap-2">
              {greeting()}, {user?.name?.split(' ')[0]} <span>&#128075;</span>
            </h1>
            <p className="text-sm text-slate mt-1 mb-5">Keep learning, keep growing.</p>
          </div>
          <HeaderIllustration />
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white border border-hairline rounded-xl px-4 py-3 mb-6 shadow-sm max-w-xl">
          <Search size={17} color="#B8B2A3" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, subjects, resources..."
            className="flex-1 text-sm focus:outline-none bg-transparent"
          />
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#378ADD14' }}>
              <FileText size={19} color="#378ADD" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-xl text-ink leading-none">{resourceTotal}</div>
              <div className="text-sm font-medium text-ink mt-1">Resources</div>
              <div className="text-xs text-slate">Uploaded</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#3F7D5C14' }}>
              <Bookmark size={19} color="#3F7D5C" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-xl text-ink leading-none">{bookmarkCount}</div>
              <div className="text-sm font-medium text-ink mt-1">Bookmarks</div>
              <div className="text-xs text-slate">Saved</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#C7576B14' }}>
              <HelpCircle size={19} color="#C7576B" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-xl text-ink leading-none">{doubtSummary?.open ?? 0}</div>
              <div className="text-sm font-medium text-ink mt-1">Doubts</div>
              <div className="text-xs text-slate">Open</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#8B6BC714' }}>
              <Megaphone size={19} color="#8B6BC7" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-xl text-ink leading-none">{notices.length}</div>
              <div className="text-sm font-medium text-ink mt-1">Notices</div>
              <div className="text-xs text-slate">Recent</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-hairline rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-ink">Recent Resources</h2>
              <a href="/resources" className="text-sm text-ink font-medium hover:underline">View all</a>
            </div>
            {loading ? (
              <p className="text-sm text-slate">Loading...</p>
            ) : recent.length === 0 ? (
              <p className="text-sm text-slate">Nothing uploaded for your branch/semester yet.</p>
            ) : (
              <div className="divide-y divide-hairline">
                {recent.map((r) => (
                  <a key={r._id} href={'/resources/' + r._id} className="flex items-center justify-between py-3 hover:bg-paper -mx-2 px-2 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#C7576B14' }}>
                        <FileText size={16} color="#C7576B" strokeWidth={1.75} />
                      </div>
                      <span className="text-sm font-medium text-ink">{r.title}</span>
                    </div>
                    <span className="text-xs text-slate whitespace-nowrap">{timeAgo(r.createdAt)}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-hairline rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-ink">Latest Notices</h2>
              <a href="/notices" className="text-sm text-ink font-medium hover:underline">View all</a>
            </div>
            {loading ? (
              <p className="text-sm text-slate">Loading...</p>
            ) : notices.length === 0 ? (
              <p className="text-sm text-slate">No notices right now.</p>
            ) : (
              <div className="divide-y divide-hairline">
                {notices.map((n) => (
                  <div key={n._id} className="flex items-start gap-3 py-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#8B6BC714' }}>
                      <Megaphone size={16} color="#8B6BC7" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="text-xs text-slate mt-0.5">{new Date(n.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl p-6" style={{ backgroundColor: '#FBEFDA' }}>
          <div>
            <span className="text-3xl text-amber font-display leading-none">&#8220;</span>
            <p className="text-lg text-ink font-medium leading-snug mt-1">
              Success is the sum of small efforts repeated day in and day out.
            </p>
          </div>
          <Sprout size={40} color="#3F7D5C" strokeWidth={1.5} className="hidden sm:block shrink-0" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;