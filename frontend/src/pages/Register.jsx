import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const dashboardPathByRole = {
  student: '/student/dashboard',
  faculty: '/faculty/dashboard',
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    branch: '',
    semester: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...form };
      if (payload.semester) payload.semester = Number(payload.semester);

      const data = await register(payload);
      navigate(dashboardPathByRole[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="font-display text-2xl text-ink">MyStudyVault</span>
          <p className="text-xs font-mono text-slate mt-1">academic knowledge, catalogued</p>
        </div>

        <div className="bg-white border border-hairline rounded-lg p-8">
          <h1 className="font-display text-xl text-ink mb-6">Create your account</h1>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate mb-1.5 uppercase tracking-wide">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate mb-1.5 uppercase tracking-wide">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate mb-1.5 uppercase tracking-wide">I am a</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink">
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            {form.role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-mono text-slate mb-1.5 uppercase tracking-wide">Branch</label>
                  <input type="text" name="branch" value={form.branch} onChange={handleChange} className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate mb-1.5 uppercase tracking-wide">Semester</label>
                  <input type="number" name="semester" value={form.semester} onChange={handleChange} min={1} max={8} className="w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="w-full bg-ink text-paper py-2.5 rounded text-sm font-medium hover:bg-ink/90 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-sm text-slate mt-5 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-ink font-medium hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;