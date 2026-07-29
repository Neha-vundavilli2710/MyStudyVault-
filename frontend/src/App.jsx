import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadResource from './pages/UploadResource';
import ResourceList from './pages/ResourceList';
import ResourceDetail from './pages/ResourceDetail';
import MyBookmarks from './pages/MyBookmarks';
import MyDoubts from './pages/MyDoubts';
import StudentDoubts from './pages/StudentDoubts';
import PostNotice from './pages/PostNotice';
import NoticeBoard from './pages/NoticeBoard';
import AskAI from './pages/AskAI';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="/resources/upload" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><UploadResource /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><ResourceList /></ProtectedRoute>} />
      <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute allowedRoles={['student', 'faculty']}><MyBookmarks /></ProtectedRoute>} />

      <Route path="/doubts" element={<ProtectedRoute allowedRoles={['student']}><MyDoubts /></ProtectedRoute>} />
      <Route path="/faculty/doubts" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><StudentDoubts /></ProtectedRoute>} />

      <Route path="/notices/post" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><PostNotice /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute><NoticeBoard /></ProtectedRoute>} />

      <Route path="/ask-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;