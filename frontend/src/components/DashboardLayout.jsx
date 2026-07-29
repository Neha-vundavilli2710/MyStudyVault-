import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const bellRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // non-critical
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setBellOpen(false);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <div className="min-h-screen bg-paper">{children}</div>;

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <div className="flex justify-end items-center gap-4 px-8 pt-6">
          <div className="relative" ref={bellRef}>
            <button type="button" onClick={() => setBellOpen(!bellOpen)} className="relative text-slate hover:text-ink">
              <Bell size={19} strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber text-ink text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-hairline rounded-lg shadow-lg z-20">
                <div className="flex justify-between items-center px-4 py-2.5 border-b border-hairline">
                  <span className="text-sm font-medium text-ink">Notifications</span>
                  {unreadCount > 0 && (
                    <button type="button" onClick={handleMarkAllRead} className="text-xs text-amber hover:underline">
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
                        className={'w-full text-left px-4 py-2.5 text-sm border-b border-hairline hover:bg-paper ' + (n.read ? 'text-slate' : 'text-ink font-medium')}
                      >
                        {n.message}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          
        </div>

        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;