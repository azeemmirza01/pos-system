import { useState, useEffect } from 'react';
import { Search, Eye, Download } from 'lucide-react';
import db from '../services/database';
import { format } from 'date-fns';

export default function Invoices() {
  const [sales, setSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const salesData = await db.getSales(500);
      setSales(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewSale = async (saleId) => {
    try {
      const sale = await db.getSale(saleId);
      setSelectedSale(sale);
    } catch (error) {
      console.error('Error loading sale:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Invoices</h1>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sale.invoice_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{sale.customer_name || 'Walk-in'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    ${sale.total_amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 capitalize">{sale.payment_method}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewSale(sale.id)}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    <Eye className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Download className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Invoice Details</h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-semibold">{selectedSale.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {format(new Date(selectedSale.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {selectedSale.customer_name && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedSale.customer_name}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-center py-2">Quantity</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items?.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.product_name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.price.toFixed(2)}</td>
                      <td className="text-right py-2">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right py-2 font-semibold">Subtotal:</td>
                    <td className="text-right py-2 font-semibold">
                      ${(selectedSale.total_amount - selectedSale.tax + selectedSale.discount).toFixed(2)}
                    </td>
                  </tr>
                  {selectedSale.discount > 0 && (
                    <tr>
                      <td colSpan="3" className="text-right py-2">Discount:</td>
                      <td className="text-right py-2">-${selectedSale.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  {selectedSale.tax > 0 && (
                    <tr>
                      <td colSpan="3" className="text-right py-2">Tax:</td>
                      <td className="text-right py-2">${selectedSale.tax.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2">
                    <td colSpan="3" className="text-right py-2 font-bold text-lg">Total:</td>
                    <td className="text-right py-2 font-bold text-lg">
                      ${selectedSale.total_amount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setSelectedSale(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

