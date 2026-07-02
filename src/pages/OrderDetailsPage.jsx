import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function OrderDetailsPage() {
  const { logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [error, setError] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/${id}`);
      setData(res.data);
    } catch (err) {
      setError('Failed to load order');
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) {
      setError('Please select a date');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/orders/${id}/reschedule`, {
        rescheduleDate: new Date(rescheduleDate)
      });
      setError('');
      setShowReschedule(false);
      setRescheduleDate('');
      loadOrder();
    } catch (err) {
      setError('Reschedule failed');
    }
  };

  if (!data) return <div className="p-6 text-center">Loading...</div>;

  const { order, history } = data;
  const statusColors = {
    'Created': 'bg-blue-100 text-blue-700',
    'Assigned': 'bg-purple-100 text-purple-700',
    'Picked Up': 'bg-cyan-100 text-cyan-700',
    'In Transit': 'bg-indigo-100 text-indigo-700',
    'Out for Delivery': 'bg-yellow-100 text-yellow-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Failed': 'bg-red-100 text-red-700',
    'Rescheduled': 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <button
          onClick={logout}
          className="bg-slate-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Order Summary */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h1 className="text-2xl font-bold mb-4">Order #{order._id.slice(-6)}</h1>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-600">Customer</div>
                <div className="font-semibold">{order.customer.name}</div>
                <div className="text-sm">{order.customer.email}</div>
              </div>

              <div>
                <div className="text-sm text-slate-600">Pickup</div>
                <div className="font-semibold">{order.pickupAddress}</div>
                <div className="text-sm">{order.pickupPincode} • {order.pickupZone}</div>
              </div>

              <div>
                <div className="text-sm text-slate-600">Drop</div>
                <div className="font-semibold">{order.dropAddress}</div>
                <div className="text-sm">{order.dropPincode} • {order.dropZone}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-slate-50 p-4 rounded mb-4">
              <div className="text-sm text-slate-600 mb-1">Current Status</div>
              <div className={`inline-block px-4 py-2 rounded font-bold text-lg ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                {order.status}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded mb-4">
              <div className="text-sm text-slate-600 mb-1">Total Charge</div>
              <div className="text-3xl font-bold text-blue-600">₹{order.pricing?.totalCharge}</div>
              <div className="text-sm text-slate-600 mt-1">
                Payment: {order.business?.paymentType || 'Prepaid'}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <div className="text-sm text-slate-600 mb-2">Package</div>
              <div className="text-sm space-y-1">
                <div>Dimensions: {order.package.length}×{order.package.breadth}×{order.package.height}cm</div>
                <div>Weight: {order.package.actualWeight}kg (actual)</div>
                <div>Weight: {order.package.billableWeight}kg (billable)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Assignment */}
      {order.assignment?.assignedAgent && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-bold mb-3">Assigned Agent</h2>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">{order.assignment.assignedAgent.name}</div>
              <div className="text-sm text-slate-600">{order.assignment.assignedAgent.email}</div>
              <div className="text-sm text-slate-600">Phone: {order.assignment.assignedAgent.phone}</div>
            </div>
            <div className={`px-4 py-2 rounded font-semibold ${order.assignment.assignedAgent.available ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {order.assignment.assignedAgent.available ? 'Available' : 'Busy'}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Section (for failed orders) */}
      {order.status === 'Failed' && (
        <div className="bg-red-50 border border-red-200 p-6 rounded shadow mb-6">
          <h2 className="text-lg font-bold text-red-700 mb-3">Delivery Failed</h2>
          <p className="text-red-600 mb-4">This delivery attempt was unsuccessful. You can reschedule it for another date.</p>
          
          {!showReschedule ? (
            <button 
              onClick={() => setShowReschedule(true)}
              className="bg-red-600 text-white px-4 py-2 rounded font-semibold"
            >
              Reschedule Delivery
            </button>
          ) : (
            <div className="space-y-3">
              <input 
                type="date" 
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border p-2 rounded w-full"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleReschedule}
                  className="bg-green-600 text-white px-4 py-2 rounded font-semibold"
                >
                  Confirm Reschedule
                </button>
                <button 
                  onClick={() => setShowReschedule(false)}
                  className="bg-slate-600 text-white px-4 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-6">Delivery Timeline</h2>
        <div className="space-y-6">
          {history && history.length > 0 ? (
            history.map((h, idx) => (
              <div key={h._id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${statusColors[h.status] ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                  {idx < history.length - 1 && <div className="w-1 h-12 bg-slate-300 mt-2"></div>}
                </div>
                <div className="pb-4">
                  <div className={`px-3 py-1 rounded inline-block font-semibold text-sm mb-1 ${statusColors[h.status] || 'bg-slate-100 text-slate-700'}`}>
                    {h.status}
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(h.timestamp).toLocaleString()}
                  </div>
                  {h.actor && (
                    <div className="text-sm text-slate-500 mt-1">
                      by {h.actor?.name || 'System'}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-600">No tracking history available</div>
          )}
        </div>
      </div>
    </div>
  );
}
