import { useEffect, useState } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const StudentDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerText, setAnswerText] = useState({});
  const [answering, setAnswering] = useState({});

  const fetchDoubts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/doubts');
      setDoubts(data.doubts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doubts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoubts(); }, []);

  const handleAnswerChange = (id, value) => setAnswerText({ ...answerText, [id]: value });

  const submitAnswer = async (id) => {
    const text = answerText[id];
    if (!text) return;
    setAnswering({ ...answering, [id]: true });
    try {
      await api.post('/doubts/' + id + '/answers', { text });
      setAnswerText({ ...answerText, [id]: '' });
      fetchDoubts();
    } catch (err) {
      setError('Could not submit answer.');
    } finally {
      setAnswering({ ...answering, [id]: false });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Student Doubts</h1>
        <p className="text-xs font-mono text-slate mb-6">answer open questions</p>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : doubts.length === 0 ? (
          <p className="text-slate text-sm">No doubts posted yet.</p>
        ) : (
          <div className="space-y-4">
            {doubts.map((d) => (
              <div key={d._id} className="bg-white border border-hairline rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-ink">{d.title}</h3>
                    <p className="text-xs font-mono text-slate mt-0.5">{d.subject} - by {d.student?.name}</p>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate">{d.status}</span>
                </div>
                <p className="text-sm text-ink/80 mt-2">{d.description}</p>

                {d.answers && d.answers.length > 0 && (
                  <div className="mt-3 border-t border-hairline pt-3 space-y-2">
                    {d.answers.map((a, idx) => (
                      <div key={idx} className="bg-paper rounded p-2">
                        <p className="text-sm text-ink/90">{a.text}</p>
                        <p className="text-xs font-mono text-slate mt-1">- {a.faculty?.name || 'Faculty'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {d.status !== 'resolved' && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={answerText[d._id] || ''}
                      onChange={(e) => handleAnswerChange(d._id, e.target.value)}
                      placeholder="Write an answer..."
                      className="flex-1 border border-hairline rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink"
                    />
                    <button
                      type="button"
                      onClick={() => submitAnswer(d._id)}
                      disabled={answering[d._id]}
                      className="bg-ink text-paper px-4 py-1.5 rounded text-sm hover:bg-ink/90 disabled:opacity-50"
                    >
                      {answering[d._id] ? '...' : 'Answer'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDoubts;