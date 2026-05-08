import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MdAdd, MdClose } from 'react-icons/md';

const STATUS_COLORS = { DRAFT:'bg-gray-500/20 text-gray-400', SENT:'bg-blue-500/20 text-blue-400', APPROVED:'bg-green-500/20 text-green-400', DECLINED:'bg-red-500/20 text-red-400' };

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ customerId:'', notes:'', expiresAt:'', lineItems:[{ description:'', quantity:1, unit:'', unitPrice:0, serviceId:'', customName:'' }] });

  useEffect(() => {
    api.get('/quotes').then(r => setQuotes(r.data));
    api.get('/customers').then(r => setCustomers(r.data));
    api.get('/services').then(r => setServices(r.data));
  }, []);

  const addLineItem = () => setForm({...form, lineItems:[...form.lineItems, { description:'', quantity:1, unit:'', unitPrice:0, serviceId:'', customName:'' }]});
  const removeLineItem = (i) => setForm({...form, lineItems: form.lineItems.filter((_,idx) => idx !== i)});
  
  const updateLineItem = (i, field, value) => {
    const items = [...form.lineItems];
    items[i] = {...items[i], [field]: value};
    if (field === 'serviceId' && value) {
      const svc = services.find(s => s.id === parseInt(value));
      if (svc) {
        items[i].customName = svc.name;
        items[i].description = svc.description || svc.name;
        items[i].unitPrice = svc.unitPrice;
        items[i].unit = svc.unit || '';
      }
    }
    if (field === 'serviceId' && !value) {
      items[i].customName = '';
      items[i].description = '';
      items[i].unitPrice = 0;
      items[i].unit = '';
    }
    setForm({...form, lineItems: items});
  };

  const total = form.lineItems.reduce((sum, item) => sum + (parseFloat(item.quantity)||0) * (parseFloat(item.unitPrice)||0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/quotes', {
        ...form,
        customerId: parseInt(form.customerId),
        lineItems: form.lineItems.map(item => ({
          ...item,
          description: item.customName || item.description
        }))
      });
      setQuotes([res.data, ...quotes]);
      setShowForm(false);
      setForm({ customerId:'', notes:'', expiresAt:'', lineItems:[{ description:'', quantity:1, unit:'', unitPrice:0, serviceId:'', customName:'' }] });
    } catch { alert('Error creating quote'); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/quotes/${id}`, { status });
      setQuotes(quotes.map(q => q.id === id ? {...q, status: res.data.status} : q));
      if (selected?.id === id) setSelected({...selected, status: res.data.status});
    } catch { alert('Error updating quote'); }
  };

  const quoteTotal = (q) => q.lineItems?.reduce((sum, item) => sum + item.total, 0) || 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Quotes</h1>
          <p className="text-gray-400 text-sm mt-1">{quotes.length} total quotes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-lakeside-blue hover:bg-blue-400 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <MdAdd size={20} />New Quote
        </button>
      </div>

      <div className="grid gap-3">
        {quotes.map(q => (
          <div key={q.id} onClick={() => setSelected(q)} className="bg-lakeside-card border border-lakeside-border rounded-xl p-5 cursor-pointer hover:border-lakeside-blue/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{q.quoteNumber}</p>
                <p className="text-gray-400 text-sm">{q.customer?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">${quoteTotal(q).toFixed(2)}</p>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[q.status]}`}>{q.status}</span>
              </div>
            </div>
          </div>
        ))}
        {quotes.length === 0 && <div className="text-center text-gray-500 py-16">No quotes yet.</div>}
      </div>

      {/* Quote Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-lg font-bold">{selected.quoteNumber}</h2>
                <p className="text-gray-400 text-sm">{selected.customer?.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><MdClose size={24} /></button>
            </div>
            <div className="space-y-2 mb-4">
              {selected.lineItems?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-lakeside-border pb-2">
                  <div>
                    <p className="text-white">{item.description}</p>
                    <p className="text-gray-500">{item.quantity} {item.unit} × ${item.unitPrice}</p>
                  </div>
                  <p className="text-white font-medium">${item.total?.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-lakeside-border pt-3 mb-4">
              <span>Total</span>
              <span>${quoteTotal(selected).toFixed(2)}</span>
            </div>
            {selected.notes && <p className="text-gray-400 text-sm mb-4">{selected.notes}</p>}
            <div className="flex gap-2 flex-wrap">
              {['DRAFT','SENT','APPROVED','DECLINED'].map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selected.status === s ? 'bg-lakeside-blue text-white' : 'bg-lakeside-dark text-gray-400 hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Quote Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-lakeside-card border border-lakeside-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-bold">New Quote</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><MdClose size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Customer *</label>
                <select required value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm">
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-sm">Line Items</label>
                  <button type="button" onClick={addLineItem} className="text-lakeside-blue text-sm flex items-center gap-1 hover:text-blue-300">
                    <MdAdd size={16} />Add Item
                  </button>
                </div>
                {form.lineItems.map((item, i) => (
                  <div key={i} className="bg-lakeside-dark border border-lakeside-border rounded-lg p-3 mb-2">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-gray-500 text-xs block mb-1">Service (select or type)</label>
                        <input
                          list={`services-${i}`}
                          value={item.customName}
                          onChange={e => {
                            const val = e.target.value;
                            const matched = services.find(s => s.name === val);
                            if (matched) {
                              updateLineItem(i, 'serviceId', matched.id.toString());
                            } else {
                              const items = [...form.lineItems];
                              items[i] = {...items[i], customName: val, serviceId: ''};
                              setForm({...form, lineItems: items});
                            }
                          }}
                          placeholder="Type or select a service..."
                          className="w-full bg-lakeside-darker border border-lakeside-border rounded px-2 py-1.5 text-white text-xs"
                        />
                        <datalist id={`services-${i}`}>
                          {services.map(s => <option key={s.id} value={s.name} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs block mb-1">Description</label>
                        <input value={item.description} onChange={e => updateLineItem(i, 'description', e.target.value)}
                          className="w-full bg-lakeside-darker border border-lakeside-border rounded px-2 py-1.5 text-white text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-gray-500 text-xs block mb-1">Qty</label>
                        <input type="number" value={item.quantity} onChange={e => updateLineItem(i, 'quantity', e.target.value)}
                          className="w-full bg-lakeside-darker border border-lakeside-border rounded px-2 py-1.5 text-white text-xs" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs block mb-1">Unit</label>
                        <input value={item.unit} onChange={e => updateLineItem(i, 'unit', e.target.value)}
                          className="w-full bg-lakeside-darker border border-lakeside-border rounded px-2 py-1.5 text-white text-xs" />
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs block mb-1">Unit Price ($)</label>
                        <input type="number" value={item.unitPrice} onChange={e => updateLineItem(i, 'unitPrice', e.target.value)}
                          className="w-full bg-lakeside-darker border border-lakeside-border rounded px-2 py-1.5 text-white text-xs" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-lakeside-blue text-sm font-medium">
                        Subtotal: ${((parseFloat(item.quantity)||0)*(parseFloat(item.unitPrice)||0)).toFixed(2)}
                      </p>
                      {form.lineItems.length > 1 && (
                        <button type="button" onClick={() => removeLineItem(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-right text-white font-bold mt-2">Total: ${total.toFixed(2)}</div>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm h-20 resize-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Expiration Date</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                  className="w-full bg-lakeside-dark border border-lakeside-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-lakeside-blue text-sm" />
              </div>
              <button type="submit" className="w-full bg-lakeside-blue hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors">Create Quote</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
