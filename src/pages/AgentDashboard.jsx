import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AgentDashboard() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const agentId = localStorage.getItem('userId');

  useEffect(() => {
    loadOrders();
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          updateAgentLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => console.warn('Location access denied')
      );
    }
  }, []);

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      // Filter orders assigned to this agent
      const assignedOrders = res.data.filter(o => 
        o.assignment?.assignedAgent?._id === agentId || 
        o.assignment?.assignedAgent === agentId
      );
      setOrders(assignedOrders);
    } catch (err) {
      setError('Failed to load orders');
    }
  };

  const updateAgentLocation = async (lat, lng) => {
    try {
      await axios.put(`${API_URL}/api/agents/location`, { 
        coordinates: [lng, lat] 
      });
    } catch (err) {
      console.warn('Location update failed');
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus });
      setError('');
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      setError('Status update failed');
    }
  };

  const allowedTransitions = {
    'Created': ['Picked Up'],
    'Assigned': ['Picked Up'],
    'Picked Up': ['In Transit'],
    'In Transit': ['Out for Delivery'],
    'Out for Delivery': ['Delivered', 'Failed'],
    'Failed': [],
    'Rescheduled': ['Assigned']
  };

  const filteredOrders = orders.filter(o => 
    !filterStatus || o.status === filterStatus
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Assigned Orders</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="mb-4">
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Orders</option>
          <option value="Assigned">Assigned</option>
          <option value="Picked Up">Picked Up</option>
          <option value="In Transit">In Transit</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Failed">Failed</option>
          <option value="Rescheduled">Rescheduled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Orders List */}
        <div className="lg:col-span-2">
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded text-center text-slate-600">
              No orders assigned to you
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <div 
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded shadow cursor-pointer transition ${selectedOrder?._id === order._id ? 'bg-blue-50 border-2 border-blue-600' : 'bg-white hover:shadow-md'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">#{order._id.slice(-6)}</div>
                      <div className="text-sm text-slate-600">Pickup: {order.pickupAddress}</div>
                      <div className="text-sm text-slate-600">Drop: {order.dropAddress}</div>
                    </div>
                    <div className={`px-3 py-1 rounded text-sm font-semibold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Failed' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details & Status Update */}
        {selectedOrder && (
          <div className="bg-white p-4 rounded shadow border-2 border-blue-600">
            <h2 className="font-semibold mb-4">Order Actions</h2>
            
            <div className="mb-4 p-3 bg-slate-50 rounded">
              <div className="text-sm font-semibold mb-2">Current Status</div>
              <div className="text-lg font-bold text-blue-600">{selectedOrder.status}</div>
            </div>

            <div className="space-y-2">
              {allowedTransitions[selectedOrder.status]?.map(nextStatus => (
                <button
                  key={nextStatus}
                  onClick={() => updateStatus(selectedOrder._id, nextStatus)}
                  className={`w-full py-2 px-3 rounded text-white font-semibold transition ${
                    nextStatus === 'Delivered' ? 'bg-green-600 hover:bg-green-700' :
                    nextStatus === 'Failed' ? 'bg-red-600 hover:bg-red-700' :
                    nextStatus === 'Picked Up' ? 'bg-blue-600 hover:bg-blue-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Mark as {nextStatus}
                </button>
              ))}
              
              {allowedTransitions[selectedOrder.status]?.length === 0 && (
                <div className="text-sm text-slate-600 p-3 bg-slate-50 rounded">
                  No actions available for this status
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link 
                to={`/orders/${selectedOrder._id}`}
                className="block text-center bg-slate-600 text-white py-2 px-3 rounded"
              >
                View Full Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
