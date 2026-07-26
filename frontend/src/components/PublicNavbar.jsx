import { Link } from 'react-router-dom';

const PublicNavbar = () => {
  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-paper border-b border-hairline shrink-0">
      <span className="font-display text-2xl text-ink">MyStudyVault</span>
      <div className="flex items-center gap-6">
        <Link to="/login" className="text-sm text-ink hover:underline">Log In</Link>
        <Link to="/register" className="text-sm text-ink hover:underline">
          Register
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;