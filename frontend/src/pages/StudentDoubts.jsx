import { useEffect, useState } from 'react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const statusColor = {
  open: 'text-gray-500',
  answered: 'text-blue-600',
  resolved: 'text-green-600',
};

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

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handleAnswerChange = (id, value) => {
    setAnswerText({ ...answerText, [id]: value });
  };

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
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Student Doubts</h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : doubts.length === 0 ? (
          <p className="text-gray-500 text-sm">No doubts posted yet.</p>
        ) : (
          <div className="space-y-4">
            {doubts.map((d) => (
              <div key={d._id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{d.title}</h3>
                    <p className="text-xs text-gray-400">
                      {d.subject} - by {d.student?.name}
                    </p>
                  </div>
                  <span className={'text-xs font-medium ' + (statusColor[d.status] || 'text-gray-500')}>
                    {d.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{d.description}</p>

                {d.answers && d.answers.length > 0 && (
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                    {d.answers.map((a, idx) => (
                      <div key={idx} className="bg-gray-50 rounded p-2">
                        <p className="text-sm text-gray-700">{a.text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          - {a.faculty?.name || 'Faculty'}
                        </p>
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
                      className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => submitAnswer(d._id)}
                      disabled={answering[d._id]}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
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