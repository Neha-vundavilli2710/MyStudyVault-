import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import LoginSelector from './pages/LoginSelector';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminFaculty from './pages/AdminFaculty';
import AdminStudents from './pages/AdminStudents';
import AdminReferenceData from './pages/AdminReferenceData';
import AdminContent from './pages/AdminContent';
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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginSelector />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/faculty-login" element={<FacultyLogin />} />  
      <Route path="/register" element={<Register />} />

      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['admin']}><AdminFaculty /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
      <Route path="/admin/reference-data" element={<ProtectedRoute allowedRoles={['admin']}><AdminReferenceData /></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute allowedRoles={['admin']}><AdminContent /></ProtectedRoute>} />

      <Route path="/resources/upload" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><UploadResource /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><ResourceList /></ProtectedRoute>} />
      <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute allowedRoles={['student', 'faculty']}><MyBookmarks /></ProtectedRoute>} />

      <Route path="/doubts" element={<ProtectedRoute allowedRoles={['student']}><MyDoubts /></ProtectedRoute>} />
      <Route path="/faculty/doubts" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><StudentDoubts /></ProtectedRoute>} />

      <Route path="/notices/post" element={<ProtectedRoute allowedRoles={['faculty', 'admin']}><PostNotice /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute><NoticeBoard /></ProtectedRoute>} />

      <Route path="/ask-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;