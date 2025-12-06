import React, { useState } from 'react';
import AccountList from './AccountList';
import CreateAccount from './CreateAccount';
import Transfer from './Transfer';
import SagaMonitor from './SagaMonitor';

function Dashboard({ user, onLogout }) {
  const [activeModule, setActiveModule] = useState('accounts');

  const renderModule = () => {
    switch (activeModule) {
      case 'accounts':
        return <AccountList />;
      case 'create':
        return <CreateAccount />;
      case 'transfer':
        return <Transfer />;
      case 'saga':
        return <SagaMonitor />;
      default:
        return <AccountList />;
    }
  };

  const navItems = [
    { id: 'accounts', label: '📋 Gestión de Cuentas' },
    { id: 'create', label: '➕ Crear Cuenta' },
    { id: 'transfer', label: '💸 Transferencias' },
    { id: 'saga', label: '🔄 Monitor de Sagas' }
  ];

  const services = [
    { name: 'API Gateway', active: true },
    { name: 'Backend Service', active: true },
    { name: 'Orchestrator', active: true },
    { name: 'Kafka Broker', active: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🏦 Rawson Bank System</h1>
            <span className="inline-block mt-1 px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
              Microservices Architecture
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-white bg-opacity-10 rounded-lg text-sm">
              👤 {user.username} ({user.role})
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-sm hover:bg-opacity-30 transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-md flex flex-col">
          <nav className="flex-1 p-5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full text-left px-5 py-3 mb-2 rounded-lg font-medium transition-all ${
                  activeModule === item.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-5 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Estado de Servicios</h4>
            {services.map((service, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${service.active ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-300'}`}></span>
                <span className="text-gray-700">{service.name}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
