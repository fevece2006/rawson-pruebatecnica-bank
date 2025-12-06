import React, { useState } from 'react';
import axios from 'axios';

function CreateAccount() {
  const [formData, setFormData] = useState({
    accountNumber: '',
    currency: 'USD',
    balance: '0',
    ownerId: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8082';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        accountNumber: formData.accountNumber,
        currency: formData.currency,
        balance: parseFloat(formData.balance),
        ownerId: formData.ownerId
      };

      await axios.post(`${backendUrl}/api/v1/accounts`, payload);
      
      setMessage({
        type: 'success',
        text: '✓ Cuenta creada exitosamente'
      });

      setFormData({
        accountNumber: '',
        currency: 'USD',
        balance: '0',
        ownerId: ''
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: '✗ Error al crear cuenta: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAccountNumber = () => {
    const randomNumber = 'ACC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData({ ...formData, accountNumber: randomNumber });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
      <div className="mb-6 pb-4 border-b-2 border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">➥ Crear Nueva Cuenta</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <form onSubmit={handleSubmit} className="xl:col-span-2 bg-gray-50 p-4 sm:p-6 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <label htmlFor="accountNumber" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Número de Cuenta *
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="ACC-XXXXXXXXX"
                  required
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={generateAccountNumber}
                  className="px-4 py-2 sm:py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 whitespace-nowrap transition-colors text-sm"
                >
                  Generar
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="currency" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              >
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - Libra Esterlina</option>
                <option value="ARS">ARS - Peso Argentino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <label htmlFor="balance" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Saldo Inicial *
              </label>
              <input
                type="number"
                id="balance"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label htmlFor="ownerId" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                ID del Propietario *
              </label>
              <input
                type="text"
                id="ownerId"
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                placeholder="USER-XXXX"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
          </div>

          {message && (
            <div className={`mb-4 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>

        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">ℹ️ Información</h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start text-xs sm:text-sm text-gray-600">
              <span className="text-indigo-500 font-bold mr-2">•</span>
              <span>El número de cuenta debe ser único en el sistema</span>
            </li>
            <li className="flex items-start text-sm text-gray-600">
              <span className="text-indigo-500 font-bold mr-2">•</span>
              <span>El saldo inicial puede ser 0 o mayor</span>
            </li>
            <li className="flex items-start text-sm text-gray-600">
              <span className="text-indigo-500 font-bold mr-2">•</span>
              <span>Todas las transacciones quedan registradas en el ledger</span>
            </li>
            <li className="flex items-start text-sm text-gray-600">
              <span className="text-indigo-500 font-bold mr-2">•</span>
              <span>Se aplicarán validaciones de negocio del backend</span>
            </li>
          </ul>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Ejemplo de cuenta:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "accountNumber": "ACC-X7Y9Z2K4L",
  "currency": "USD",
  "balance": 1000.00,
  "ownerId": "USER-001"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
