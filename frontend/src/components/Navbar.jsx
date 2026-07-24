import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3">
      <span className="font-semibold text-gray-800">MyStudyVault</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user.name} <span className="text-gray-400">({user.role})</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;