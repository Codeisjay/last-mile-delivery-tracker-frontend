import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', role: 'Customer' });
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, form);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" className="w-full border p-3 rounded" placeholder="Name" onChange={handleChange} />
          <input name="email" className="w-full border p-3 rounded" placeholder="Email" onChange={handleChange} />
          <input name="password" type="password" className="w-full border p-3 rounded" placeholder="Password" onChange={handleChange} />
          <input name="phone" className="w-full border p-3 rounded" placeholder="Phone" onChange={handleChange} />
          <input name="address" className="w-full border p-3 rounded" placeholder="Address" onChange={handleChange} />
          <select name="role" className="w-full border p-3 rounded" onChange={handleChange} value={form.role}>
            <option value="Customer">Customer</option>
            <option value="Delivery Agent">Delivery Agent</option>
          </select>
          <button className="w-full bg-blue-600 text-white p-3 rounded" type="submit">Register</button>
        </form>
        <p className="mt-4 text-sm">Already have account? <Link to="/login" className="text-blue-600">Login</Link></p>
      </div>
    </div>
  );
}
