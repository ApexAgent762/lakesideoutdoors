import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MdAdd, MdPerson, MdPhone, MdEmail, MdClose } from 'react-icons/md';

const emptyForm = { name: '', phone: '', email: '', billingAddress: '', serviceAddress: '', propertyNotes: '', gateCode: '', petNotes: '', sprinklerNotes: '', accessNotes: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/customers').then(r => setCustomers(r.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/customers', form);
      setCustomers([res.data, ...customers]);
      setShowForm(false);
      setForm(emptyForm);
    } catch { alert('Error creating customer'); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Customers</h1>
          <p className="text-gray-400 text-sm mt-1">{customers.length} total customers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-lakeside-blue hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <MdAdd size={20} />Add Customer
        </button>
      </div>

      <div className="grid gap-3">
        {customers.map(c => (
          <div key={c.id} onClick={() => setSelected(c)} className="bg-lakeside-card border border-lakeside-border rounded-xl p-5 cursor-pointer hover:border-lakeside-blue/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-lakeside-blue/20 flex items-center justify-center text-lakeside-blue font-bold">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{c.name}</p>
                <p className="text-gray-400 text-sm">{c.serviceAddress || 'No service address'}</p>
              </div>
              <div className="text-right text-sm text-gray-400">
                {c.phone && <p className="flex items-center gap-1 justify-end"><MdPhone size={14} />{c.phone}</p>}
                {c.email && <p className="flex items-center gap-1 justify-end"><MdEmail size={14} />{c.email}</p>}
              </div>
            </div>
          </div>
        ))}
        {customers.length === 0 && <div className="text-center text-gray-500 py-16">No customers yet. Add your first one!</div>}
      </div>

      {/* Add Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-bold">New Customer</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[['name','Name','text',true],['phone','Phone','tel',false],['email','Email','email',false],['billingAddress','Billing Address','text',false],['serviceAddress','Service Address','text',false],['gateCode','Gate Code','text',false],['petNotes','Pet Notes','text',false],['sprinklerNotes','Sprinkler Notes','text',false],['accessNotes','Access Notes','text',false]].map(([field, label, type, required]) => (
                <div key={field}>
                  <label className="text-gray-400 text-sm block mb-1">{label}{required && ' *'}</label>
                  <input type={type} required={required} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                    className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm" />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-sm block mb-1">Property Notes</label>
                <textarea value={form.propertyNotes} onChange={e => setForm({...form, propertyNotes: e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm h-20 resize-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-lakeside-blue hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors">
                {loading ? 'Saving...' : 'Save Customer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-bold">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><MdClose size={24} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[['Phone', selected.phone], ['Email', selected.email], ['Billing Address', selected.billingAddress], ['Service Address', selected.serviceAddress], ['Gate Code', selected.gateCode], ['Pet Notes', selected.petNotes], ['Sprinkler Notes', selected.sprinklerNotes], ['Access Notes', selected.accessNotes], ['Property Notes', selected.propertyNotes]].map(([label, value]) => value ? (
                <div key={label} className="flex gap-2">
                  <span className="text-gray-500 w-36 shrink-0">{label}:</span>
                  <span className="text-white">{value}</span>
                </div>
              ) : null)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
