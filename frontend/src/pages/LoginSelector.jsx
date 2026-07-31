import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginSelector = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [showPasswordStudent, setShowPasswordStudent] = useState(false);
  const [showPasswordFaculty, setShowPasswordFaculty] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingFaculty, setLoadingFaculty] = useState(false);

  const [studentForm, setStudentForm] = useState({
    email: '',
    password: '',
  });
  const [studentErrors, setStudentErrors] = useState({});

  const [facultyForm, setFacultyForm] = useState({
    email: '',
    password: '',
  });
  const [facultyErrors, setFacultyErrors] = useState({});

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (studentErrors[name]) {
      setStudentErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFacultyChange = (e) => {
    const { name, value } = e.target;
    setFacultyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (facultyErrors[name]) {
      setFacultyErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setStudentErrors({});
    setLoadingStudent(true);

    try {
      const { data } = await api.post('/auth/login', studentForm);
      
      if (data.user.role !== 'student') {
        setStudentErrors({ submit: 'This is not a student account.' });
        showToast('Invalid student account', 'error');
        setLoadingStudent(false);
        return;
      }

      localStorage.setItem('token', data.token);
      login(data.user);
      showToast('Welcome back, student!', 'success');
      navigate('/student/dashboard');
    } catch (err) {
      const error = err.response?.data?.message || 'Login failed';
      setStudentErrors({ submit: error });
      showToast(error, 'error');
      setLoadingStudent(false);
    }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    setFacultyErrors({});
    setLoadingFaculty(true);

    try {
      const { data } = await api.post('/auth/login', facultyForm);
      
      if (data.user.role !== 'faculty') {
        setFacultyErrors({ submit: 'This is not a faculty account.' });
        showToast('Invalid faculty account', 'error');
        setLoadingFaculty(false);
        return;
      }

      localStorage.setItem('token', data.token);
      login(data.user);
      showToast('Welcome back, faculty!', 'success');
      navigate('/faculty/dashboard');
    } catch (err) {
      const error = err.response?.data?.message || 'Login failed';
      setFacultyErrors({ submit: error });
      showToast(error, 'error');
      setLoadingFaculty(false);
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

      

      {/* Login Forms */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* STUDENT LOGIN */}
<div
  className="bg-white rounded-2xl shadow-lg border border-hairline overflow-hidden mx-auto"
  style={{ width: "360px" }}
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
      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl">🎓</span>
      </div>

      <h1 className="font-display text-2xl font-bold">
        Student Login
      </h1>

      <p className="text-xs opacity-90 mt-1">
        Access your academic dashboard
      </p>
    </div>
  </div>

  {/* Form */}
  <div className="p-5">

    {studentErrors.submit && (
      <div
        className="mb-4 p-3 rounded-lg text-sm text-red-700"
        style={{ backgroundColor: "#FF6B6B14" }}
      >
        {studentErrors.submit}
      </div>
    )}

    <form
      onSubmit={handleStudentSubmit}
      className="space-y-4"
    >

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1">
          Email Address
        </label>

        <input
          type="email"
          name="email"
          value={studentForm.email}
          onChange={handleStudentChange}
          placeholder="your.email@college.edu"
          required
          className="w-full border border-hairline rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1">
          Password
        </label>

        <div className="relative">

          <input
            type={showPasswordStudent ? "text" : "password"}
            name="password"
            value={studentForm.password}
            onChange={handleStudentChange}
            placeholder="Enter your password"
            required
            className="w-full border border-hairline rounded-xl px-4 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <button
            type="button"
            onClick={() =>
              setShowPasswordStudent(!showPasswordStudent)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
          >
            {showPasswordStudent ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>

        </div>
      </div>
            {/* Remember & Forgot */}
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded"
          />
          <span className="text-slate">
            Remember me
          </span>
        </label>

        <Link
          to="#"
          className="font-semibold hover:underline"
          style={{ color: "#378ADD" }}
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loadingStudent}
        className="w-full py-2.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:opacity-90 disabled:opacity-50 disabled:hover:scale-100"
        style={{ backgroundColor: "#378ADD" }}
      >
        {loadingStudent ? "Logging in..." : "Login"}
      </button>

    </form>

    {/* Register */}
    <div className="text-center mt-5 pt-5 border-t border-hairline">
      <p className="text-sm text-slate">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold hover:underline"
          style={{ color: "#378ADD" }}
        >
          Register here
        </Link>
      </p>
    </div>

  </div>

  

</div>

            {/* FACULTY LOGIN */}
<div
  className="bg-white rounded-2xl shadow-lg border border-hairline overflow-hidden mx-auto"
  style={{ width: "360px" }}
>
  {/* Header */}
  <div
    className="relative overflow-hidden text-center text-white px-6 py-6"
    style={{ backgroundColor: "#8B6BC7" }}
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
      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl">👨‍🏫</span>
      </div>

      <h1 className="font-display text-2xl font-bold">
        Faculty Login
      </h1>

      <p className="text-xs opacity-90 mt-1">
        Manage your courses and students
      </p>
    </div>
  </div>

  {/* Form */}
  <div className="p-5">

    {facultyErrors.submit && (
      <div
        className="mb-4 p-3 rounded-lg text-sm text-red-700"
        style={{ backgroundColor: "#FF6B6B14" }}
      >
        {facultyErrors.submit}
      </div>
    )}

    <form
      onSubmit={handleFacultySubmit}
      className="space-y-4"
    >

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1">
          Email Address
        </label>

        <input
          type="email"
          name="email"
          value={facultyForm.email}
          onChange={handleFacultyChange}
          placeholder="your.email@college.edu"
          required
          className="w-full border border-hairline rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-ink mb-1">
          Password
        </label>

        <div className="relative">

          <input
            type={showPasswordFaculty ? "text" : "password"}
            name="password"
            value={facultyForm.password}
            onChange={handleFacultyChange}
            placeholder="Enter your password"
            required
            className="w-full border border-hairline rounded-xl px-4 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />

          <button
            type="button"
            onClick={() =>
              setShowPasswordFaculty(!showPasswordFaculty)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
          >
            {showPasswordFaculty ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>

        </div>
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded"
          />
          <span className="text-slate">
            Remember me
          </span>
        </label>

        <Link
          to="#"
          className="font-semibold hover:underline"
          style={{ color: "#8B6BC7" }}
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loadingFaculty}
        className="w-full py-2.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:opacity-90 disabled:opacity-50 disabled:hover:scale-100"
        style={{ backgroundColor: "#8B6BC7" }}
      >
        {loadingFaculty ? "Logging in..." : "Login"}
      </button>

    </form>

    {/* Note */}
    <div className="text-center mt-5 pt-5 border-t border-hairline">
      <p className="text-xs text-slate">
        Faculty accounts are created by administrators only.
      </p>
    </div>

  </div>

  

</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelector;