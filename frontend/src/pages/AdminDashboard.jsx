import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, Clock, FileText, HelpCircle, CheckCircle2, Megaphone, Building2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const HeroIllustration = () => (
  <svg viewBox="0 0 220 130" className="hidden md:block w-56 h-32 shrink-0">
    <rect x="30" y="30" width="60" height="75" rx="4" fill="#FAF7F0" stroke="#D9C9A3" strokeWidth="2" />
    <rect x="38" y="42" width="44" height="6" rx="1" fill="#1B2A4A" opacity="0.8" />
    <rect x="38" y="55" width="34" height="6" rx="1" fill="#E8A93A" opacity="0.85" />
    <rect x="38" y="68" width="40" height="6" rx="1" fill="#8B6BC7" opacity="0.7" />
    <rect x="38" y="81" width="28" height="6" rx="1" fill="#3F7D5C" opacity="0.7" />
    <circle cx="150" cy="55" r="34" fill="#1B2A4A" opacity="0.08" />
    <circle cx="150" cy="55" r="24" fill="none" stroke="#1B2A4A" strokeWidth="3" />
    <path d="M150 55 L150 38 M150 55 L163 62" stroke="#E8A93A" strokeWidth="3" strokeLinecap="round" />
    <rect x="120" y="95" width="60" height="8" rx="4" fill="#B8A98A" />
  </svg>
);

const StatCard = ({ icon: Icon, color, value, label, sublabel }) => (
  <div className="flex items-center gap-3 bg-white border border-hairline rounded-xl p-4 shadow-sm">
    <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '14' }}>
      <Icon size={19} color={color} strokeWidth={1.75} />
    </div>
    <div>
      <div className="font-display text-xl text-ink leading-none">{value}</div>
      <div className="text-sm font-medium text-ink mt-1">{label}</div>
      <div className="text-xs text-slate">{sublabel}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await api.get('/admin/overview');
        setOverview(data);
      } catch (err) {
        setError('Could not load overview stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-8 pt-4">
        <div className="flex items-center justify-between rounded-xl p-8 mb-8" style={{ backgroundColor: '#FBEFDA' }}>
          <div>
            <p className="text-lg text-ink">Welcome back,</p>
            <h1 className="font-display text-4xl text-ink">{user?.name?.split(' ')[0]}</h1>
            <div className="w-10 h-0.5 bg-amber my-3"></div>
            <p className="text-sm text-slate max-w-sm">A college-wide view of students, faculty, resources, and everything moving through the platform.</p>
          </div>
          <HeroIllustration />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[76px] bg-white border border-hairline rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 mb-8">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <StatCard icon={GraduationCap} color="#378ADD" value={overview.totalStudents} label="Students" sublabel="Registered" />
              <StatCard icon={Users} color="#8B6BC7" value={overview.totalFaculty} label="Faculty" sublabel="Total accounts" />
              <StatCard icon={Clock} color="#E8A93A" value={overview.pendingFacultyApprovals} label="Pending Approvals" sublabel="Faculty awaiting review" />
              <StatCard icon={Building2} color="#3F7D5C" value={overview.totalBranches} label="Branches" sublabel="Configured" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon={FileText} color="#378ADD" value={overview.totalResources} label="Resources" sublabel="Uploaded college-wide" />
              <StatCard icon={HelpCircle} color="#E8A93A" value={overview.doubts.open} label="Open Doubts" sublabel="Awaiting an answer" />
              <StatCard icon={CheckCircle2} color="#3F7D5C" value={overview.doubts.resolved} label="Resolved Doubts" sublabel="All time" />
              <StatCard icon={Megaphone} color="#8B6BC7" value={overview.totalNotices} label="Notices" sublabel="Posted college-wide" />
            </div>
          </>
        )}

        {!loading && overview?.pendingFacultyApprovals > 0 && (
          <div className="flex items-center justify-between bg-white border border-hairline rounded-xl p-5 shadow-sm mb-8" style={{ borderLeftColor: '#E8A93A', borderLeftWidth: '4px' }}>
            <div>
              <h2 className="text-base font-semibold text-ink">{overview.pendingFacultyApprovals} faculty {overview.pendingFacultyApprovals === 1 ? 'account is' : 'accounts are'} waiting on approval</h2>
              <p className="text-sm text-slate mt-1">Review and approve new faculty registrations before they can log in.</p>
            </div>
            <Link to="/admin/faculty" className="text-sm font-medium text-ink bg-paper border border-hairline rounded-lg px-4 py-2 hover:bg-ink/[0.03] whitespace-nowrap">
              Review Faculty
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/faculty" className="bg-white border border-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <Users size={20} color="#1B2A4A" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-ink mt-3">Manage Faculty</h3>
            <p className="text-xs text-slate mt-1">Create, approve, and configure faculty accounts.</p>
          </Link>
          <Link to="/admin/students" className="bg-white border border-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <GraduationCap size={20} color="#1B2A4A" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-ink mt-3">Manage Students</h3>
            <p className="text-xs text-slate mt-1">Search and manage student accounts.</p>
          </Link>
          <Link to="/admin/reference-data" className="bg-white border border-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <Building2 size={20} color="#1B2A4A" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-ink mt-3">Reference Data</h3>
            <p className="text-xs text-slate mt-1">Branches, academic years, and subjects.</p>
          </Link>
          <Link to="/admin/content" className="bg-white border border-hairline rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <FileText size={20} color="#1B2A4A" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-ink mt-3">Content Oversight</h3>
            <p className="text-xs text-slate mt-1">Moderate resources and notices college-wide.</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;