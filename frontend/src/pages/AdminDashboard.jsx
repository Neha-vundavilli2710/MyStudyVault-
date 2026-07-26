import DashboardLayout from '../components/DashboardLayout';

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Admin Dashboard</h1>
        <p className="text-xs font-mono text-slate">welcome back</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;