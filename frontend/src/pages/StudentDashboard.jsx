import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageCircleQuestion, Bookmark, ArrowRight, Sparkles, FolderSearch, Megaphone, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
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

const FEATURE_CARDS = [
  {
    to: '/resources',
    icon: FolderSearch,
    color: '#378ADD',
    title: 'Browse Resources',
    desc: 'Explore notes, question papers, assignments, and syllabus.',
    action: 'Explore now',
  },
  {
    to: '/bookmarks',
    icon: Bookmark,
    color: '#3F7D5C',
    title: 'My Bookmarks',
    desc: 'Everything you have saved for later, in one place.',
    action: 'View bookmarks',
  },
  {
    to: '/doubts',
    icon: HelpCircle,
    color: '#C7576B',
    title: 'My Doubts',
    desc: 'Ask questions and get real answers from faculty.',
    action: 'Ask now',
  },
  {
    to: '/notices',
    icon: Megaphone,
    color: '#8B6BC7',
    title: 'Notice Board',
    desc: 'Announcements and deadlines relevant to you.',
    action: 'View notices',
  },
  {
    to: '/ask-ai',
    icon: Sparkles,
    color: '#E8A93A',
    title: 'AI Study Assistant',
    desc: 'Ask anything about your course material, get grounded answers.',
    action: 'Start chat',
  },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [doubtSummary, setDoubtSummary] = useState(null);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resourcesRes, doubtsRes, bookmarksRes] = await Promise.all([
          api.get('/resources/recent'),
          api.get('/doubts/summary'),
          api.get('/bookmarks'),
        ]);
        setRecent(resourcesRes.data);
        setDoubtSummary(doubtsRes.data);
        setBookmarkCount(bookmarksRes.data.length);
      } catch (err) {
        // dashboard widgets are non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const subline = [user?.branch, user?.semester ? 'Semester ' + user.semester : null].filter(Boolean).join(' \u00b7 ');

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center font-display text-lg shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
            {subline && <p className="text-xs font-mono text-slate mt-0.5">{subline}</p>}
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-lg p-5 grid grid-cols-3 divide-x divide-hairline mb-9 shadow-sm">
          <div className="flex items-center gap-3 pr-4">
            <HelpCircle size={20} color="#378ADD" strokeWidth={1.75} />
            <div>
              <div className="font-display text-xl text-ink leading-none">{doubtSummary?.open ?? '-'}</div>
              <div className="text-xs font-mono text-slate mt-1">open doubts</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4">
            <MessageCircleQuestion size={20} color="#E8A93A" strokeWidth={1.75} />
            <div>
              <div className="font-display text-xl text-ink leading-none">{doubtSummary?.answered ?? '-'}</div>
              <div className="text-xs font-mono text-slate mt-1">awaiting review</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-4">
            <Bookmark size={20} color="#3F7D5C" strokeWidth={1.75} />
            <div>
              <div className="font-display text-xl text-ink leading-none">{bookmarkCount}</div>
              <div className="text-xs font-mono text-slate mt-1">bookmarked</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-9">
          {FEATURE_CARDS.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.title}
                to={f.to}
                className="bg-white border border-hairline rounded-lg p-5 shadow-sm hover:shadow-md hover:border-ink transition-all flex flex-col"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: f.color + '1A' }}
                >
                  <Icon size={22} color={f.color} strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-medium text-ink">{f.title}</h3>
                <p className="text-sm text-slate mt-1.5 leading-relaxed flex-1">{f.desc}</p>
                <span className="text-xs font-mono mt-4 flex items-center gap-1" style={{ color: f.color }}>
                  {f.action} <ArrowRight size={12} strokeWidth={2} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;