import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import db from '../services/database';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    todayRevenue: 0
  });

  useEffect(() => {
    loadSales();
  }, [dateRange]);

  const loadSales = async () => {
    try {
      const allSales = await db.getSales(10000);
      const filtered = allSales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        const start = startOfDay(new Date(dateRange.start));
        const end = endOfDay(new Date(dateRange.end));
        return saleDate >= start && saleDate <= end;
      });
      setSales(filtered);
      calculateStats(filtered);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const calculateStats = (salesData) => {
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalTransactions = salesData.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    const today = startOfDay(new Date());
    const todaySales = salesData.filter(sale => 
      new Date(sale.created_at) >= today
    );
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);

    setStats({
      totalRevenue,
      totalTransactions,
      averageTransaction,
      todayRevenue
    });
  };

  const salesByDay = sales.reduce((acc, sale) => {
    const day = format(new Date(sale.created_at), 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = { date: day, revenue: 0, transactions: 0 };
    }
    acc[day].revenue += sale.total_amount;
    acc[day].transactions += 1;
    return acc;
  }, {});

  const dailySales = Object.values(salesByDay).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {stats.totalTransactions}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Transaction</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ${stats.averageTransaction.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Today Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ${stats.todayRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Sales</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Transactions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailySales.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {format(new Date(day.date), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-900">{day.transactions}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">
                      ${day.revenue.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

