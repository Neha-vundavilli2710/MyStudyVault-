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
<div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-8">
  <div className="w-full max-w-md">

    <div className="bg-white rounded-2xl shadow-lg border border-hairline overflow-hidden">

      {/* Header */}
      <div
        className="relative py-7 px-6 text-center text-white overflow-hidden"
        style={{ backgroundColor: "#378ADD" }}
      >

        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: "#ffffff" }}
        ></div>

        <div
          className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: "#ffffff" }}
        ></div>

        <div className="relative z-10">

          <div className="flex justify-center mb-4">

            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Lock
                size={26}
                color="#ffffff"
              />
            </div>

          </div>

          <h1 className="font-display text-3xl font-bold mb-2">
            Reset Password
          </h1>

          <p className="text-sm opacity-90">
            Create a secure password for your account
          </p>

        </div>

      </div>

      {/* Body */}
      <div className="p-7">

        {!success ? (
          <>
          {errors.submit && (
  <div
    className="mb-5 p-3 rounded-lg text-sm text-red-700 flex items-start gap-2"
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
  className="space-y-5"
>

  {/* Password */}
  <div>

    <label className="block text-sm font-semibold text-ink mb-2">
      New Password
    </label>

    <div
      className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20"
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

    {errors.password && (
      <p className="text-xs text-red-600 mt-1">
        {errors.password}
      </p>
    )}

  </div>

  {/* Confirm Password */}
  <div>

    <label className="block text-sm font-semibold text-ink mb-2">
      Confirm Password
    </label>

    <div
      className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20"
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
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="text-slate hover:text-ink"
      >
        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

    </div>

    {errors.confirmPassword && (
      <p className="text-xs text-red-600 mt-1">
        {errors.confirmPassword}
      </p>
    )}

  </div>

  {/* Submit */}
  <button
    type="submit"
    disabled={loading}
    className="w-full py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
    style={{ backgroundColor: "#378ADD" }}
  >
    {loading ? "Updating Password..." : "Update Password"}
  </button>

</form>

{/* Divider */}
<div className="my-5 flex items-center gap-3">

  <div className="flex-1 h-px bg-hairline"></div>

  <span className="text-xs text-slate uppercase">
    OR
  </span>

  <div className="flex-1 h-px bg-hairline"></div>

</div>

{/* Back */}
<div className="text-center">

  <p className="text-sm text-slate">
    Remember your password?
  </p>

  <Link
    to="/login"
    className="inline-flex items-center justify-center mt-2 font-semibold"
    style={{ color: "#378ADD" }}
  >
    Back to Login →
  </Link>


</div>
</>
) : (

  <div className="text-center">

    <div className="flex justify-center mb-6">

      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "#3F7D5C14" }}
      >
        <CheckCircle2
          size={26}
          color="#3F7D5C"
        />
      </div>

    </div>

    <h2 className="font-display text-3xl font-bold text-ink mb-3">
      Password Updated
    </h2>

    <p className="text-slate text-sm leading-6 mb-6">
      Your password has been updated successfully.
      <br />
      You can now login using your new password.
    </p>

    <button
      onClick={() => navigate("/login")}
      className="w-full py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
      style={{ backgroundColor: "#378ADD" }}
    >
      Go to Login
    </button>

    <div className="mt-5 pt-5 border-t border-hairline">

      <p className="text-xs text-slate">
        Your account is now secured with the new password.
      </p>

    </div>

  </div>

)}
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

export default ResetPassword;