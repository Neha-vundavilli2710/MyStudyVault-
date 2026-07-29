import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, ExternalLink, Sparkles, MessageSquare, BookOpen } from 'lucide-react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const SUMMARY_TYPES = [
  { value: 'short', label: 'Short Summary' },
  { value: 'detailed', label: 'Detailed Summary' },
  { value: 'key-concepts', label: 'Key Concepts' },
  { value: 'important-points', label: 'Important Points' },
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

const ResourceDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeType, setActiveType] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [cached, setCached] = useState(false);

  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/resources/' + id);
        setResource(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load resource.');
      } finally {
        setLoading(false);
      }
    };
    const fetchSimilar = async () => {
      setSimilarLoading(true);
      try {
        const { data } = await api.get('/resources/' + id + '/similar');
        setSimilar(data);
      } catch (err) {
        setSimilar([]);
      } finally {
        setSimilarLoading(false);
      }
    };
    fetchResource();
    fetchSimilar();
  }, [id]);

  const handleSummarize = async (type) => {
    setActiveType(type);
    setSummary('');
    setSummaryError('');
    setSummaryLoading(true);
    try {
      const { data } = await api.post('/ai/summarize/' + id, { type });
      setSummary(data.content);
      setCached(data.cached);
    } catch (err) {
      setSummaryError(err.response?.data?.error || err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="p-8 text-slate text-sm">Loading...</p>
      </DashboardLayout>
    );
  }

  if (error || !resource) {
    return (
      <DashboardLayout>
        <p className="p-8 text-red-700 text-sm">{error || 'Resource not found.'}</p>
      </DashboardLayout>
    );
  }

  const link = resource.fileUrl || resource.externalLink;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-1.5 text-xs text-slate mb-4">
          <Link to="/student/dashboard" className="hover:text-ink"><Home size={13} strokeWidth={2} /></Link>
          <ChevronRight size={13} strokeWidth={2} />
          <Link to="/resources" className="hover:text-ink">Resources</Link>
          <ChevronRight size={13} strokeWidth={2} />
          <span>{resource.branch}</span>
          <ChevronRight size={13} strokeWidth={2} />
          <span>SEM {resource.semester}</span>
          <ChevronRight size={13} strokeWidth={2} />
          <span>{resource.type}</span>
        </div>

        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">{resource.title}</h1>
            <p className="text-sm text-slate mt-2">{resource.subject}</p>
            {resource.description && <p className="text-sm text-ink/80 mt-1">{resource.description}</p>}
            {link ? (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { data } = await api.get('/resources/' + id + '/download');
                    window.open(data.url, '_blank');
                  } catch (err) {
                    setError('Could not open resource.');
                  }
                }}
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium border border-hairline rounded-lg px-4 py-2 bg-white hover:border-ink transition-colors"
              >
                <ExternalLink size={15} color="#378ADD" strokeWidth={2} />
                Open Resource
              </button>
            ) : null}
          </div>
          <HeaderIllustration />
        </div>

        <div className="bg-white border border-hairline p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} color="#8B6BC7" strokeWidth={1.75} />
            <h2 className="font-display text-lg text-ink">AI Summary</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUMMARY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleSummarize(t.value)}
                className={
                  'text-sm font-medium px-4 py-2 rounded-lg border ' +
                  (activeType === t.value ? 'bg-ink text-paper border-ink' : 'bg-white text-ink border-hairline hover:bg-paper')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {summaryLoading && (
            <div className="flex items-center gap-3 rounded-lg p-4" style={{ backgroundColor: '#F3F1EC' }}>
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                <MessageSquare size={16} color="#8B6BC7" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-slate">Generating...</p>
            </div>
          )}
          {summaryError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">{summaryError}</div>}
          {summary && !summaryLoading && (
            <div className="rounded-lg p-4" style={{ backgroundColor: '#F3F1EC' }}>
              <p className="text-sm text-ink/90 whitespace-pre-line">{summary}</p>
              <p className="text-xs font-mono text-slate mt-2">{cached ? 'loaded from cache' : 'freshly generated'}</p>
            </div>
          )}
          {!summary && !summaryLoading && !summaryError && (
            <div className="flex items-center gap-3 rounded-lg p-4" style={{ backgroundColor: '#F3F1EC' }}>
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                <MessageSquare size={16} color="#8B6BC7" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-ink">Pick a summary type above.</p>
            </div>
          )}
        </div>

        {!similarLoading && similar.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} color="#1B2A4A" strokeWidth={1.75} />
              <h2 className="font-display text-lg text-ink">Related Resources</h2>
            </div>
            <div className="space-y-2.5">
              {similar.map((r) => {
                const tabColor = TYPE_COLOR[r.type] || '#5B6478';
                return (
                  <Link
                    key={r._id}
                    to={'/resources/' + r._id}
                    className="flex items-center gap-4 bg-white border-l-4 border border-hairline rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all p-4"
                    style={{ borderLeftColor: tabColor }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: tabColor + '14' }}>
                      <BookOpen size={17} color={tabColor} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink">{r.title}</div>
                      <div className="text-xs text-slate mt-0.5">{r.branch} &middot; SEM {r.semester} &middot; {r.subject}</div>
                    </div>
                    <ChevronRight size={17} color="#B8B2A3" strokeWidth={2} />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResourceDetail;