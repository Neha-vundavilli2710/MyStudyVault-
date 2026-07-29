import { useEffect, useState } from 'react';
import { Megaphone, FileText, Calendar, GraduationCap, Grid2x2, Bell, ChevronRight, ClipboardCheck } from 'lucide-react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const CATEGORY_META = {
  general: { color: '#378ADD', icon: FileText, label: 'General' },
  event: { color: '#8B6BC7', icon: Calendar, label: 'Event' },
  examination: { color: '#C7576B', icon: GraduationCap, label: 'Examination' },
  assignment: { color: '#378ADD', icon: FileText, label: 'Assignment' },
  academic: { color: '#3F7D5C', icon: FileText, label: 'Academic' },
  department: { color: '#3F7D5C', icon: Grid2x2, label: 'Others' },
};

const FILTER_TABS = [
  { value: 'all', label: 'All Notices', icon: Megaphone },
  { value: 'general', label: 'General', icon: FileText },
  { value: 'event', label: 'Events', icon: Calendar },
  { value: 'examination', label: 'Examinations', icon: GraduationCap },
  { value: 'department', label: 'Others', icon: Grid2x2 },
];

const badgeForNotice = (n) => {
  if (n.priority === 'high') return { text: 'IMPORTANT', color: '#C7576B' };
  const isNew = Date.now() - new Date(n.createdAt).getTime() < 1000 * 60 * 60 * 24 * 3;
  if (isNew) return { text: 'NEW', color: '#378ADD' };
  if (n.eventDate && new Date(n.eventDate) > new Date()) return { text: 'UPCOMING', color: '#8B6BC7' };
  return { text: (CATEGORY_META[n.category] || CATEGORY_META.general).label.toUpperCase(), color: '#3F7D5C' };
};

const HeaderIllustration = () => (
  <svg viewBox="0 0 160 120" className="hidden sm:block w-28 h-24 shrink-0">
    <circle cx="90" cy="60" r="38" fill="#FBEFDA" />
    <path d="M45 55 L75 42 L75 78 L45 65 Z" fill="#1B2A4A" />
    <rect x="34" y="50" width="12" height="20" rx="3" fill="#1B2A4A" />
    <path d="M75 42 L110 33 L110 87 L75 78 Z" fill="#FAF7F0" stroke="#1B2A4A" strokeWidth="3" />
    <circle cx="100" cy="60" r="4" fill="#1B2A4A" />
    <path d="M118 30 L128 20 M122 60 L134 60 M118 90 L128 100" stroke="#E8A93A" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

  const filtered = activeCategory === 'all' ? notices : notices.filter((n) => n.category === activeCategory);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-3xl text-ink">Notice Board</h1>
            <div className="w-10 h-0.5 bg-amber mt-2 mb-2"></div>
            <p className="text-sm text-slate">Important announcements and updates for you</p>
          </div>
          <HeaderIllustration />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveCategory(tab.value)}
                className={
                  'flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border ' +
                  (active ? 'bg-ink text-paper border-ink' : 'bg-white text-ink border-hairline hover:bg-paper')
                }
              >
                <Icon size={15} strokeWidth={2} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate text-sm">No notices in this category right now.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {filtered.map((n) => {
              const meta = CATEGORY_META[n.category] || CATEGORY_META.general;
              const Icon = meta.icon;
              const badge = badgeForNotice(n);
              return (
                <div key={n._id} className="flex items-start gap-4 bg-white border border-hairline rounded-xl p-4 shadow-sm">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color + '14' }}>
                    <Icon size={18} color={meta.color} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-ink">{n.title}</h3>
                    <p className="text-sm text-slate mt-1">{n.description}</p>
                    <p className="text-xs text-slate mt-2 flex items-center gap-1.5">
                      <span>{n.postedBy?.name}</span>
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ color: meta.color, backgroundColor: meta.color + '14' }}
                      >
                        {meta.label}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-slate flex items-center gap-1">
                      <Calendar size={12} strokeWidth={2} />
                      {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ color: badge.color, backgroundColor: badge.color + '14' }}>
                        {badge.text}
                      </span>
                      <ChevronRight size={16} color="#B8B2A3" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl p-5" style={{ backgroundColor: '#FBEFDA' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber flex items-center justify-center shrink-0">
              <Bell size={18} color="#1B2A4A" strokeWidth={2} fill="#1B2A4A" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Stay updated!</p>
              <p className="text-xs text-slate mt-0.5">Check this section regularly for the latest announcements.</p>
            </div>
          </div>
          <ClipboardCheck size={40} color="#1B2A4A" strokeWidth={1.25} className="hidden sm:block shrink-0" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NoticeBoard;