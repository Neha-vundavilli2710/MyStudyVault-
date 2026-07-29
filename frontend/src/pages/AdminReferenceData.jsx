import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';

const SEMESTERS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

const TABS = [
  { key: 'branches', label: 'Branches' },
  { key: 'years', label: 'Academic Years' },
  { key: 'subjects', label: 'Subjects' },
];

/* ------------------------------------------------------------------ */
/* Simple confirm-delete modal, reused across all three tabs           */
/* ------------------------------------------------------------------ */
const ConfirmDeleteModal = ({ label, onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
      <h3 className="font-display text-lg text-ink mb-2">Delete {label}?</h3>
      <p className="text-sm text-slate mb-5">This can't be undone. Anything referencing it elsewhere may need to be updated.</p>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="text-sm text-slate px-4 py-2 rounded-lg hover:bg-paper">Cancel</button>
        <button type="button" onClick={onConfirm} className="text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700">Delete</button>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Branches tab                                                       */
/* ------------------------------------------------------------------ */
const BranchesTab = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create
  const [form, setForm] = useState({ name: '', code: '' });
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/branches');
      setBranches(data);
    } catch (err) {
      showToast('Failed to load branches', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '' }); setError(''); setModalOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, code: b.code }); setError(''); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/admin/branches/${editing._id}`, form);
        showToast('Branch updated');
      } else {
        await api.post('/admin/branches', form);
        showToast('Branch added');
      }
      setModalOpen(false);
      fetchBranches();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleToggleActive = async (b) => {
    try {
      await api.put(`/admin/branches/${b._id}`, { isActive: !b.isActive });
      fetchBranches();
    } catch (err) {
      showToast('Failed to update branch', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/branches/${deleting._id}`);
      showToast('Branch deleted');
      setDeleting(null);
      fetchBranches();
    } catch (err) {
      showToast('Failed to delete branch', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button type="button" onClick={openCreate} className="flex items-center gap-2 text-sm font-medium text-white bg-ink px-4 py-2.5 rounded-lg hover:bg-ink/90">
          <Plus size={16} /> Add Branch
        </button>
      </div>

      <div className="bg-white border border-hairline rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading...</div>
        ) : branches.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate">No branches yet. Add your first one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs font-medium text-slate uppercase tracking-wide">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {branches.map((b) => (
                <tr key={b._id}>
                  <td className="px-5 py-3.5 font-medium text-ink">{b.code}</td>
                  <td className="px-5 py-3.5 text-slate">{b.name}</td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(b)}
                      className="text-xs font-medium rounded-full px-2 py-0.5"
                      style={b.isActive ? { color: '#3F7D5C', backgroundColor: '#3F7D5C14' } : { color: '#5B6478', backgroundColor: '#5B647814' }}
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-paper text-slate hover:text-ink"><Pencil size={15} /></button>
                      <button type="button" onClick={() => setDeleting(b)} className="p-1.5 rounded-lg hover:bg-paper text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
              <h2 className="font-display text-lg text-ink">{editing ? 'Edit Branch' : 'Add Branch'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate hover:text-ink"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Branch Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20" placeholder="e.g. Computer Science and Engineering" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Code</label>
                <input type="text" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20" placeholder="e.g. CSE" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="text-sm text-slate px-4 py-2 rounded-lg hover:bg-paper">Cancel</button>
                <button type="submit" className="text-sm font-medium text-white bg-ink px-4 py-2 rounded-lg hover:bg-ink/90">{editing ? 'Save Changes' : 'Add Branch'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <ConfirmDeleteModal label={`branch "${deleting.code}"`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Academic Years tab                                                  */
/* ------------------------------------------------------------------ */
const AcademicYearsTab = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: '', isCurrent: false });
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchYears = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/academic-years');
      setYears(data);
    } catch (err) {
      showToast('Failed to load academic years', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchYears(); }, []);

  const openCreate = () => { setEditing(null); setForm({ label: '', isCurrent: false }); setError(''); setModalOpen(true); };
  const openEdit = (y) => { setEditing(y); setForm({ label: y.label, isCurrent: y.isCurrent }); setError(''); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/admin/academic-years/${editing._id}`, form);
        showToast('Academic year updated');
      } else {
        await api.post('/admin/academic-years', form);
        showToast('Academic year added');
      }
      setModalOpen(false);
      fetchYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleSetCurrent = async (y) => {
    try {
      await api.put(`/admin/academic-years/${y._id}`, { isCurrent: true });
      showToast(`${y.label} marked as current`);
      fetchYears();
    } catch (err) {
      showToast('Failed to update', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/academic-years/${deleting._id}`);
      showToast('Academic year deleted');
      setDeleting(null);
      fetchYears();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button type="button" onClick={openCreate} className="flex items-center gap-2 text-sm font-medium text-white bg-ink px-4 py-2.5 rounded-lg hover:bg-ink/90">
          <Plus size={16} /> Add Academic Year
        </button>
      </div>

      <div className="bg-white border border-hairline rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading...</div>
        ) : years.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate">No academic years yet. Add your first one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs font-medium text-slate uppercase tracking-wide">
                <th className="px-5 py-3">Year</th>
                <th className="px-5 py-3">Current</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {years.map((y) => (
                <tr key={y._id}>
                  <td className="px-5 py-3.5 font-medium text-ink">{y.label}</td>
                  <td className="px-5 py-3.5">
                    {y.isCurrent ? (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#E8A93A' }}><Star size={13} fill="#E8A93A" /> Current</span>
                    ) : (
                      <button type="button" onClick={() => handleSetCurrent(y)} className="text-xs text-slate hover:text-ink underline">Set as current</button>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium rounded-full px-2 py-0.5" style={y.isActive ? { color: '#3F7D5C', backgroundColor: '#3F7D5C14' } : { color: '#5B6478', backgroundColor: '#5B647814' }}>
                      {y.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEdit(y)} className="p-1.5 rounded-lg hover:bg-paper text-slate hover:text-ink"><Pencil size={15} /></button>
                      <button type="button" onClick={() => setDeleting(y)} className="p-1.5 rounded-lg hover:bg-paper text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
              <h2 className="font-display text-lg text-ink">{editing ? 'Edit Academic Year' : 'Add Academic Year'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate hover:text-ink"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Label</label>
                <input type="text" required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20" placeholder="e.g. 2026-2027" />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={form.isCurrent} onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })} />
                Mark as current academic year
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="text-sm text-slate px-4 py-2 rounded-lg hover:bg-paper">Cancel</button>
                <button type="submit" className="text-sm font-medium text-white bg-ink px-4 py-2 rounded-lg hover:bg-ink/90">{editing ? 'Save Changes' : 'Add Year'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <ConfirmDeleteModal label={`academic year "${deleting.label}"`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Subjects tab                                                        */
/* ------------------------------------------------------------------ */
const SubjectsTab = () => {
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', branch: '', semester: '' });
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/admin/branches');
      setBranches(data);
    } catch (err) {
      // non-critical
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterBranch) params.branch = filterBranch;
      if (filterSemester) params.semester = filterSemester;
      const { data } = await api.get('/admin/subjects', { params });
      setSubjects(data);
    } catch (err) {
      showToast('Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => { fetchSubjects(); }, [filterBranch, filterSemester]);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', branch: filterBranch || '', semester: filterSemester || '' }); setError(''); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, code: s.code || '', branch: s.branch?._id || s.branch, semester: s.semester }); setError(''); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/admin/subjects/${editing._id}`, form);
        showToast('Subject updated');
      } else {
        await api.post('/admin/subjects', form);
        showToast('Subject added');
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/subjects/${deleting._id}`);
      showToast('Subject deleted');
      setDeleting(null);
      fetchSubjects();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 justify-between mb-4">
        <div className="flex gap-3">
          <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="border border-hairline rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none">
            <option value="">All Branches</option>
            {branches.map((b) => <option key={b._id} value={b._id}>{b.code}</option>)}
          </select>
          <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="border border-hairline rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none">
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 text-sm font-medium text-white bg-ink px-4 py-2.5 rounded-lg hover:bg-ink/90">
          <Plus size={16} /> Add Subject
        </button>
      </div>

      <div className="bg-white border border-hairline rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading...</div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate">No subjects found. Add one above, or adjust your filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs font-medium text-slate uppercase tracking-wide">
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {subjects.map((s) => (
                <tr key={s._id}>
                  <td className="px-5 py-3.5 font-medium text-ink">{s.name}</td>
                  <td className="px-5 py-3.5 text-slate">{s.code || '—'}</td>
                  <td className="px-5 py-3.5 text-slate">{s.branch?.code || '—'}</td>
                  <td className="px-5 py-3.5 text-slate">{s.semester}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-paper text-slate hover:text-ink"><Pencil size={15} /></button>
                      <button type="button" onClick={() => setDeleting(s)} className="p-1.5 rounded-lg hover:bg-paper text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
              <h2 className="font-display text-lg text-ink">{editing ? 'Edit Subject' : 'Add Subject'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate hover:text-ink"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Subject Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20" placeholder="e.g. Data Structures" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Code (optional)</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20" placeholder="e.g. CS201" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Branch</label>
                <select required value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="w-full border border-hairline rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
                  <option value="">Select a branch</option>
                  {branches.map((b) => <option key={b._id} value={b._id}>{b.code} — {b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Semester</label>
                <select required value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="w-full border border-hairline rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
                  <option value="">Select a semester</option>
                  {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="text-sm text-slate px-4 py-2 rounded-lg hover:bg-paper">Cancel</button>
                <button type="submit" className="text-sm font-medium text-white bg-ink px-4 py-2 rounded-lg hover:bg-ink/90">{editing ? 'Save Changes' : 'Add Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <ConfirmDeleteModal label={`subject "${deleting.name}"`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main page: tab switcher                                             */
/* ------------------------------------------------------------------ */
const AdminReferenceData = () => {
  const [activeTab, setActiveTab] = useState('branches');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-8 pt-4">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-ink mb-1">Reference Data</h1>
          <p className="text-sm text-slate">Manage the Branches, Academic Years, and Subjects used throughout the app.</p>
        </div>

        <div className="flex gap-1 border-b border-hairline mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ' +
                (activeTab === tab.key ? 'border-ink text-ink' : 'border-transparent text-slate hover:text-ink')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'branches' && <BranchesTab />}
        {activeTab === 'years' && <AcademicYearsTab />}
        {activeTab === 'subjects' && <SubjectsTab />}
      </div>
    </DashboardLayout>
  );
};

export default AdminReferenceData;