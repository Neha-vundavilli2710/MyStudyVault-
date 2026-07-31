import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Users, Brain, ArrowRight, CheckCircle2, Zap, GraduationCap, Lock, Globe, Heart, HelpCircle,  Bookmark, Upload, MessageCircle, Bell, BarChart3} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import heroIllustration from "../assets/hero-illustration.png";
const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */
      /* Navigation                                                   */
      /* ============================================================ */}
      <nav className="sticky top-0 z-40 bg-white border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={24} color="#1B2A4A" strokeWidth={2} />
            <span className="font-display text-xl">
              <span className="text-ink">My</span>
              <span style={{ color: '#E8A93A' }}>StudyVault</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              type="button" 
              onClick={() => scrollToSection('features')} 
              className="text-sm text-slate hover:text-ink transition-colors"
            >
              Features
            </button>
            <button 
              type="button" 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-sm text-slate hover:text-ink transition-colors"
            >
              How It Works
            </button>
            <button 
              type="button" 
              onClick={() => scrollToSection('roles')} 
              className="text-sm text-slate hover:text-ink transition-colors"
            >
              Roles
            </button>
          </div>

          <Link 
            to="/login" 
            className="flex items-center gap-2 text-sm font-semibold text-white rounded-lg px-5 py-2.5 hover:opacity-90 transition-all"
            style={{ backgroundColor: '#1B2A4A' }}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* ============================================================ */
      /* Hero Section                                                 */
      /* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-8 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline bg-paper mb-6">
            <Zap size={14} color="#E8A93A" />
            <span className="text-xs font-medium text-ink">Smart Learning. Stronger Together.</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl md:text-6xl leading-tight mb-5 text-ink">
            Your Academic
            <br />
            Knowledge <span style={{ color: '#E8A93A' }}>Hub</span>
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-slate mb-8 max-w-lg leading-relaxed">
            Centralized resources, instant doubt resolution, and AI-powered learning — all in one platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link 
              to="/register" 
              className="flex items-center justify-center gap-2 text-base font-semibold text-white rounded-lg px-7 py-3 hover:opacity-90 transition-all"
              style={{ backgroundColor: '#1B2A4A' }}
            >
              Get Started <ArrowRight size={18} />
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="flex items-center justify-center gap-2 text-base font-semibold text-ink bg-white border-2 border-ink rounded-lg px-7 py-3 hover:bg-ink/5 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="hidden md:block">
          <img 
            src={heroIllustration} 
            alt="Welcome to MyStudyVault - Laptop with books, plant, and floating features" 
            className="w-full h-auto object-contain"
          />
        </div>
      </section>

      {/* ============================================================ */
      /* Stats Strip                                                  */
      /* ============================================================ */}
      <section className="bg-white -mt-5 pb-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-5">

      {/* Stat 1 */}
      <div className="bg-paper border border-hairline rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#378ADD14" }}
        >
          <FileText size={22} color="#378ADD" strokeWidth={1.5} />
        </div>

        <div>
          <div className="font-display text-3xl text-ink leading-none">
            5,234
          </div>
          <div className="text-sm text-slate mt-1">
            Resources
          </div>
        </div>
      </div>

      {/* Stat 2 */}
      <div className="bg-paper border border-hairline rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#E8A93A14" }}
        >
          <Users size={22} color="#E8A93A" strokeWidth={1.5} />
        </div>

        <div>
          <div className="font-display text-3xl text-ink leading-none">
            2,847
          </div>
          <div className="text-sm text-slate mt-1">
            Students
          </div>
        </div>
      </div>

      {/* Stat 3 */}
      <div className="bg-paper border border-hairline rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#8B6BC714" }}
        >
          <GraduationCap size={22} color="#8B6BC7" strokeWidth={1.5} />
        </div>

        <div>
          <div className="font-display text-3xl text-ink leading-none">
            156
          </div>
          <div className="text-sm text-slate mt-1">
            Faculty
          </div>
        </div>
      </div>

      {/* Stat 4 */}
      <div className="bg-paper border border-hairline rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#3F7D5C14" }}
        >
          <CheckCircle2 size={22} color="#3F7D5C" strokeWidth={1.5} />
        </div>

        <div>
          <div className="font-display text-3xl text-ink leading-none">
            8,932
          </div>
          <div className="text-sm text-slate mt-1">
            Resolved
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* ============================================================ */
      /* Features Section                                             */
      /* ============================================================ */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 md:py-20">
  <div className="text-center mb-14">
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline bg-paper mb-3">
      <span className="text-xs font-medium text-ink">✨ All-in-One Academic Platform</span>
    </div>
    <h2 className="font-display text-4xl md:text-5xl text-ink mb-2">
      Powerful <span style={{ color: '#E8A93A' }}>Features</span>
    </h2>
    <p className="text-sm text-slate max-w-2xl mx-auto">Smart tools designed to simplify learning, teaching, and collaboration for students and faculty.</p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Feature 1 */}
    <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#378ADD14' }}>
          <FileText size={24} color="#378ADD" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-display text-lg text-ink">Centralized Resources</h3>
          <p className="text-xs font-semibold" style={{ color: '#378ADD' }}>Organized & Easy to Access</p>
        </div>
      </div>
      <p className="text-sm text-slate mb-3">Upload, organize, and access academic materials by branch, semester, and subject. Find what you need, when you need it.</p>
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#378ADD14' }}>
        <CheckCircle2 size={13} color="#378ADD" />
        <span className="text-xs font-medium text-ink">Notes, Syllabus, Papers & More</span>
      </div>
    </div>

    {/* Feature 2 */}
    <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8A93A14' }}>
          <Users size={24} color="#E8A93A" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-display text-lg text-ink">Instant Doubt Resolution</h3>
          <p className="text-xs font-semibold" style={{ color: '#E8A93A' }}>Faculty Verified Answers</p>
        </div>
      </div>
      <p className="text-sm text-slate mb-3">Post your doubts and get verified answers from faculty in real-time. Track resolution progress without the back-and-forth.</p>
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8A93A14' }}>
        <CheckCircle2 size={13} color="#E8A93A" />
        <span className="text-xs font-medium text-ink">Real Faculty • Real Answers • Real Fast</span>
      </div>
    </div>

    {/* Feature 3 */}
    <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#8B6BC714' }}>
          <Brain size={24} color="#8B6BC7" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-display text-lg text-ink">AI-Powered Assistant</h3>
          <p className="text-xs font-semibold" style={{ color: '#8B6BC7' }}>AI Academic Assistance</p>
        </div>
      </div>
      <p className="text-sm text-slate mb-3">Ask any academic question and get clear, context-aware explanations backed by trusted resources.</p>
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#8B6BC714' }}>
        <CheckCircle2 size={13} color="#8B6BC7" />
        <span className="text-xs font-medium text-ink">Smart • Contextual • Reliable</span>
      </div>
    </div>

    {/* Feature 4 */}
    <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#3F7D5C14' }}>
          <CheckCircle2 size={24} color="#3F7D5C" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-display text-lg text-ink">Smart Notifications</h3>
          <p className="text-xs font-semibold" style={{ color: '#3F7D5C' }}>Never Miss an Update</p>
        </div>
      </div>
      <p className="text-sm text-slate mb-3">Never miss an important update. Get instant alerts for answered doubts, new resources, and announcements.</p>
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#3F7D5C14' }}>
        <CheckCircle2 size={13} color="#3F7D5C" />
        <span className="text-xs font-medium text-ink">Timely • Relevant • Important</span>
      </div>
    </div>
  </div>
</section>

      {/* ============================================================ */
      /* How It Works Section                                         */
      /* ============================================================ */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-16 md:py-20">
  <div className="text-center mb-10">
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline bg-paper mb-3">
      <span className="text-xs font-medium text-ink">🚀 Simple. Smart. Seamless.</span>
    </div>
    <h2 className="font-display text-4xl md:text-5xl text-ink mb-2">
      How It <span style={{ color: '#E8A93A' }}>Works</span>
    </h2>
    <p className="text-sm text-slate max-w-2xl mx-auto">A simple, intuitive workflow for students and faculty.</p>
  </div>

  {/* Steps */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {/* Step 1 */}
    <div className="flex flex-col items-center">
      <div className="relative mb-4 flex items-center justify-center">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl text-white"
          style={{ backgroundColor: '#378ADD' }}
        >
          1
        </div>
        {/* Arrow right (hidden on last) */}
        <div className="hidden md:flex absolute left-full ml-3 items-center">
  <ArrowRight size={20} className="text-slate/70" />
</div>
      </div>
      
      {/* Small illustration */}
      <div className="w-20 h-20 mb-3 flex items-center justify-center opacity-60">
        <FileText size={48} color="#378ADD" />
      </div>
      
      <h3 className="font-display text-lg text-ink mb-2 text-center">Sign Up & Explore</h3>
      <p className="text-sm text-slate text-center mb-3">Create your account, choose your branch and subjects, then start exploring academic resources.</p>
      
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#378ADD14' }}>
        <CheckCircle2 size={12} color="#378ADD" />
        <span className="text-xs font-medium text-ink">Personalized • Quick • Secure</span>
      </div>
    </div>

    {/* Step 2 */}
    <div className="flex flex-col items-center">
      <div className="relative mb-4 flex items-center justify-center">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl text-white"
          style={{ backgroundColor: '#E8A93A' }}
        >
          2
        </div>
        {/* Arrow right (hidden on last) */}
        <div className="hidden md:flex absolute left-full ml-3 items-center">
  <ArrowRight size={20} className="text-slate/70" />
</div>
      </div>
      
      {/* Small illustration */}
      <div className="w-20 h-20 mb-3 flex items-center justify-center opacity-60">
        <Users size={48} color="#E8A93A" />
      </div>
      
      <h3 className="font-display text-lg text-ink mb-2 text-center">Learn & Collaborate</h3>
      <p className="text-sm text-slate text-center mb-3">Browse resources, upload materials, ask doubts, bookmark favorites, and collaborate with your community.</p>
      
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8A93A14' }}>
        <CheckCircle2 size={12} color="#E8A93A" />
        <span className="text-xs font-medium text-ink">Collaborate • Share • Grow</span>
      </div>
    </div>

    {/* Step 3 */}
    <div className="flex flex-col items-center">
      <div className="relative mb-4 flex items-center justify-center">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl text-white"
          style={{ backgroundColor: '#3F7D5C' }}
        >
          3
        </div>
      </div>
      
      {/* Small illustration */}
      <div className="w-20 h-20 mb-3 flex items-center justify-center opacity-60">
        <CheckCircle2 size={48} color="#3F7D5C" />
      </div>
      
      <h3 className="font-display text-lg text-ink mb-2 text-center">Get Answers Instantly</h3>
      <p className="text-sm text-slate text-center mb-3">Get faculty responses and AI-powered guidance to solve academic questions quickly and stay on track.</p>
      
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#3F7D5C14' }}>
        <CheckCircle2 size={12} color="#3F7D5C" />
        <span className="text-xs font-medium text-ink">Fast • Accurate • Reliable</span>
      </div>
    </div>
  </div>
</section>

      {/* ============================================================ */
      /* Student vs Faculty Section                                  */
      /* ============================================================ */}
      <section id="roles" className="max-w-7xl mx-auto px-6 py-12 md:py-16">
  <div className="text-center mb-8">
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
      style={{
        backgroundColor: "#378ADD14",
        color: "#378ADD",
      }}
    >
      👥 Built for Everyone
    </div>

    <h2 className="font-display text-4xl md:text-5xl text-ink mb-2">
      For Students <span style={{ color: "#E8A93A" }}>& Faculty</span>
    </h2>

    <p className="text-sm text-slate max-w-2xl mx-auto">
      Designed to simplify learning for students and teaching for faculty in one
      unified platform.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* For Students */}
    <div className="bg-white border border-hairline rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: "#378ADD20" }}
          >
            👨‍🎓
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">
              For Students
            </h3>
            <p
              className="text-xs font-semibold"
              style={{ color: "#378ADD" }}
            >
              Learn. Explore. Succeed.
            </p>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-3">

        {/* Feature 1 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#378ADD14" }}
          >
            <FileText size={20} color="#378ADD" />
          </div>

          <div>
            <p className="font-semibold text-ink text-sm">
              Access Resources
            </p>

            <p className="text-xs text-slate mt-0.5">
              Browse notes, syllabus, papers and resources.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#378ADD14" }}
          >
            <HelpCircle size={20} color="#378ADD" />
          </div>

          <div>
            <p className="font-semibold text-ink text-sm">
              Ask Doubts
            </p>

            <p className="text-xs text-slate mt-0.5">
              Get verified answers from faculty.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#378ADD14" }}
          >
            <Brain size={20} color="#378ADD" />
          </div>

          <div>
            <p className="font-semibold text-ink text-sm">
              AI Study Help
            </p>

            <p className="text-xs text-slate mt-0.5">
              Learn concepts with AI assistance.
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#378ADD14" }}
          >
            <Bookmark size={20} color="#378ADD" />
          </div>

          <div>
            <p className="font-semibold text-ink text-sm">
              Track Your Progress
            </p>

            <p className="text-xs text-slate mt-0.5">
              Save resources and monitor learning.
            </p>
          </div>
        </div>
      </div>
    </div>
        {/* For Faculty */}
    <div className="bg-white border border-hairline rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: "#8B6BC720" }}
          >
            👨‍🏫
          </div>

          <div>
            <h3 className="font-display text-xl text-ink">
              For Faculty
            </h3>

            <p
              className="text-xs font-semibold"
              style={{ color: "#8B6BC7" }}
            >
              Teach. Support. Inspire.
            </p>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-3">

        {/* Feature 1 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#8B6BC714" }}
          >
            <Upload size={20} color="#8B6BC7" />
          </div>

          <div>
            <p className="font-semibold text-ink text-sm">
              Upload Materials
            </p>

            <p className="text-xs text-slate mt-0.5">
              Upload notes, slides and course materials.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#8B6BC714" }}
          >
            <MessageCircle size={20} color="#8B6BC7" />
          </div>

          <div>
            <p className="font-semibold text-ink text-sm">
              Respond to Doubts
            </p>

            <p className="text-xs text-slate mt-0.5">
              Answer student questions efficiently.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#8B6BC714" }}
          >
            <Bell size={20} color="#8B6BC7" />
          </div>

          <div>
            <p className="font-semibold text-ink text-sm">
              Post Notices
            </p>

            <p className="text-xs text-slate mt-0.5">
              Share announcements and important updates.
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: "#8B6BC714" }}
          >
            <BarChart3 size={20} color="#8B6BC7" />
          </div>

          <div>
            <p className="font-semibold text-ink text-sm">
              Engagement Insights
            </p>

            <p className="text-xs text-slate mt-0.5">
              View learning activity and engagement.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

      

      {/* ============================================================ */
      /* Footer                                                       */
      /* ============================================================ */}
      <footer className="bg-white border-t border-hairline py-6">
  <div className="max-w-7xl mx-auto px-6 text-center">
    <p className="text-sm text-slate">
      &copy; 2026 MyStudyVault. All rights reserved.
    </p>
  </div>
</footer>
    </div>
  );
};

export default Landing;