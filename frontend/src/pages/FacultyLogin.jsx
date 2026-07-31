import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FacultyLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', formData);
      
      // Check if user is faculty
      if (data.user.role !== 'faculty') {
        setErrors({ submit: 'This account is not authorized as faculty. Please use student login.' });
        showToast('Invalid faculty account', 'error');
        return;
      }

      localStorage.setItem('token', data.token);
      login(data.user);
      showToast('Welcome back, faculty!', 'success');
      navigate('/faculty/dashboard');
    } catch (err) {
      const error = err.response?.data?.message || 'Login failed';
      setErrors({ submit: error });
      showToast(error, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper to-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen size={24} color="#1B2A4A" strokeWidth={2} />
            <span className="font-display text-xl">
              <span className="text-ink">My</span>
              <span style={{ color: '#E8A93A' }}>StudyVault</span>
            </span>
          </Link>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm font-semibold text-slate hover:text-ink"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-hairline overflow-hidden">
            <div 
              className="py-8 px-6 text-center text-white"
              style={{ backgroundColor: '#8B6BC7' }}
            >
              <h1 className="font-display text-3xl font-bold mb-2">Faculty Login</h1>
              <p className="text-sm opacity-90">Manage your courses and students</p>
            </div>

            {/* Form */}
            <div className="p-8">
              {errors.submit && (
                <div className="mb-6 p-4 rounded-lg text-sm text-red-700" style={{ backgroundColor: '#FF6B6B14' }}>
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@college.edu"
                    className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full border border-hairline rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-slate">Remember me</span>
                  </label>
                  <Link to="#" className="font-semibold" style={{ color: '#8B6BC7' }}>
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#8B6BC7' }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-hairline"></div>
                <span className="text-xs text-slate">OR</span>
                <div className="flex-1 h-px bg-hairline"></div>
              </div>

              {/* Student Switch */}
              <div className="text-center">
                <p className="text-sm text-slate mb-2">Are you a student?</p>
                <Link
                  to="/student-login"
                  className="text-sm font-semibold px-4 py-2 rounded-lg border-2 border-slate hover:border-ink hover:text-ink text-slate transition-colors"
                >
                  Login as Student
                </Link>
              </div>

              {/* Note */}
              <div className="text-center mt-6">
                <p className="text-xs text-slate">
                  Faculty accounts are created by administrators only.
                </p>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="h-1" style={{ backgroundColor: '#8B6BC7' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;