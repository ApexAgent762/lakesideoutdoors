import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MdAdd, MdClose } from 'react-icons/md';

const SOURCES = ['FACEBOOK','GOOGLE','REFERRAL','WEBSITE','DOOR_HANGER','YARD_SIGN','OTHER'];
const STATUSES = ['NEW','CONTACTED','ESTIMATE_SCHEDULED','QUOTE_SENT','WON','LOST'];
const STATUS_COLORS = { NEW:'bg-blue-500/20 text-blue-400', CONTACTED:'bg-yellow-500/20 text-yellow-400', ESTIMATE_SCHEDULED:'bg-purple-500/20 text-purple-400', QUOTE_SENT:'bg-orange-500/20 text-orange-400', WON:'bg-green-500/20 text-green-400', LOST:'bg-red-500/20 text-red-400' };
const emptyForm = { name:'', phone:'', email:'', source:'FACEBOOK', status:'NEW', notes:'' };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { api.get('/leads').then(r => setLeads(r.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/leads', form);
      setLeads([res.data, ...leads]);
      setShowForm(false); setForm(emptyForm);
    } catch { alert('Error creating lead'); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/leads/${id}`, { status });
      setLeads(leads.map(l => l.id === id ? res.data : l));
    } catch { alert('Error updating lead'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">{leads.length} total leads</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-lakeside-blue hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <MdAdd size={20} />Add Lead
        </button>
      </div>

      <div className="grid gap-3">
        {leads.map(l => (
          <div key={l.id} className="bg-lakeside-card border border-lakeside-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{l.name}</p>
                <p className="text-gray-400 text-sm">{l.phone} {l.email && `· ${l.email}`}</p>
                <p className="text-gray-500 text-xs mt-1">Source: {l.source.replace('_',' ')}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[l.status]}`}>{l.status.replace('_',' ')}</span>
                <select value={l.status} onChange={e => updateStatus(l.id, e.target.value)}
                  className="bg-lakeside-dark border border-lakeside-border text-gray-400 text-xs rounded-lg px-2 py-1">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
            </div>
            {l.notes && <p className="text-gray-500 text-sm mt-2 border-t border-lakeside-border pt-2">{l.notes}</p>}
          </div>
        ))}
        {leads.length === 0 && <div className="text-center text-gray-500 py-16">No leads yet.</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-bold">New Lead</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[['name','Name','text',true],['phone','Phone','tel',false],['email','Email','email',false]].map(([field,label,type,req]) => (
                <div key={field}>
                  <label className="text-gray-400 text-sm block mb-1">{label}{req&&' *'}</label>
                  <input type={type} required={req} value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})}
                    className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm" />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-sm block mb-1">Source</label>
                <select value={form.source} onChange={e => setForm({...form,source:e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm">
                  {SOURCES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm h-20 resize-none" />
              </div>
              <button type="submit" className="w-full bg-lakeside-blue hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors">Save Lead</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
