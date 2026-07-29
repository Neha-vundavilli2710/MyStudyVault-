import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageCircle, CheckCircle2, Upload, FileText } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const TYPE_META = {
  'lecture-notes': { color: '#378ADD', label: 'Lecture Notes' },
  assignment: { color: '#8B6BC7', label: 'Assignments' },
  'question-paper': { color: '#E8A93A', label: 'Question Papers' },
  syllabus: { color: '#3F7D5C', label: 'Syllabus' },
  'lab-material': { color: '#C7576B', label: 'Lab Material' },
  'reference-material': { color: '#9C8862', label: 'Reference Material' },
  'external-link': { color: '#9C8862', label: 'External Links' },
  other: { color: '#8A8478', label: 'Others' },
};

const getExt = (r) => {
  if (r.type === 'external-link' || !r.fileUrl) return 'LINK';
  const parts = r.fileUrl.split('?')[0].split('.');
  const ext = parts.length > 1 ? parts.pop().toUpperCase() : '';
  return ext && ext.length <= 4 ? ext : 'FILE';
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return Math.max(1, Math.floor(seconds / 60)) + ' min ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
  const days = Math.floor(seconds / 86400);
  if (days === 1) return 'Yesterday';
  return days + ' days ago';
};

const HeroIllustration = () => (
  <svg viewBox="0 0 220 130" className="hidden md:block w-56 h-32 shrink-0">
    <rect x="10" y="20" width="14" height="45" rx="2" fill="#1B2A4A" />
    <rect x="26" y="15" width="14" height="50" rx="2" fill="#378ADD" />
    <rect x="42" y="25" width="14" height="40" rx="2" fill="#E8A93A" />
    <rect x="10" y="65" width="46" height="4" fill="#B8A98A" />

    <rect x="70" y="10" width="70" height="55" rx="4" fill="#FAF7F0" stroke="#D9C9A3" strokeWidth="2" />
    <circle cx="76" cy="18" r="1.5" fill="#C7576B" />
    <rect x="76" y="26" width="30" height="10" rx="1" fill="#E8A93A" opacity="0.85" />
    <rect x="76" y="40" width="40" height="10" rx="1" fill="#8B6BC7" opacity="0.7" />

    <rect x="55" y="90" width="55" height="35" rx="3" fill="#1B2A4A" />
    <rect x="58" y="93" width="49" height="26" rx="2" fill="#DDE6F0" />
    <rect x="45" y="123" width="80" height="6" rx="2" fill="#B8A98A" />

    <rect x="10" y="105" width="30" height="18" rx="2" fill="#8B6BC7" />
    <path d="M10 108 L25 100 L40 108" fill="none" stroke="#8B6BC7" strokeWidth="2" />

    <rect x="180" y="30" width="8" height="55" rx="2" fill="#3F7D5C" />
    <ellipse cx="184" cy="24" rx="14" ry="9" fill="#3F7D5C" opacity="0.5" />
    <rect x="165" y="85" width="38" height="30" rx="4" fill="#FAF7F0" />
    <rect x="200" y="90" width="6" height="8" fill="#E8A93A" />
    <rect x="170" y="55" width="10" height="14" rx="1" fill="#C7576B" transform="rotate(-8 175 62)" />
  </svg>
);

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [doubtSummary, setDoubtSummary] = useState(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [typeSummary, setTypeSummary] = useState({ summary: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resourcesRes, doubtsRes, mineRes, typeRes] = await Promise.all([
          api.get('/resources/recent'),
          api.get('/doubts/summary'),
          api.get('/resources', { params: { mine: 'true', limit: 1 } }),
          api.get('/resources/type-summary'),
        ]);
        setRecent(resourcesRes.data);
        setDoubtSummary(doubtsRes.data);
        setUploadedCount(mineRes.data.total || 0);
        setTypeSummary(typeRes.data);
      } catch (err) {
        // non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const segments = typeSummary.summary.map((s) => {
    const meta = TYPE_META[s._id] || TYPE_META.other;
    const pct = typeSummary.total > 0 ? s.count / typeSummary.total : 0;
    const length = pct * circumference;
    const seg = { ...meta, count: s.count, length, offset: cumulative };
    cumulative += length;
    return seg;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-8 pt-4">
        <div className="flex items-center justify-between rounded-xl p-8 mb-8" style={{ backgroundColor: '#FBEFDA' }}>
          <div>
            <p className="text-lg text-ink">Good {new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},</p>
            <h1 className="font-display text-4xl text-ink">{user?.name?.split(' ')[0]}</h1>
            <div className="w-10 h-0.5 bg-amber my-3"></div>
            <p className="text-sm text-slate max-w-sm">Manage your resources, support students, and simplify your teaching workflow.</p>
          </div>
          <HeroIllustration />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#378ADD14' }}>
              <HelpCircle size={19} color="#378ADD" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-xl text-ink leading-none">{doubtSummary?.open ?? 0}</div>
              <div className="text-sm font-medium text-ink mt-1">Open Doubts</div>
              <div className="text-xs text-slate">Awaiting response</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8A93A14' }}>
              <MessageCircle size={19} color="#E8A93A" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-xl text-ink leading-none">{doubtSummary?.answered ?? 0}</div>
              <div className="text-sm font-medium text-ink mt-1">Answered</div>
              <div className="text-xs text-slate">Unresolved</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#3F7D5C14' }}>
              <CheckCircle2 size={19} color="#3F7D5C" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-xl text-ink leading-none">{doubtSummary?.resolved ?? 0}</div>
              <div className="text-sm font-medium text-ink mt-1">Resolved</div>
              <div className="text-xs text-slate">By students</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#8B6BC714' }}>
              <Upload size={19} color="#8B6BC7" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-display text-xl text-ink leading-none">{uploadedCount}</div>
              <div className="text-sm font-medium text-ink mt-1">Resources Uploaded</div>
              <div className="text-xs text-slate">Total by you</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white border border-hairline rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-4">Your Recent Uploads</h2>
            {loading ? (
              <p className="text-sm text-slate">Loading...</p>
            ) : recent.length === 0 ? (
              <p className="text-sm text-slate">You haven't uploaded anything yet.</p>
            ) : (
              <div className="divide-y divide-hairline">
                {recent.map((r) => {
                  const meta = TYPE_META[r.type] || TYPE_META.other;
                  return (
                    <Link key={r._id} to={'/resources/' + r._id} className="flex items-center justify-between py-3 hover:bg-paper -mx-2 px-2 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-mono font-bold text-white" style={{ backgroundColor: meta.color }}>
                          {getExt(r)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink">{r.title}</div>
                          <div className="text-xs text-slate mt-0.5">{meta.label}</div>
                        </div>
                      </div>
                      <span className="text-xs text-slate whitespace-nowrap">{timeAgo(r.createdAt)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            {!loading && uploadedCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate border-t border-hairline mt-2 pt-3">
                <FileText size={15} strokeWidth={1.75} />
                Total <span className="font-semibold text-ink">{uploadedCount}</span> resources uploaded
              </div>
            )}
          </div>

          <div className="bg-white border border-hairline rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink mb-4">Resource Type Overview</h2>
            {typeSummary.total === 0 ? (
              <p className="text-sm text-slate">No resources yet.</p>
            ) : (
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
                  {segments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={seg.length + ' ' + (circumference - seg.length)}
                      strokeDashoffset={-seg.offset}
                      transform="rotate(-90 60 60)"
                    />
                  ))}
                  <text x="60" y="56" textAnchor="middle" className="font-display" fontSize="22" fill="#1B2A4A">{typeSummary.total}</text>
                  <text x="60" y="72" textAnchor="middle" fontSize="9" fill="#5B6478">Total</text>
                </svg>
                <div className="space-y-1.5 flex-1">
                  {segments.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                        <span className="text-ink">{seg.label}</span>
                      </div>
                      <span className="font-medium text-ink">{seg.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;