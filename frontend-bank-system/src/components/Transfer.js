import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Transfer() {
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    sagaId: ''
  });
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8082';
  const orchestratorUrl = process.env.REACT_APP_ORCHESTRATOR_URL || 'http://localhost:8084';

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/accounts`);
      setAccounts(response.data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateSagaId = () => {
    const sagaId = 'SAGA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    setFormData({ ...formData, sagaId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (formData.fromAccount === formData.toAccount) {
      setMessage({
        type: 'error',
        text: '✗ La cuenta origen y destino no pueden ser iguales'
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        fromAccount: formData.fromAccount,
        toAccount: formData.toAccount,
        amount: parseFloat(formData.amount),
        sagaId: formData.sagaId || undefined
      };

      const response = await axios.post(`${orchestratorUrl}/api/v1/transfer/start`, payload);
      
      setMessage({
        type: 'success',
        text: `✓ Transferencia iniciada exitosamente. Saga ID: ${response.data.sagaId || 'N/A'}`
      });

      setFormData({
        fromAccount: '',
        toAccount: '',
        amount: '',
        sagaId: ''
      });

      setTimeout(fetchAccounts, 1000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: '✗ Error al procesar transferencia: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
      <div className="mb-6 pb-4 border-b-2 border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">💸 Realizar Transferencia</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <form onSubmit={handleSubmit} className="xl:col-span-2 bg-gray-50 p-4 sm:p-6 rounded-lg">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Detalles de la Transferencia</h3>

          <div className="space-y-4 mb-4">
            <div>
              <label htmlFor="fromAccount" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Cuenta Origen *
              </label>
              <select
                id="fromAccount"
                name="fromAccount"
                value={formData.fromAccount}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              >
                <option value="">Seleccione cuenta origen</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.accountNumber}>
                    {acc.accountNumber} - ${acc.balance} {acc.currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-2xl">⬇️</div>

            <div>
              <label htmlFor="toAccount" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Cuenta Destino *
              </label>
              <select
                id="toAccount"
                name="toAccount"
                value={formData.toAccount}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              >
                <option value="">Seleccione cuenta destino</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.accountNumber}>
                    {acc.accountNumber} - ${acc.balance} {acc.currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Monto *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label htmlFor="sagaId" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Saga ID (opcional)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  id="sagaId"
                  name="sagaId"
                  value={formData.sagaId}
                  onChange={handleChange}
                  placeholder="SAGA-XXXXXXXXX (opcional)"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={generateSagaId}
                  className="px-4 py-2 sm:py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 whitespace-nowrap transition-colors text-sm"
                >
                  Generar
                </button>
              </div>
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
              {loading ? 'Procesando...' : 'Iniciar Transferencia'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3">🔄 Patrón Saga</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Las transferencias utilizan el <strong>Patrón Saga</strong> para garantizar 
              consistencia eventual en transacciones distribuidas.
            </p>

            <div className="bg-white p-3 sm:p-4 rounded-lg border-l-4 border-indigo-500 mb-4">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-3">Flujo de la Saga:</h4>
              <ol className="space-y-3 text-xs sm:text-sm">
                <li>
                  <strong className="text-indigo-600 block mb-1">STARTED</strong>
                  <p className="text-gray-600 text-xs">Se crea la saga y se registra en el orchestrator</p>
                </li>
                <li>
                  <strong className="text-indigo-600 block mb-1">DEBITED</strong>
                  <p className="text-gray-600 text-xs">Se debita el monto de la cuenta origen</p>
                </li>
                <li>
                  <strong className="text-indigo-600 block mb-1">COMPLETED</strong>
                  <p className="text-gray-600 text-xs">Se acredita el monto en la cuenta destino</p>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Compensación Automática</h4>
              <p className="text-xs text-yellow-700 leading-relaxed">
                Si ocurre un error después del débito, se ejecutará automáticamente 
                la compensación para revertir la operación.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">🛠️ Stack Tecnológico:</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  Apache Camel (Rutas de integración)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  Apache Kafka (Message broker)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  Resilience4j (Circuit Breaker)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 font-bold mr-2">✓</span>
                  WebClient (Comunicación reactiva)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transfer;
