import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MdAdd, MdClose } from 'react-icons/md';

const STATUS_COLORS = { SCHEDULED:'bg-blue-500/20 text-blue-400 border-blue-400/30', IN_PROGRESS:'bg-yellow-500/20 text-yellow-400 border-yellow-400/30', WAITING_ON_MATERIALS:'bg-orange-500/20 text-orange-400 border-orange-400/30', COMPLETED:'bg-green-500/20 text-green-400 border-green-400/30', NEEDS_FOLLOW_UP:'bg-purple-500/20 text-purple-400 border-purple-400/30', INVOICED:'bg-teal-500/20 text-teal-400 border-teal-400/30', PAID:'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' };
const STATUSES = ['SCHEDULED','IN_PROGRESS','WAITING_ON_MATERIALS','COMPLETED','NEEDS_FOLLOW_UP','INVOICED','PAID'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [note, setNote] = useState('');
  const [form, setForm] = useState({ name:'', customerId:'', serviceAddress:'', description:'', materialsNeeded:'', scheduledAt:'', assignedUserIds:[] });

  useEffect(() => {
    api.get('/jobs').then(r => setJobs(r.data));
    api.get('/customers').then(r => setCustomers(r.data));
  }, []);

  const openJob = (j) => {
    setSelected(j);
    setSelectedStatuses(j.status ? j.status.split(',') : []);
  };

  const toggleStatus = (s) => {
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const saveStatuses = async () => {
    if (!selected) return;
    const statusValue = selectedStatuses.join(',');
    try {
      const res = await api.put(`/jobs/${selected.id}`, { status: selectedStatuses[0] || 'SCHEDULED' });
      setJobs(jobs.map(j => j.id === selected.id ? {...j, status: res.data.status} : j));
      setSelected({...selected, status: res.data.status});
    } catch { alert('Error updating status'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/jobs', {...form, customerId: parseInt(form.customerId)});
      setJobs([res.data, ...jobs]);
      setShowForm(false);
      setForm({ name:'', customerId:'', serviceAddress:'', description:'', materialsNeeded:'', scheduledAt:'', assignedUserIds:[] });
    } catch { alert('Error creating job'); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      const res = await api.post(`/jobs/${selected.id}/notes`, { note });
      setSelected({...selected, notes: [...(selected.notes||[]), res.data]});
      setNote('');
    } catch { alert('Error adding note'); }
  };

  const getStatusDisplay = (status) => {
    if (!status) return null;
    const statuses = status.split(',');
    return (
      <div className="flex flex-wrap gap-1">
        {statuses.map(s => (
          <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[s] || 'bg-gray-500/20 text-gray-400'}`}>
            {s.replace(/_/g,' ')}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Jobs</h1>
          <p className="text-gray-400 text-sm mt-1">{jobs.length} total jobs</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-lakeside-blue hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <MdAdd size={20} />New Job
        </button>
      </div>

      <div className="grid gap-3">
        {jobs.map(j => (
          <div key={j.id} onClick={() => openJob(j)} className="bg-lakeside-card border border-lakeside-border rounded-xl p-5 cursor-pointer hover:border-lakeside-blue/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{j.name}</p>
                <p className="text-gray-400 text-sm">{j.customer?.name}</p>
                {j.scheduledAt && <p className="text-gray-500 text-xs mt-1">{new Date(j.scheduledAt).toLocaleDateString()}</p>}
              </div>
              <div className="text-right">
                {getStatusDisplay(j.status)}
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <div className="text-center text-gray-500 py-16">No jobs yet.</div>}
      </div>

      {/* Job Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-lg font-bold">{selected.name}</h2>
                <p className="text-gray-400 text-sm">{selected.customer?.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><MdClose size={24} /></button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {selected.serviceAddress && <p className="text-gray-400">📍 {selected.serviceAddress}</p>}
              {selected.scheduledAt && <p className="text-gray-400">📅 {new Date(selected.scheduledAt).toLocaleDateString()}</p>}
              {selected.description && <p className="text-gray-300 mt-2">{selected.description}</p>}
              {selected.materialsNeeded && <p className="text-gray-400 mt-1">Materials: {selected.materialsNeeded}</p>}
            </div>

            {/* Multi-select status */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">Status — select all that apply:</p>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => toggleStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedStatuses.includes(s)
                        ? `${STATUS_COLORS[s]} border-current`
                        : 'bg-lakeside-dark text-gray-400 border-lakeside-border hover:text-white'
                    }`}>
                    {s.replace(/_/g,' ')}
                  </button>
                ))}
              </div>
              <button onClick={saveStatuses} className="mt-3 bg-lakeside-blue hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Save Status
              </button>
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

      {/* New Job Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-bold">New Job</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Job Name *</label>
                <input required value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Customer *</label>
                <select required value={form.customerId} onChange={e => setForm({...form,customerId:e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm">
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Service Address</label>
                <input value={form.serviceAddress} onChange={e => setForm({...form,serviceAddress:e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Scheduled Date</label>
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({...form,scheduledAt:e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm h-20 resize-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Materials Needed</label>
                <input value={form.materialsNeeded} onChange={e => setForm({...form,materialsNeeded:e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm" />
              </div>
              <button type="submit" className="w-full bg-lakeside-blue hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors">Create Job</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
