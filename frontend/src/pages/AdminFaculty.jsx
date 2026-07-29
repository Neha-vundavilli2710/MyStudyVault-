import { useEffect, useState } from 'react';
import { Search, Plus, Check, X, Pencil, Ban, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';

const SPECIAL_ROLE_LABELS = {
  'club-coordinator': 'Club Coordinator',
  'nss-ncc': 'NSS / NCC',
  'placement-cell': 'Placement Cell',
  'exam-cell': 'Exam Cell',
};

const emptyForm = {
  name: '',
  email: '',
  password: '',
  facultyId: '',
  department: '',
  assignedBranches: [],
  subjectsHandled: '',
  specialRole: '',
};

const FacultyFormModal = ({ mode, initial, branches, onClose, onSaved }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const toggleBranch = (id) => {
    setForm((f) => ({
      ...f,
      assignedBranches: f.assignedBranches.includes(id)
        ? f.assignedBranches.filter((b) => b !== id)
        : [...f.assignedBranches, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'create' && form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        department: form.department,
        facultyId: form.facultyId,
        assignedBranches: form.assignedBranches,
        subjectsHandled: form.subjectsHandled
          ? form.subjectsHandled.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        specialRole: form.specialRole || null,
      };

      if (mode === 'create') {
        await api.post('/admin/faculty', { ...payload, email: form.email, password: form.password });
        showToast('Faculty account created');
      } else {
        await api.put(`/admin/faculty/${initial._id}`, payload);
        showToast('Faculty updated');
      }
      onSaved();
      onClose();
    } catch (err) {
      // Surface the real backend reason (validation errors, duplicate email, etc.)
      // instead of just the generic top-level message.
      const backendMessage = err.response?.data?.message;
      const backendDetail = err.response?.data?.error;
      setError(backendDetail && backendDetail !== backendMessage ? `${backendMessage}: ${backendDetail}` : backendMessage || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <h2 className="font-display text-lg text-ink">{mode === 'create' ? 'Create Faculty Account' : 'Edit Faculty'}</h2>
          <button type="button" onClick={onClose} className="text-slate hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-slate mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </div>

          {mode === 'create' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
                <p className="text-xs text-slate mt-1">Minimum 6 characters.</p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Faculty ID</label>
              <input
                type="text"
                value={form.facultyId}
                onChange={(e) => setForm({ ...form, facultyId: e.target.value })}
                className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate mb-1">Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">Assigned Branches</label>
            <div className="flex flex-wrap gap-2 border border-hairline rounded-lg p-3 max-h-32 overflow-y-auto">
              {branches.length === 0 && <p className="text-xs text-slate">No branches configured yet — add some in Reference Data first.</p>}
              {branches.map((b) => (
                <button
                  type="button"
                  key={b._id}
                  onClick={() => toggleBranch(b._id)}
                  className={
                    'text-xs px-2.5 py-1 rounded-full border transition-colors ' +
                    (form.assignedBranches.includes(b._id)
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-slate border-hairline hover:border-ink/40')
                  }
                >
                  {b.code}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">Subjects Handled (comma-separated)</label>
            <input
              type="text"
              value={form.subjectsHandled}
              onChange={(e) => setForm({ ...form, subjectsHandled: e.target.value })}
              placeholder="e.g. Data Structures, Operating Systems"
              className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate mb-1">Special Role (optional)</label>
            <select
              value={form.specialRole || ''}
              onChange={(e) => setForm({ ...form, specialRole: e.target.value })}
              className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 bg-white"
            >
              <option value="">None</option>
              {Object.entries(SPECIAL_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-slate mt-1">Grants permission to post notices beyond their own branch (Item 56).</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm text-slate px-4 py-2 rounded-lg hover:bg-paper">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-sm font-medium text-white bg-ink px-4 py-2 rounded-lg hover:bg-ink/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Create Account' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [branches, setBranches] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [modalMode, setModalMode] = useState(null); // null | 'create' | 'edit'
  const [editingFaculty, setEditingFaculty] = useState(null);
  const { showToast } = useToast();

  const limit = 10;

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (branchFilter) params.branch = branchFilter;
      if (approvalFilter) params.isApproved = approvalFilter;

      const { data } = await api.get('/admin/faculty', { params });
      setFaculty(data.faculty);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      showToast('Failed to load faculty', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/reference/branches');
      setBranches(data);
    } catch (err) {
      // non-critical
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchFaculty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, branchFilter, approvalFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFaculty();
  };

  const handleApproval = async (id, isApproved) => {
    try {
      await api.patch(`/admin/faculty/${id}/approval`, { isApproved });
      showToast(isApproved ? 'Faculty approved' : 'Faculty registration rejected');
      fetchFaculty();
    } catch (err) {
      showToast('Failed to update approval status', 'error');
    }
  };

  const handleToggleActive = async (f) => {
    try {
      await api.patch(`/admin/faculty/${f._id}/status`, { isActive: !f.isActive });
      showToast(f.isActive ? 'Faculty deactivated' : 'Faculty reactivated');
      fetchFaculty();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const openEdit = (f) => {
    setEditingFaculty({
      _id: f._id,
      name: f.name,
      facultyId: f.facultyId || '',
      department: f.department || '',
      assignedBranches: (f.assignedBranches || []).map((b) => (typeof b === 'string' ? b : b._id)),
      subjectsHandled: (f.subjectsHandled || []).join(', '),
      specialRole: f.specialRole || '',
    });
    setModalMode('edit');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-8 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-ink mb-1">Faculty Management</h1>
            <p className="text-sm text-slate">{total} faculty account{total !== 1 ? 's' : ''} total</p>
          </div>
          <button
            type="button"
            onClick={() => setModalMode('create')}
            className="flex items-center gap-2 text-sm font-medium text-white bg-ink px-4 py-2.5 rounded-lg hover:bg-ink/90"
          >
            <Plus size={16} strokeWidth={2} />
            Create Faculty Account
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input
              type="text"
              placeholder="Search by name, email, or faculty ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-hairline rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </form>
          <select
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
            className="border border-hairline rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.code}</option>
            ))}
          </select>
          <select
            value={approvalFilter}
            onChange={(e) => { setApprovalFilter(e.target.value); setPage(1); }}
            className="border border-hairline rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Approved</option>
            <option value="false">Pending Approval</option>
          </select>
        </div>

        <div className="bg-white border border-hairline rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate">Loading faculty...</div>
          ) : faculty.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate">No faculty found. Try adjusting your filters.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs font-medium text-slate uppercase tracking-wide">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Branches</th>
                  <th className="px-5 py-3">Special Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {faculty.map((f) => (
                  <tr key={f._id}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-ink">{f.name}</div>
                      <div className="text-xs text-slate">{f.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {f.assignedBranches?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {f.assignedBranches.map((b) => (
                            <span key={b._id} className="text-xs bg-paper border border-hairline rounded-full px-2 py-0.5 text-ink">{b.code}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate">— none —</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {f.specialRole ? (
                        <span className="text-xs bg-amber/20 text-ink rounded-full px-2 py-0.5">{SPECIAL_ROLE_LABELS[f.specialRole]}</span>
                      ) : (
                        <span className="text-xs text-slate">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {!f.isApproved ? (
                        <span className="text-xs font-medium text-amber-700 bg-amber/20 rounded-full px-2 py-0.5">Pending</span>
                      ) : !f.isActive ? (
                        <span className="text-xs font-medium text-red-700 bg-red-50 rounded-full px-2 py-0.5">Deactivated</span>
                      ) : (
                        <span className="text-xs font-medium rounded-full px-2 py-0.5" style={{ color: '#3F7D5C', backgroundColor: '#3F7D5C14' }}>Active</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {!f.isApproved ? (
                          <>
                            <button type="button" onClick={() => handleApproval(f._id, true)} title="Approve" className="p-1.5 rounded-lg hover:bg-paper" style={{ color: '#3F7D5C' }}>
                              <Check size={16} />
                            </button>
                            <button type="button" onClick={() => handleApproval(f._id, false)} title="Reject" className="p-1.5 rounded-lg hover:bg-paper text-red-600">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => openEdit(f)} title="Edit" className="p-1.5 rounded-lg hover:bg-paper text-slate hover:text-ink">
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(f)}
                              title={f.isActive ? 'Deactivate' : 'Reactivate'}
                              className="p-1.5 rounded-lg hover:bg-paper text-slate hover:text-ink"
                            >
                              {f.isActive ? <Ban size={15} /> : <RotateCcw size={15} />}
                            </button>
                          </>
                        )}
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

      {modalMode === 'create' && (
        <FacultyFormModal
          mode="create"
          branches={branches}
          onClose={() => setModalMode(null)}
          onSaved={fetchFaculty}
        />
      )}
      {modalMode === 'edit' && editingFaculty && (
        <FacultyFormModal
          mode="edit"
          initial={editingFaculty}
          branches={branches}
          onClose={() => { setModalMode(null); setEditingFaculty(null); }}
          onSaved={fetchFaculty}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminFaculty;