import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PlaceOrderPage() {
  const [form, setForm] = useState({
    pickupAddress: '',
    dropAddress: '',
    pickupPincode: '',
    dropPincode: '',
    package: { length: '', breadth: '', height: '', actualWeight: '' },
    business: { orderType: 'B2C', paymentType: 'Prepaid' },
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('package.')) {
      const key = name.split('.')[1];
      setForm({ ...form, package: { ...form.package, [key]: value } });
      return;
    }
    if (name.startsWith('business.')) {
      const key = name.split('.')[1];
      setForm({ ...form, business: { ...form.business, [key]: value } });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const buildPayload = () => ({
    ...form,
    paymentType: form.business.paymentType,
    package: {
      ...form.package,
      length: Number(form.package.length),
      breadth: Number(form.package.breadth),
      height: Number(form.package.height),
      actualWeight: Number(form.package.actualWeight),
    },
  });

  const calculate = async () => {
    try {
      setError('');
      const payload = buildPayload();
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/preview-charge`, payload);
      setPreview(data);
    } catch (err) {
      setError('Unable to calculate charges. Check pincodes and package dimensions.');
    }
  };

  const submit = async () => {
    try {
      setError('');
      const payload = buildPayload();
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, payload);
      navigate('/');
    } catch (err) {
      setError('Order creation failed. Please validate the details and try again.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Place Order</h1>
      <div className="bg-white p-6 rounded shadow space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        <input name="pickupAddress" onChange={handleChange} className="w-full border p-2 rounded" placeholder="Pickup Address" />
        <input name="dropAddress" onChange={handleChange} className="w-full border p-2 rounded" placeholder="Drop Address" />
        <div className="grid grid-cols-2 gap-4">
          <input name="pickupPincode" onChange={handleChange} className="w-full border p-2 rounded" placeholder="Pickup Pincode" />
          <input name="dropPincode" onChange={handleChange} className="w-full border p-2 rounded" placeholder="Drop Pincode" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <input name="package.length" onChange={handleChange} type="number" className="w-full border p-2 rounded" placeholder="Length" />
          <input name="package.breadth" onChange={handleChange} type="number" className="w-full border p-2 rounded" placeholder="Breadth" />
          <input name="package.height" onChange={handleChange} type="number" className="w-full border p-2 rounded" placeholder="Height" />
          <input name="package.actualWeight" onChange={handleChange} type="number" className="w-full border p-2 rounded" placeholder="Actual Weight" />
        </div>
        <select name="business.orderType" onChange={handleChange} className="w-full border p-2 rounded" value={form.business.orderType}>
          <option value="B2C">B2C</option><option value="B2B">B2B</option>
        </select>
        <select name="business.paymentType" onChange={handleChange} className="w-full border p-2 rounded" value={form.business.paymentType}>
          <option value="Prepaid">Prepaid</option><option value="COD">COD</option>
        </select>
        <div className="flex gap-4">
          <button type="button" onClick={calculate} className="bg-gray-800 text-white px-4 py-2 rounded">Calculate Charges</button>
          <button type="button" onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">Confirm Order</button>
        </div>
        {preview && <div className="p-4 bg-slate-50 rounded">Total Charge: ₹{preview.totalCharge} | Billable Weight: {preview.billableWeight}</div>}
      </div>
    </div>
  );
}
