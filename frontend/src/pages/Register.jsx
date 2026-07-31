import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Building2, Eye, EyeOff, Lock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

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
  const [passwordValid, setPasswordValid] = useState(false);

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

  const validatePassword = (password) => {
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    return hasLetters && hasNumbers && isLongEnough;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      setPasswordValid(validatePassword(value));
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
    if (!validatePassword(formData.password)) newErrors.password = 'Password must have at least 8 characters with letters and numbers';
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
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-hairline">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
<div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-8">
  <div className="w-full max-w-xl">

    <div
      className="bg-white rounded-2xl shadow-lg border border-hairline overflow-hidden mx-auto"
    >

      {/* Header */}
      <div
        className="relative overflow-hidden text-center text-white px-6 py-6"
        style={{ backgroundColor: "#378ADD" }}
      >

        <div
          className="absolute -top-16 -right-14 w-40 h-40 rounded-full opacity-10"
          style={{ backgroundColor: "#ffffff" }}
        ></div>

        <div
          className="absolute -bottom-12 -left-10 w-28 h-28 rounded-full opacity-10"
          style={{ backgroundColor: "#ffffff" }}
        ></div>

        <div className="relative z-10">

          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "#ffffff22" }}
          >
            <span className="text-2xl">👨‍🎓</span>
          </div>

          <h1 className="font-display text-2xl font-bold">
            Student Registration
          </h1>

          <p className="text-xs opacity-90 mt-1">
            Create your account to start learning
          </p>

        </div>
      </div>

      {/* Form */}
      <div className="p-5">

        {/* Error Message */}
        {errors.submit && (
          <div
            className="mb-4 p-3 rounded-lg text-sm text-red-700 flex items-start gap-3"
            style={{ backgroundColor: "#FF6B6B14" }}
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{errors.submit}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Full Name */}
          <div>

            <label className="block text-sm font-semibold text-ink mb-1">
              Full Name
            </label>

            <div
              className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20"
              style={{ backgroundColor: "#F8F9FA" }}
            >

              <User
                size={18}
                color="#378ADD"
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="flex-1 bg-transparent text-sm focus:outline-none text-ink placeholder-gray-400"
              />

            </div>

            {errors.name && (
              <p className="text-xs text-red-600 mt-1">
                {errors.name}
              </p>
            )}

          </div>

          {/* Email */}
          <div>

            <label className="block text-sm font-semibold text-ink mb-1">
              Email Address
            </label>

            <div
              className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20"
              style={{ backgroundColor: "#F8F9FA" }}
            >

              <Mail
                size={18}
                color="#378ADD"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="flex-1 bg-transparent text-sm focus:outline-none text-ink placeholder-gray-400"
              />

            </div>

            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email}
              </p>
            )}

          </div>
                    {/* College ID */}
          <div>

            <label className="block text-sm font-semibold text-ink mb-1">
              College ID
            </label>

            <div
              className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20"
              style={{ backgroundColor: "#F8F9FA" }}
            >

              <Building2
                size={18}
                color="#378ADD"
              />

              <input
                type="text"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                placeholder="Enter your college ID"
                className="flex-1 bg-transparent text-sm focus:outline-none text-ink placeholder-gray-400"
              />

            </div>

            {errors.collegeId && (
              <p className="text-xs text-red-600 mt-1">
                {errors.collegeId}
              </p>
            )}

          </div>

          {/* Branch & Semester */}
          <div className="grid grid-cols-2 gap-4">

            {/* Branch */}
            <div>

              <label className="block text-sm font-semibold text-ink mb-1">
                Branch
              </label>

              <div
                className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20"
                style={{ backgroundColor: "#F8F9FA" }}
              >

                <Building2
                  size={18}
                  color="#378ADD"
                />

                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-ink"
                >
                  <option value="">Select Branch</option>

                  {branches.map((b) => (
                    <option
                      key={b._id}
                      value={b._id}
                    >
                      {b.code}
                    </option>
                  ))}

                </select>

              </div>

              {errors.branch && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.branch}
                </p>
              )}

            </div>

            {/* Semester */}
            <div>

              <label className="block text-sm font-semibold text-ink mb-1">
                Semester
              </label>

              <div
                className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20"
                style={{ backgroundColor: "#F8F9FA" }}
              >

                <Calendar
                  size={18}
                  color="#378ADD"
                />

                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-ink"
                >
                  <option value="">Select Semester</option>

                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option
                      key={s}
                      value={s}
                    >
                      {s}
                    </option>
                  ))}

                </select>

              </div>

              {errors.semester && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.semester}
                </p>
              )}

            </div>

          </div>
                    {/* Password */}
          <div>

            <label className="block text-sm font-semibold text-ink mb-1">
              Password
            </label>

            <div
              className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20"
              style={{ backgroundColor: "#F8F9FA" }}
            >

              <Lock
                size={18}
                color="#378ADD"
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="flex-1 bg-transparent text-sm focus:outline-none text-ink placeholder-gray-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate hover:text-ink transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {formData.password && (
              <div
                className={`text-xs font-medium mt-2 flex items-center gap-2 ${
                  passwordValid ? "text-green-600" : "text-slate"
                }`}
              >
                <CheckCircle2
                  size={14}
                  style={{
                    color: passwordValid ? "#3F7D5C" : "#ccc",
                  }}
                />
                Minimum 8 characters with letters and numbers
              </div>
            )}

            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.password}
              </p>
            )}

          </div>

          {/* Confirm Password */}
          <div>

            <label className="block text-sm font-semibold text-ink mb-1">
              Confirm Password
            </label>

            <div
              className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/20"
              style={{ backgroundColor: "#F8F9FA" }}
            >

              <Lock
                size={18}
                color="#378ADD"
              />

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="flex-1 bg-transparent text-sm focus:outline-none text-ink placeholder-gray-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="text-slate hover:text-ink transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                {errors.confirmPassword}
              </p>
            )}

          </div>
                    {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:opacity-90 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#378ADD" }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-hairline"></div>

          <span className="text-xs text-slate uppercase tracking-wider">
            OR
          </span>

          <div className="flex-1 h-px bg-hairline"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">

          <p className="text-sm text-slate">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1 mt-2 font-semibold hover:underline"
            style={{ color: "#378ADD" }}
          >
            Sign In →
          </Link>

        </div>

      </div>

      {/* Bottom Accent */}
      <div
        className="h-1"
        style={{ backgroundColor: "#378ADD" }}
      ></div>

    </div>
  </div>
</div>
        </div>
  );
};

export default Register;