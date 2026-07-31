import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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
      const { data } = await api.post(`/auth/reset-password/${token}`, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      showToast(data.message, 'success');
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password';
      setErrors({ submit: errorMsg });
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} color="#C7576B" className="mx-auto mb-4" />
          <h1 className="font-display text-2xl text-ink mb-2">Invalid Link</h1>
          <p className="text-slate mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/login" className="text-sm font-semibold" style={{ color: '#378ADD' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
          <Link to="/login" className="text-sm font-semibold text-slate hover:text-ink">
            Back to Login
          </Link>
        </div>
      </nav>

      {/* Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#378ADD14' }}>
                  <Lock size={40} color="#378ADD" />
                </div>
              </div>
              <h1 className="font-display text-3xl text-ink mb-2">
                Reset <span style={{ color: '#E8A93A' }}>Password</span>
              </h1>
              <p className="text-slate">Create a new password for your account</p>
            </div>

            {!success ? (
              <>
                {errors.submit && (
                  <div className="mb-6 p-4 rounded-lg text-sm text-red-700 flex items-start gap-3" style={{ backgroundColor: '#FF6B6B14' }}>
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{errors.submit}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">New Password</label>
                    <div className="flex items-center gap-3 border border-hairline rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20" style={{ backgroundColor: '#F8F9FA' }}>
                      <Lock size={20} color="#378ADD" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a new password"
                        className="flex-1 bg-transparent text-sm focus:outline-none text-ink placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate hover:text-ink"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">Confirm Password</label>
                    <div className="flex items-center gap-3 border border-hairline rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20" style={{ backgroundColor: '#F8F9FA' }}>
                      <Lock size={20} color="#378ADD" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        className="flex-1 bg-transparent text-sm focus:outline-none text-ink placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-slate hover:text-ink"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-8"
                    style={{ backgroundColor: '#378ADD' }}
                  >
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3F7D5C14' }}>
                    <CheckCircle2 size={40} color="#3F7D5C" />
                  </div>
                </div>
                <h2 className="font-display text-2xl text-ink mb-3">Password Reset Successful!</h2>
                <p className="text-slate mb-6">
                  Your password has been updated successfully. Redirecting to login...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;