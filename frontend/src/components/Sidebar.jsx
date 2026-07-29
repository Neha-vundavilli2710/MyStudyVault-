import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, FileSearch, Bookmark, HelpCircle, Sparkles, Megaphone, Upload, Users, ChevronDown, GraduationCap, Layers, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STUDENT_LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: Home },
  { to: '/resources', label: 'Resources', icon: FileSearch },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/doubts', label: 'My Doubts', icon: HelpCircle },
  { to: '/ask-ai', label: 'AI Assistant', icon: Sparkles },
  { to: '/notices', label: 'Notice Board', icon: Megaphone },
];

const FACULTY_LINKS = [
  { to: '/faculty/dashboard', label: 'Dashboard', icon: Home },
  { to: '/resources/upload', label: 'Upload Resource', icon: Upload },
  { to: '/resources', label: 'Resources', icon: FileSearch },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/faculty/doubts', label: 'Student Doubts', icon: Users },
  { to: '/notices/post', label: 'Post Notice', icon: Megaphone },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Overview', icon: Home },
  { to: '/admin/faculty', label: 'Faculty', icon: Users },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/reference-data', label: 'Reference Data', icon: Layers },
  { to: '/admin/content', label: 'Content Oversight', icon: ShieldCheck },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const links = user.role === 'faculty' ? FACULTY_LINKS : user.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;
  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-hairline h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <BookOpen size={22} color="#1B2A4A" strokeWidth={2} />
          <span className="font-display text-lg">
            <span className="text-ink">My</span>
            <span style={{ color: '#E8A93A' }}>StudyVault</span>
          </span>
        </div>
        {user.role === 'faculty' && <p className="text-xs text-slate mt-1 ml-1">Faculty Portal</p>}
        {user.role === 'admin' && <p className="text-xs text-slate mt-1 ml-1">Admin Console</p>}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to + link.label}
              to={link.to}
              className={
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
                (active ? 'bg-ink/[0.06] text-ink' : 'text-slate hover:bg-ink/[0.03] hover:text-ink')
              }
            >
              <Icon size={18} color={active ? '#1B2A4A' : '#5B6478'} strokeWidth={1.75} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative px-3 py-4 border-t border-hairline" ref={menuRef}>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-paper">
          <div className="w-9 h-9 rounded-full bg-ink text-paper flex items-center justify-center text-sm font-display shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-ink truncate">{user.name}</div>
            <div className="text-xs text-slate">{roleLabel}</div>
          </div>
          <ChevronDown size={15} color="#5B6478" strokeWidth={2} />
        </button>

        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-hairline rounded-lg shadow-lg overflow-hidden">
            <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-paper">
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;