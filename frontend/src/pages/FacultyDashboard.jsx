import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageCircleQuestion, CheckCircle2, ArrowRight, Upload, Megaphone, FolderSearch, TrendingUp } from 'lucide-react';
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
    to: '/resources/upload',
    icon: Upload,
    color: '#E8A93A',
    title: 'Upload Resource',
    desc: 'Add notes, question papers, syllabus, or lab material.',
    action: 'Upload now',
  },
  {
    to: '/resources',
    icon: FolderSearch,
    color: '#378ADD',
    title: 'Browse Resources',
    desc: 'View everything uploaded across every subject.',
    action: 'Browse all',
  },
  {
    to: '/faculty/doubts',
    icon: HelpCircle,
    color: '#C7576B',
    title: 'Student Doubts',
    desc: 'Answer open questions from your students.',
    action: 'View doubts',
  },
  {
    to: '/notices/post',
    icon: Megaphone,
    color: '#8B6BC7',
    title: 'Post Notice',
    desc: 'Announce exams, deadlines, or events to students.',
    action: 'Post now',
  },
];

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [doubtSummary, setDoubtSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resourcesRes, doubtsRes] = await Promise.all([
          api.get('/resources/recent'),
          api.get('/doubts/summary'),
        ]);
        setRecent(resourcesRes.data);
        setDoubtSummary(doubtsRes.data);
      } catch (err) {
        // fail quietly
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center font-display text-lg shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl text-ink">Welcome back, {user?.name?.split(' ')[0]}</h1>
            {user?.department && <p className="text-xs font-mono text-slate mt-0.5">{user.department}</p>}
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
              <div className="text-xs font-mono text-slate mt-1">answered, unresolved</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-4">
            <CheckCircle2 size={20} color="#3F7D5C" strokeWidth={1.75} />
            <div>
              <div className="font-display text-xl text-ink leading-none">{doubtSummary?.resolved ?? '-'}</div>
              <div className="text-xs font-mono text-slate mt-1">resolved</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-9">
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

export default FacultyDashboard;