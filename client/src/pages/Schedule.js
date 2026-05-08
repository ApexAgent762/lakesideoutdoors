import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MdClose } from 'react-icons/md';

const STATUS_COLORS = { SCHEDULED:'bg-blue-500/20 text-blue-400', IN_PROGRESS:'bg-yellow-500/20 text-yellow-400', WAITING_ON_MATERIALS:'bg-orange-500/20 text-orange-400', COMPLETED:'bg-green-500/20 text-green-400', NEEDS_FOLLOW_UP:'bg-purple-500/20 text-purple-400', INVOICED:'bg-teal-500/20 text-teal-400', PAID:'bg-emerald-500/20 text-emerald-400' };

export default function Schedule() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => { api.get('/jobs/mine').then(r => setJobs(r.data)); }, []);

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      const res = await api.post(`/jobs/${selected.id}/notes`, { note });
      setSelected({...selected, notes: [...(selected.notes||[]), res.data]});
      setNote('');
    } catch { alert('Error adding note'); }
  };

  const today = jobs.filter(j => {
    if (!j.scheduledAt) return false;
    const d = new Date(j.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const upcoming = jobs.filter(j => {
    if (!j.scheduledAt) return false;
    const d = new Date(j.scheduledAt);
    const now = new Date();
    return d > now && d.toDateString() !== now.toDateString();
  });

  const JobCard = ({ j }) => (
    <div onClick={() => setSelected(j)} className="bg-lakeside-card border border-lakeside-border rounded-xl p-5 cursor-pointer hover:border-lakeside-blue/50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-medium">{j.name}</p>
          <p className="text-gray-400 text-sm">{j.customer?.name}</p>
          {j.serviceAddress && <p className="text-gray-500 text-xs mt-1">📍 {j.serviceAddress}</p>}
          {j.scheduledAt && <p className="text-gray-500 text-xs">🕐 {new Date(j.scheduledAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[j.status]}`}>{j.status.replace(/_/g,' ')}</span>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">My Schedule</h1>
        <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {today.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lakeside-blue font-semibold mb-3">Today</h2>
          <div className="grid gap-3">{today.map(j => <JobCard key={j.id} j={j} />)}</div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-gray-400 font-semibold mb-3">Upcoming</h2>
          <div className="grid gap-3">{upcoming.map(j => <JobCard key={j.id} j={j} />)}</div>
        </div>
      )}

      {jobs.length === 0 && <div className="text-center text-gray-500 py-16">No jobs assigned to you yet.</div>}

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-lg font-bold">{selected.name}</h2>
                <p className="text-gray-400 text-sm">{selected.customer?.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><MdClose size={24} /></button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {selected.serviceAddress && <p className="text-gray-400">📍 {selected.serviceAddress}</p>}
              {selected.scheduledAt && <p className="text-gray-400">📅 {new Date(selected.scheduledAt).toLocaleString()}</p>}
              {selected.description && <p className="text-gray-300 mt-2">{selected.description}</p>}
              {selected.materialsNeeded && <p className="text-gray-400">Materials: {selected.materialsNeeded}</p>}
            </div>
            <div className="border-t border-lakeside-border pt-4">
              <h3 className="text-white font-medium mb-3">Notes</h3>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {selected.notes?.map(n => (
                  <div key={n.id} className="bg-lakeside-dark rounded-lg p-3">
                    <p className="text-white text-sm">{n.note}</p>
                    <p className="text-gray-500 text-xs mt-1">{n.user?.name} · {new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
                  className="flex-1 bg-lakeside-dark border border-lakeside-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-lakeside-blue" />
                <button onClick={addNote} className="bg-lakeside-blue hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm transition-colors">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
