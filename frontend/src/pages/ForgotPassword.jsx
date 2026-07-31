import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      showToast(data.message, 'success');
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset email';
      setError(errorMsg);
      showToast(errorMsg, 'error');
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
          <Link to="/login" className="text-sm font-semibold text-slate hover:text-ink">
            Back to Login
          </Link>
        </div>
      </nav>

      {/* Form */}
<div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
  <div className="w-full max-w-md">

    <div className="bg-white rounded-2xl shadow-lg border border-hairline overflow-hidden">

      {/* Header */}
      <div
        className="relative py-8 px-6 text-center text-white overflow-hidden"
        style={{ backgroundColor: "#378ADD" }}
      >

        <div
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-10"
          style={{ backgroundColor: "#ffffff" }}
        ></div>

        <div
          className="absolute -bottom-12 -left-10 w-28 h-28 rounded-full opacity-10"
          style={{ backgroundColor: "#ffffff" }}
        ></div>

        <div className="relative z-10">

          <div className="flex justify-center mb-5">

            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Mail
                size={30}
                color="#ffffff"
              />
            </div>

          </div>

          <h1 className="font-display text-3xl font-bold mb-2">
            Forgot Password
          </h1>

          <p className="text-sm opacity-90">
            Enter your email to receive a password reset link
          </p>

        </div>

      </div>

      {/* Body */}
      <div className="p-8">
        {!submitted ? (
  <>

    {error && (
      <div
        className="mb-5 p-3 rounded-lg text-sm text-red-700 flex items-start gap-2"
        style={{ backgroundColor: "#FF6B6B14" }}
      >
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Email */}
      <div>

        <label className="block text-sm font-semibold text-ink mb-2">
          Email Address
        </label>

        <div
          className="flex items-center gap-3 border border-hairline rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20"
          style={{ backgroundColor: "#F8F9FA" }}
        >

          <Mail
            size={18}
            color="#378ADD"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 bg-transparent text-sm focus:outline-none text-ink placeholder-gray-400"
          />

        </div>

      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#378ADD" }}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

    </form>

    {/* Divider */}
    <div className="my-6 flex items-center gap-3">

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
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "#3F7D5C14" }}
      >
        <CheckCircle2
          size={30}
          color="#3F7D5C"
        />
      </div>

    </div>

    <h2 className="font-display text-3xl font-bold text-ink mb-3">
      Email Sent
    </h2>

    <p className="text-slate text-sm leading-6 mb-6">
      We've sent a password reset link to
      <br />
      <span className="font-semibold text-ink">
        {email}
      </span>
      <br />
      The link will expire in 30 minutes.
    </p>

    <button
      onClick={() => navigate("/login")}
      className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
      style={{ backgroundColor: "#378ADD" }}
    >
      Back to Login
    </button>

    <div className="mt-6 pt-5 border-t border-hairline">

      <p className="text-xs text-slate">
        Didn't receive the email?
      </p>

      <button
        onClick={() => {
          setSubmitted(false);
          setError("");
        }}
        className="mt-2 font-semibold text-sm"
        style={{ color: "#378ADD" }}
      >
        Try Again
      </button>

    </div>

  </div>

)}
      

    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default ForgotPassword;