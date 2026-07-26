import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const RESOURCE_TYPES = [
  { value: 'lecture-notes', label: 'Lecture Notes' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'question-paper', label: 'Previous Year Question Paper' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'reference-material', label: 'Reference Material' },
  { value: 'lab-material', label: 'Lab Material' },
  { value: 'external-link', label: 'External Link' },
  { value: 'other', label: 'Other' },
];

const fieldClass = 'w-full border border-hairline rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink';
const labelClass = 'block text-xs font-mono text-slate mb-1.5 uppercase tracking-wide';

const UploadResource = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', type: 'lecture-notes', branch: '', semester: '',
    subject: '', academicYear: '', tags: '', externalLink: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.type !== 'external-link' && !file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '') formData.append(key, value);
      });
      if (file) formData.append('file', file);

      await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setSuccess('Resource uploaded successfully!');
      setTimeout(() => navigate('/faculty/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Upload Resource</h1>
        <p className="text-xs font-mono text-slate mb-6">add to the catalog</p>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded p-2">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-hairline p-6 rounded-lg">
          <div>
            <label className={labelClass}>Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Type</label>
            <select name="type" value={form.type} onChange={handleChange} className={fieldClass}>
              {RESOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Branch</label>
              <input type="text" name="branch" value={form.branch} onChange={handleChange} required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Semester</label>
              <input type="number" name="semester" value={form.semester} onChange={handleChange} required min={1} max={8} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Subject</label>
            <input type="text" name="subject" value={form.subject} onChange={handleChange} required className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Academic Year</label>
            <input type="text" name="academicYear" value={form.academicYear} onChange={handleChange} placeholder="2025-2026" className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Tags (comma-separated)</label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="deadlock, scheduling" className={fieldClass} />
          </div>

          {form.type === 'external-link' ? (
            <div>
              <label className={labelClass}>External Link</label>
              <input type="url" name="externalLink" value={form.externalLink} onChange={handleChange} required placeholder="https://..." className={fieldClass} />
            </div>
          ) : (
            <div>
              <label className={labelClass}>File</label>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png" className="w-full text-sm" />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-ink text-paper py-2.5 rounded text-sm font-medium hover:bg-ink/90 disabled:opacity-50">
            {loading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UploadResource;