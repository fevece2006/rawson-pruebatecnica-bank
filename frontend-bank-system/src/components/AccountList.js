import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';

function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8082';
  const { getAuthConfig } = useAxiosInterceptor();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/v1/accounts`, getAuthConfig());
      setAccounts(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las cuentas: ' + err.message);
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDebit = async (accountNumber) => {
    const amount = prompt('Ingrese el monto a debitar:');
    if (!amount || isNaN(amount)) return;

    try {
      await axios.post(`${backendUrl}/api/v1/accounts/debit`, {
        accountNumber,
        amount: parseFloat(amount)
      }, getAuthConfig());
      alert('Débito realizado con éxito');
      fetchAccounts();
    } catch (err) {
      alert('Error al realizar débito: ' + err.message);
    }
  };

  const handleCredit = async (accountNumber) => {
    const amount = prompt('Ingrese el monto a acreditar:');
    if (!amount || isNaN(amount)) return;

    try {
      await axios.post(`${backendUrl}/api/v1/accounts/credit`, {
        accountNumber,
        amount: parseFloat(amount)
      }, getAuthConfig());
      alert('Crédito realizado con éxito');
      fetchAccounts();
    } catch (err) {
      alert('Error al realizar crédito: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center text-gray-500">Cargando cuentas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button onClick={fetchAccounts} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
          Reintentar
        </button>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-6 pb-4 border-b-2 border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">📋 Gestión de Cuentas</h2>
        <button
          onClick={fetchAccounts}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="text-xs sm:text-sm opacity-90 mb-2">Total Cuentas</div>
          <div className="text-2xl sm:text-3xl font-bold">{accounts.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="text-xs sm:text-sm opacity-90 mb-2">Saldo Total</div>
          <div className="text-2xl sm:text-3xl font-bold">${totalBalance.toFixed(2)}</div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">ID</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Número de Cuenta</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Moneda</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Saldo</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Propietario</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap">{account.id}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {account.accountNumber}
                      </code>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap">{account.currency}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600 whitespace-nowrap">
                      ${account.balance.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 whitespace-nowrap">{account.ownerId || 'N/A'}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => handleDebit(account.accountNumber)}
                          className="px-2 sm:px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                        >
                          Debitar
                        </button>
                        <button
                          onClick={() => handleCredit(account.accountNumber)}
                          className="px-2 sm:px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          Acreditar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay cuentas registradas
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountList;
