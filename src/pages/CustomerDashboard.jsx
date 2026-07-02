import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function CustomerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`);
        setOrders(data);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Dashboard</h1>
        <Link to="/place-order" className="bg-blue-600 text-white px-4 py-2 rounded">Place Order</Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-10 rounded shadow text-center">
          <div className="text-lg font-semibold mb-2">No orders yet</div>
          <div className="text-slate-500 mb-4">Create your first delivery to see it here.</div>
          <Link to="/place-order" className="bg-blue-600 text-white px-4 py-2 rounded">Create Order</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="bg-white p-4 rounded shadow hover:shadow-md">
              <div className="font-semibold">#{order._id.slice(-6)}</div>
              <div className="text-sm text-slate-500">Status: {order.status}</div>
              <div className="text-sm">₹{order.pricing?.totalCharge ?? 0}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
