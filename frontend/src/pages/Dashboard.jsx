import { useEffect, useState } from 'react';
import { ShoppingCart, Package, Users, DollarSign } from 'lucide-react';
import usePosStore from '../stores/usePosStore';
import db from '../services/database';

export default function Dashboard() {
  const { products, customers } = usePosStore();
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    totalProducts: 0,
    totalCustomers: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const sales = await db.getSales(1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
      const todaySales = sales
        .filter(sale => new Date(sale.created_at) >= today)
        .reduce((sum, sale) => sum + sale.total_amount, 0);

      setStats({
        totalSales,
        todaySales,
        totalProducts: products.length,
        totalCustomers: customers.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      label: 'Today Sales',
      value: `$${stats.todaySales.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'Total Sales',
      value: `$${stats.totalSales.toFixed(2)}`,
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      label: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/billing"
            className="p-4 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors text-center"
          >
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="font-medium text-gray-800">New Sale</p>
          </a>
          <a
            href="/products"
            className="p-4 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors text-center"
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="font-medium text-gray-800">Manage Products</p>
          </a>
          <a
            href="/customers"
            className="p-4 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors text-center"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-primary-600" />
            <p className="font-medium text-gray-800">Manage Customers</p>
          </a>
        </div>
      </div>
    </div>
  );
}

