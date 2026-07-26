import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const SUMMARY_TYPES = [
  { value: 'short', label: 'Short Summary' },
  { value: 'detailed', label: 'Detailed Summary' },
  { value: 'key-concepts', label: 'Key Concepts' },
  { value: 'important-points', label: 'Important Points' },
];

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
    fetchResource();
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
      setSummaryError(err.response?.data?.message || 'Failed to generate summary.');
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
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-xs font-mono text-slate mb-2">
          {resource.branch} &middot; SEM {resource.semester} &middot; {resource.type}
        </p>
        <h1 className="font-display text-2xl text-ink">{resource.title}</h1>
        <p className="text-sm text-slate mt-1">{resource.subject}</p>

        {resource.description && (
          <p className="text-sm text-ink/80 mt-3">{resource.description}</p>
        )}
        {link ? (
          <a href={link} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm font-mono text-ink hover:underline">
            open resource &rarr;
          </a>
        ) : null}

        <div className="mt-8 bg-white border border-hairline p-5 rounded-lg">
          <h2 className="font-display text-lg text-ink mb-3">AI Summary</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {SUMMARY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleSummarize(t.value)}
                className={
                  'text-xs font-mono px-3 py-1.5 rounded border ' +
                  (activeType === t.value
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-white text-ink border-hairline hover:bg-paper')
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {summaryLoading && <p className="text-sm text-slate">Generating...</p>}

          {summaryError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
              {summaryError}
            </div>
          )}

          {summary && !summaryLoading && (
            <div>
              <p className="text-sm text-ink/90 whitespace-pre-line">{summary}</p>
              <p className="text-xs font-mono text-slate mt-2">
                {cached ? 'loaded from cache' : 'freshly generated'}
              </p>
            </div>
          )}

          {!summary && !summaryLoading && !summaryError && (
            <p className="text-sm text-slate">Pick a summary type above.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceDetail;