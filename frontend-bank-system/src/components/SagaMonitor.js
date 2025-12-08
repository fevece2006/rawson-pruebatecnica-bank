import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAxiosInterceptor } from '../hooks/useAxiosInterceptor';

function SagaMonitor() {
  const { getAuthConfig } = useAxiosInterceptor();
  const [sagas, setSagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const orchestratorUrl = process.env.REACT_APP_ORCHESTRATOR_URL || 'http://localhost:8084';

  useEffect(() => {
    fetchSagas();
    const interval = setInterval(fetchSagas, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSagas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${orchestratorUrl}/api/v1/transfer/sagas`, getAuthConfig());
      setSagas(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar sagas: ' + err.message);
      console.error('Error fetching sagas:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      STARTED: { class: 'bg-blue-100 text-blue-800', label: '🔵 Iniciada' },
      DEBITED: { class: 'bg-yellow-100 text-yellow-800', label: '🟡 Debitada' },
      COMPLETED: { class: 'bg-green-100 text-green-800', label: '🟢 Completada' },
      FAILED: { class: 'bg-red-100 text-red-800', label: '🔴 Fallida' },
      COMPENSATED: { class: 'bg-orange-100 text-orange-800', label: '🟠 Compensada' }
    };
    return statusMap[status] || { class: 'bg-gray-100 text-gray-800', label: status };
  };

  const filteredSagas = filter === 'ALL' 
    ? sagas 
    : sagas.filter(saga => saga.status === filter);

  const stats = {
    total: sagas.length,
    completed: sagas.filter(s => s.status === 'COMPLETED').length,
    failed: sagas.filter(s => s.status === 'FAILED').length,
    inProgress: sagas.filter(s => ['STARTED', 'DEBITED'].includes(s.status)).length
  };

  if (loading && sagas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
        <div className="text-center text-gray-500 text-sm sm:text-base">Cargando sagas...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">🔄 Monitor de Sagas</h2>
        <button
          onClick={fetchSagas}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="text-xs sm:text-sm opacity-90 mb-2">Total Sagas</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="text-xs sm:text-sm opacity-90 mb-2">Completadas</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.completed}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="text-xs sm:text-sm opacity-90 mb-2">Fallidas</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.failed}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="text-xs sm:text-sm opacity-90 mb-2">En Progreso</div>
          <div className="text-2xl sm:text-3xl font-bold">{stats.inProgress}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'COMPLETED', 'FAILED', 'COMPENSATED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-500 text-white'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-500'
            }`}
          >
            {f === 'ALL' ? 'Todas' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Saga ID</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Cuenta Origen</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Cuenta Destino</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Monto</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Estado</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Creada</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Actualizada</th>
              </tr>
            </thead>
            <tbody>
              {filteredSagas.map((saga) => {
                const statusInfo = getStatusBadge(saga.status);
                return (
                  <tr key={saga.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {saga.sagaId}
                      </code>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {saga.fromAccount}
                      </code>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {saga.toAccount}
                      </code>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-indigo-600 whitespace-nowrap">
                      ${saga.amount.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs text-gray-600 whitespace-nowrap">
                      {new Date(saga.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-xs text-gray-600 whitespace-nowrap">
                      {new Date(saga.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSagas.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay sagas {filter !== 'ALL' ? `con estado ${filter}` : 'registradas'}
          </div>
        )}
      </div>
    </div>
  );
}

export default SagaMonitor;
