import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Calendar } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
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

const labelClass = 'block text-sm font-medium text-ink mb-1.5';
const fieldClass = 'w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink';

const HeaderIllustration = () => (
  <svg viewBox="0 0 160 90" className="hidden sm:block w-32 h-20 shrink-0">
    <rect x="15" y="20" width="12" height="45" rx="2" fill="#1B2A4A" />
    <rect x="29" y="15" width="12" height="50" rx="2" fill="#378ADD" />
    <rect x="43" y="25" width="12" height="40" rx="2" fill="#8A8478" />
    <rect x="65" y="50" width="9" height="15" rx="2" fill="#3F7D5C" />
    <ellipse cx="69.5" cy="45" rx="8" ry="5" fill="#3F7D5C" opacity="0.5" />
    <path d="M110 15 Q95 15 95 30 Q85 30 85 40 Q85 50 97 50 L128 50 Q140 50 140 38 Q140 28 128 28 Q126 15 110 15 Z" fill="#FBEFDA" />
    <path d="M112 30 L112 45 M105 37 L112 30 L119 37" stroke="#E8A93A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadResource = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', type: 'lecture-notes', branch: '', semester: '',
    subject: '', academicYear: '', tags: '', externalLink: '',
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

      showToast('Resource uploaded successfully!');
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-ink">Upload Resource</h1>
            <p className="text-sm text-slate mt-1">Add a new resource to the catalog</p>
          </div>
          <HeaderIllustration />
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-hairline p-6 rounded-xl shadow-sm">
          <div>
            <label className={labelClass}>Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Enter resource title" required className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter a brief description about this resource" rows={3} className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Type <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8A93A14' }}>
                <FileText size={16} color="#E8A93A" strokeWidth={1.75} />
              </div>
              <select name="type" value={form.type} onChange={handleChange} className={fieldClass}>
                {RESOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Branch</label>
              <input type="text" name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. CSE" required className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Semester</label>
              <input type="number" name="semester" value={form.semester} onChange={handleChange} min={1} max={8} placeholder="e.g. 5" required className={fieldClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Subject</label>
            <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Operating Systems" required className={fieldClass} />
          </div>

          <div>
            <label className={labelClass}>Academic Year</label>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E8A93A14' }}>
                <Calendar size={16} color="#E8A93A" strokeWidth={1.75} />
              </div>
              <input type="text" name="academicYear" value={form.academicYear} onChange={handleChange} placeholder="2025-2026" className={fieldClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g., deadlock, scheduling, os" className={fieldClass} />
          </div>

          {form.type === 'external-link' ? (
            <div>
              <label className={labelClass}>External Link</label>
              <input type="url" name="externalLink" value={form.externalLink} onChange={handleChange} required placeholder="https://..." className={fieldClass} />
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={
                'border-2 border-dashed rounded-xl py-8 px-4 text-center transition-colors ' +
                (dragActive ? 'border-amber bg-amber/10' : 'border-hairline')
              }
              style={{ backgroundColor: dragActive ? undefined : '#FBEFDA33' }}
            >
              <UploadCloud size={26} color="#E8A93A" strokeWidth={1.75} className="mx-auto mb-2" />
              {file ? (
                <p className="text-sm font-medium text-ink">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-ink">Drag &amp; drop your file here</p>
                  <p className="text-xs text-slate mt-0.5">or</p>
                </>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-sm font-medium px-4 py-2 rounded-lg border border-hairline bg-white hover:bg-paper"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                className="hidden"
              />
              <p className="text-xs text-slate mt-3">PDF, DOC, DOCX, PPT, PPTX (Max 10MB)</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-ink text-paper py-3 rounded-lg text-sm font-medium hover:bg-ink/90 disabled:opacity-50">
            <UploadCloud size={17} strokeWidth={2} />
            {loading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UploadResource;