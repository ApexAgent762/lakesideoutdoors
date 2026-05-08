import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MdPeople, MdLeaderboard, MdRequestQuote, MdWork, MdCheckCircle, MdSchedule } from 'react-icons/md';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 text-gray-400">Loading dashboard...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back to Lakeside Outdoors</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<MdPeople size={24} className="text-lakeside-blue" />} label="Total Customers" value={stats.customers} color="bg-lakeside-blue/20" />
        <StatCard icon={<MdLeaderboard size={24} className="text-lakeside-orange" />} label="Total Leads" value={stats.leads} color="bg-lakeside-orange/20" />
        <StatCard icon={<MdRequestQuote size={24} className="text-yellow-400" />} label="Open Quotes" value={stats.openQuotes} color="bg-yellow-400/20" />
        <StatCard icon={<MdCheckCircle size={24} className="text-green-400" />} label="Approved Quotes" value={stats.approvedQuotes} color="bg-green-400/20" />
        <StatCard icon={<MdSchedule size={24} className="text-lakeside-teal" />} label="Upcoming Jobs" value={stats.upcoming} color="bg-lakeside-teal/20" />
        <StatCard icon={<MdWork size={24} className="text-purple-400" />} label="Completed Jobs" value={stats.completed} color="bg-purple-400/20" />
      </div>
    </div>
  );
}
