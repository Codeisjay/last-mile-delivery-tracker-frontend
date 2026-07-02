import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, agentsRes, zonesRes, ratesRes] = await Promise.all([
        axios.get(`${API_URL}/api/orders`),
        axios.get(`${API_URL}/api/agents`),
        axios.get(`${API_URL}/api/zones`),
        axios.get(`${API_URL}/api/rate-cards`)
      ]);
      setOrders(ordersRes.data);
      setAgents(agentsRes.data);
      setZones(zonesRes.data);
      setRateCards(ratesRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const assignAgent = async (orderId, agentId) => {
    try {
      await axios.post(`${API_URL}/api/admin/assign-agent`, { orderId, agentId });
      setError('');
      loadData();
    } catch (err) {
      setError('Assignment failed');
    }
  };

  const autoAssignAgent = async (orderId) => {
    try {
      await axios.post(`${API_URL}/api/admin/auto-assign`, { orderId });
      setError('');
      loadData();
    } catch (err) {
      setError('Auto-assignment failed');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus });
      setError('');
      loadData();
    } catch (err) {
      setError('Status update failed');
    }
  };

  const filteredOrders = orders.filter(o => 
    (!filterStatus || o.status === filterStatus) &&
    (!filterZone || o.dropZone === filterZone)
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={logout} className="bg-slate-700 text-white px-4 py-2 rounded">Logout</button>
      </div>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-600'}`}
        >
          Orders ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 font-semibold ${activeTab === 'zones' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-600'}`}
        >
          Zones ({zones.length})
        </button>
        <button 
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2 font-semibold ${activeTab === 'rates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-600'}`}
        >
          Rate Cards ({rateCards.length})
        </button>
        <button 
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 font-semibold ${activeTab === 'agents' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-600'}`}
        >
          Agents ({agents.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <div className="mb-4 flex gap-4">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Statuses</option>
              <option value="Created">Created</option>
              <option value="Assigned">Assigned</option>
              <option value="Picked Up">Picked Up</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
            <select 
              value={filterZone} 
              onChange={(e) => setFilterZone(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Zones</option>
              {zones.map(z => <option key={z._id} value={z.zoneName}>{z.zoneName}</option>)}
            </select>
          </div>

          <div className="grid gap-4">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">Order #{order._id.slice(-6)}</div>
                    <div className="text-sm text-slate-600">Customer: {order.customer.name}</div>
                    <div className="text-sm text-slate-600">{order.pickupAddress} → {order.dropAddress}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">₹{order.pricing?.totalCharge}</div>
                    <div className={`text-sm px-2 py-1 rounded ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.status}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="mb-3">
                    <label className="text-sm font-semibold">Assign Agent:</label>
                    <select 
                      defaultValue={order.assignment?.assignedAgent?._id || ''} 
                      onChange={(e) => assignAgent(order._id, e.target.value)} 
                      className="mt-1 border p-2 rounded w-full"
                    >
                      <option value="">Unassigned</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} {agent.available ? '✓' : '✗'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => autoAssignAgent(order._id)}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Auto-Assign
                    </button>
                    <Link 
                      to={`/orders/${order._id}`}
                      className="bg-slate-600 text-white px-3 py-1 rounded text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zones Tab */}
      {activeTab === 'zones' && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Delivery Zones</h2>
          <div className="space-y-3">
            {zones.map(zone => (
              <div key={zone._id} className="border p-4 rounded">
                <div className="font-semibold">{zone.zoneName}</div>
                <div className="text-sm text-slate-600">Pincodes: {zone.pincodes.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate Cards Tab */}
      {activeTab === 'rates' && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Rate Cards</h2>
          <div className="space-y-4">
            {rateCards.map(rate => (
              <div key={rate._id} className="border p-4 rounded">
                <div className="font-semibold mb-2">{rate.orderType}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-slate-700">Intra-Zone</div>
                    <div>Base: ₹{rate.intraZone.basePrice} (≤{rate.intraZone.baseWeight}kg)</div>
                    <div>Extra: ₹{rate.intraZone.extraKgPrice}/kg</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">Inter-Zone</div>
                    <div>Base: ₹{rate.interZone.basePrice} (≤{rate.interZone.baseWeight}kg)</div>
                    <div>Extra: ₹{rate.interZone.extraKgPrice}/kg</div>
                  </div>
                </div>
                <div className="mt-2 text-sm">COD Surcharge: ₹{rate.codCharge}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-3">
          {agents.map(agent => (
            <div key={agent._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{agent.name}</div>
                  <div className="text-sm text-slate-600">{agent.email}</div>
                  <div className="text-sm text-slate-600">Phone: {agent.phone}</div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded text-sm font-semibold ${agent.available ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {agent.available ? 'Available' : 'Busy'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
