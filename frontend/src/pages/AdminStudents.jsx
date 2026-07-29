import { useEffect, useState } from 'react';
import { Search, Ban, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const { showToast } = useToast();

  const limit = 10;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (branchFilter) params.branch = branchFilter;
      if (semesterFilter) params.semester = semesterFilter;

      const { data } = await api.get('/admin/students', { params });
      setStudents(data.students);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, semesterFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleBranchFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleActive = async (s) => {
    try {
      await api.patch(`/admin/students/${s._id}/status`, { isActive: !s.isActive });
      showToast(s.isActive ? 'Student deactivated' : 'Student reactivated');
      fetchStudents();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-8 pt-4">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-ink mb-1">Student Management</h1>
          <p className="text-sm text-slate">{total} student{total !== 1 ? 's' : ''} registered</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input
              type="text"
              placeholder="Search by name, email, or college ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-hairline rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </form>
          <form onSubmit={handleBranchFilterSubmit} className="w-48">
            <input
              type="text"
              placeholder="Filter by branch text..."
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full border border-hairline rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </form>
          <select
            value={semesterFilter}
            onChange={(e) => { setSemesterFilter(e.target.value); setPage(1); }}
            className="border border-hairline rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-hairline rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate">No students found. Try adjusting your filters.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs font-medium text-slate uppercase tracking-wide">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">College ID</th>
                  <th className="px-5 py-3">Branch</th>
                  <th className="px-5 py-3">Semester</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {students.map((s) => (
                  <tr key={s._id}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-ink">{s.name}</div>
                      <div className="text-xs text-slate">{s.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate">{s.collegeId || '—'}</td>
                    <td className="px-5 py-3.5 text-slate">{s.branch || '—'}</td>
                    <td className="px-5 py-3.5 text-slate">{s.semester ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      {s.isActive ? (
                        <span className="text-xs font-medium rounded-full px-2 py-0.5" style={{ color: '#3F7D5C', backgroundColor: '#3F7D5C14' }}>Active</span>
                      ) : (
                        <span className="text-xs font-medium text-red-700 bg-red-50 rounded-full px-2 py-0.5">Deactivated</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(s)}
                          title={s.isActive ? 'Deactivate' : 'Reactivate'}
                          className="p-1.5 rounded-lg hover:bg-paper text-slate hover:text-ink"
                        >
                          {s.isActive ? <Ban size={15} /> : <RotateCcw size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg border border-hairline bg-white disabled:opacity-40 hover:bg-paper"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-hairline bg-white disabled:opacity-40 hover:bg-paper"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;