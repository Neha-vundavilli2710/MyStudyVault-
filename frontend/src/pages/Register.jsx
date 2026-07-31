import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Reference data
  const [branches, setBranches] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeId: '',
    branch: '',
    semester: '',
  });

  const [errors, setErrors] = useState({});

  // Load reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const branchRes = await api.get('/reference/branches');
        setBranches(branchRes.data);
      } catch (err) {
        console.error('Error loading branches:', err);
      }
    };
    fetchReferenceData();
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.collegeId) newErrors.collegeId = 'College ID is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'student',
        collegeId: formData.collegeId,
        branch: formData.branch,
        semester: formData.semester,
      };

      const { data } = await api.post('/auth/register', payload);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data));
      
      showToast('Registration successful! Welcome to MyStudyVault!', 'success');
      
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 500);
    } catch (err) {
      const error = err.response?.data?.message || 'Registration failed';
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
          <Link to="/" className="text-sm font-semibold text-slate hover:text-ink">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Register Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-hairline overflow-hidden">
            {/* Header */}
            <div 
              className="py-8 px-6 text-center text-white"
              style={{ backgroundColor: '#378ADD' }}
            >
              <h1 className="font-display text-3xl font-bold mb-2">Student Registration</h1>
              <p className="text-sm opacity-90">Create your account and start learning</p>
            </div>

            {/* Form */}
            <div className="p-8">
              {errors.submit && (
                <div className="mb-6 p-4 rounded-lg text-sm text-red-700 flex items-start gap-3" style={{ backgroundColor: '#FF6B6B14' }}>
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@college.edu"
                    required
                    className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* College ID */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">College ID</label>
                  <input
                    type="text"
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleChange}
                    placeholder="23P31A4272"
                    required
                    className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                  {errors.collegeId && <p className="text-xs text-red-600 mt-1">{errors.collegeId}</p>}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Branch</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.code} - {b.name}
                      </option>
                    ))}
                  </select>
                  {errors.branch && <p className="text-xs text-red-600 mt-1">{errors.branch}</p>}
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Semester</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                    className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                  {errors.semester && <p className="text-xs text-red-600 mt-1">{errors.semester}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      required
                      className="w-full border border-hairline rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-hairline rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(passwordStrength / 4) * 100}%`,
                            backgroundColor:
                              passwordStrength === 1
                                ? '#ff6b6b'
                                : passwordStrength === 2
                                ? '#ffa724'
                                : passwordStrength === 3
                                ? '#ffd43b'
                                : '#51cf66',
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate">
                        {passwordStrength === 1 && 'Weak'}
                        {passwordStrength === 2 && 'Fair'}
                        {passwordStrength === 3 && 'Good'}
                        {passwordStrength === 4 && 'Strong'}
                      </span>
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required
                      className="w-full border border-hairline rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && !errors.confirmPassword && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Passwords match
                    </p>
                  )}
                  {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-6"
                  style={{ backgroundColor: '#378ADD' }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-6 pt-6 border-t border-hairline">
                <p className="text-sm text-slate">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold" style={{ color: '#378ADD' }}>
                    Login here
                  </Link>
                </p>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="h-1" style={{ backgroundColor: '#378ADD' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;