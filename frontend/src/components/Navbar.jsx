import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // silently ignore
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await api.patch('/notifications/' + n._id + '/read');
        setNotifications((prev) => prev.map((item) => (item._id === n._id ? { ...item, read: true } : item)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // ignore
      }
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (err) {
      // ignore
    }
  };

  if (!user) return null;

  return (
    <nav className="flex items-center justify-between bg-ink px-6 py-3.5 relative">
      <span className="font-display text-paper text-lg tracking-tight">MyStudyVault</span>

      <div className="flex items-center gap-5">
        <div className="relative" ref={dropdownRef}>
          <button type="button" onClick={() => setOpen(!open)} className="relative text-paper/70 hover:text-paper">
            <Bell size={18} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber text-ink text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-80 bg-paper border border-hairline rounded-lg shadow-lg z-10">
              <div className="flex justify-between items-center px-4 py-2.5 border-b border-hairline">
                <span className="text-sm font-medium text-ink">Notifications</span>
                {unreadCount > 0 && (
                  <button type="button" onClick={handleMarkAllRead} className="text-xs text-amber hover:underline font-mono">
                    mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate px-4 py-3">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      type="button"
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={
                        'w-full text-left px-4 py-2.5 text-sm border-b border-hairline hover:bg-white ' +
                        (n.read ? 'text-slate' : 'text-ink font-medium')
                      }
                    >
                      {n.message}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span className="text-sm text-paper/80 font-mono">
          {user.name} <span className="text-paper/50">&middot; {user.role}</span>
        </span>
        <button type="button" onClick={handleLogout} className="text-sm text-amber hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;