import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8082';

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/v1/accounts`);
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
      });
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
      });
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
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">📋 Gestión de Cuentas</h2>
        <button
          onClick={fetchAccounts}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Total Cuentas</div>
          <div className="text-3xl font-bold">{accounts.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Saldo Total</div>
          <div className="text-3xl font-bold">${totalBalance.toFixed(2)}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Número de Cuenta</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Moneda</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Saldo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Propietario</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-700">{account.id}</td>
                <td className="px-4 py-4">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {account.accountNumber}
                  </code>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{account.currency}</td>
                <td className="px-4 py-4 text-sm font-semibold text-green-600">
                  ${account.balance.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{account.ownerId || 'N/A'}</td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => handleDebit(account.accountNumber)}
                    className="mr-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                  >
                    Debitar
                  </button>
                  <button
                    onClick={() => handleCredit(account.accountNumber)}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                  >
                    Acreditar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
