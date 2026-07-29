import { useEffect, useState } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';

const TABS = [
  { key: 'resources', label: 'Resources' },
  { key: 'notices', label: 'Notices' },
];

const ConfirmDeleteModal = ({ type, title, onCancel, onConfirm, loading }) => (
  <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
      <h3 className="font-display text-lg text-ink mb-2">Delete {type}?</h3>
      <p className="text-sm text-slate mb-3">{title}</p>
      <p className="text-xs text-slate mb-5">This action cannot be undone.</p>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={loading} className="text-sm text-slate px-4 py-2 rounded-lg hover:bg-paper disabled:opacity-50">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={loading} className="text-sm font-medium text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Resources tab                                                      */
/* ------------------------------------------------------------------ */
const ResourcesTab = () => {
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  const limit = 10;

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (branchFilter) params.branch = branchFilter;
      const { data } = await api.get('/admin/resources', { params });
      setResources(data.resources);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      showToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, branchFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/resources/${deleting._id}`);
      showToast('Resource removed');
      setDeleting(null);
      fetchResources();
    } catch (err) {
      showToast('Failed to delete resource', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            placeholder="Search resources by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-hairline rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </form>
        <input
          type="text"
          placeholder="Filter by branch..."
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="border border-hairline rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
      </div>

      <div className="bg-white border border-hairline rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate">No resources found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs font-medium text-slate uppercase tracking-wide">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Uploaded By</th>
                <th className="px-5 py-3">Branch</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Views</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {resources.map((r) => (
                <tr key={r._id}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-ink">{r.title}</div>
                    <div className="text-xs text-slate">{r.description?.substring(0, 60)}{r.description?.length > 60 ? '...' : ''}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-ink">{r.uploadedBy?.name || '—'}</div>
                    <div className="text-xs text-slate">{r.uploadedBy?.email || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate">{r.branch || '—'}</td>
                  <td className="px-5 py-3.5 text-slate text-xs">{r.type}</td>
                  <td className="px-5 py-3.5 text-slate">{r.viewCount || 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end">
                      <button type="button" onClick={() => setDeleting(r)} className="p-1.5 rounded-lg hover:bg-paper text-red-600">
                        <Trash2 size={15} />
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

      {deleting && (
        <ConfirmDeleteModal
          type="resource"
          title={`"${deleting.title}"`}
          loading={deleteLoading}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Notices tab                                                         */
/* ------------------------------------------------------------------ */
const NoticesTab = () => {
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showToast } = useToast();

  const limit = 10;

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      const { data } = await api.get('/admin/notices', { params });
      setNotices(data.notices);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      showToast('Failed to load notices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [page]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/notices/${deleting._id}`);
      showToast('Notice removed');
      setDeleting(null);
      fetchNotices();
    } catch (err) {
      showToast('Failed to delete notice', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="bg-white border border-hairline rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate">No notices found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs font-medium text-slate uppercase tracking-wide">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Posted By</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Event Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {notices.map((n) => (
                <tr key={n._id}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-ink">{n.title}</div>
                    <div className="text-xs text-slate">{n.description?.substring(0, 60)}{n.description?.length > 60 ? '...' : ''}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-ink">{n.postedBy?.name || '—'}</div>
                    <div className="text-xs text-slate">{n.postedBy?.email || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate text-xs">{n.category}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-medium rounded-full px-2 py-0.5"
                      style={n.priority === 'high' ? { color: '#C7576B', backgroundColor: '#C7576B14' } : { color: '#5B6478', backgroundColor: '#5B647814' }}
                    >
                      {n.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate">{n.eventDate ? formatDate(n.eventDate) : '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end">
                      <button type="button" onClick={() => setDeleting(n)} className="p-1.5 rounded-lg hover:bg-paper text-red-600">
                        <Trash2 size={15} />
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

      {deleting && (
        <ConfirmDeleteModal
          type="notice"
          title={`"${deleting.title}"`}
          loading={deleteLoading}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */
const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('resources');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-8 pt-4">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-ink mb-1">Content Oversight</h1>
          <p className="text-sm text-slate">Search, review, and remove any resource or notice college-wide.</p>
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

        {activeTab === 'resources' && <ResourcesTab />}
        {activeTab === 'notices' && <NoticesTab />}
      </div>
    </DashboardLayout>
  );
};

export default AdminContent;