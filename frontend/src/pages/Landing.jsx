import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

const FEATURES = [
  {
    tab: '#378ADD',
    title: 'One catalog, not five apps',
    desc: 'Notes, papers, and syllabus organized by branch, semester, and subject instead of scattered across WhatsApp and Drive links.',
  },
  {
    tab: '#E8A93A',
    title: 'AI study assistant',
    desc: 'Ask a question, get an answer grounded in your own uploaded material, with the source cited.',
  },
  {
    tab: '#3F7D5C',
    title: 'Doubts, answered and tracked',
    desc: 'Post a doubt, get a real answer from faculty, and track status from open to resolved.',
  },
  {
    tab: '#8B6BC7',
    title: 'Notices that reach you',
    desc: 'Announcements filtered automatically to your branch and semester.',
  },
];

const Landing = () => {
  return (
    <div className="h-screen flex flex-col bg-paper overflow-hidden">
      <PublicNavbar />

      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr_1fr] gap-12 items-center overflow-hidden">
        <div>
          <p className="text-sm font-mono text-slate uppercase tracking-widest mb-3">
            academic knowledge, catalogued
          </p>
          <h1 className="font-display text-5xl text-ink leading-[1.15]">
            Every resource.
            <br />
            One place. Answered,
            <br />
            not scattered.
          </h1>
          <p className="text-slate mt-5 text-base leading-relaxed max-w-md">
            Notes, papers, and syllabus in one catalog, plus an AI assistant
            that answers questions using your own course material.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <svg viewBox="0 0 240 260" className="w-full max-w-[300px]">
            <rect x="30" y="40" width="140" height="180" rx="4" fill="#FFFFFF" stroke="#E3DFD3" strokeWidth="1.5" />
            <rect x="30" y="40" width="6" height="180" fill="#378ADD" />
            <rect x="50" y="62" width="90" height="8" rx="2" fill="#1B2A4A" />
            <rect x="50" y="82" width="110" height="5" rx="1.5" fill="#E3DFD3" />
            <rect x="50" y="94" width="110" height="5" rx="1.5" fill="#E3DFD3" />
            <rect x="50" y="106" width="70" height="5" rx="1.5" fill="#E3DFD3" />

            <rect x="70" y="10" width="140" height="180" rx="4" fill="#FFFFFF" stroke="#E3DFD3" strokeWidth="1.5" />
            <rect x="70" y="10" width="6" height="180" fill="#E8A93A" />
            <rect x="90" y="32" width="90" height="8" rx="2" fill="#1B2A4A" />
            <rect x="90" y="52" width="110" height="5" rx="1.5" fill="#E3DFD3" />
            <rect x="90" y="64" width="110" height="5" rx="1.5" fill="#E3DFD3" />
            <rect x="90" y="76" width="80" height="5" rx="1.5" fill="#E3DFD3" />
            <circle cx="180" cy="150" r="22" fill="#3F7D5C" />
            <path d="M170 150 L177 157 L191 141" stroke="#FAF7F0" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex bg-white border border-hairline rounded-r-lg overflow-hidden">
              <div style={{ width: '5px', backgroundColor: f.tab }}></div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-ink">{f.title}</h3>
                <p className="text-sm text-slate mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-hairline py-4 text-center shrink-0">
        <p className="text-xs font-mono text-slate">MyStudyVault &middot; built for engineering students</p>
      </footer>
    </div>
  );
};

export default Landing;