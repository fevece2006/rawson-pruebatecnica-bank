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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">🏦 Rawson Bank</h1>
                <span className="hidden sm:inline-block mt-1 px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                  Microservices Architecture
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline-block px-3 sm:px-4 py-2 bg-white bg-opacity-10 rounded-lg text-xs sm:text-sm">
                👤 {user.username}
              </span>
              <button
                onClick={onLogout}
                className="px-3 sm:px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-xs sm:text-sm hover:bg-opacity-30 transition-all"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-60px)] sm:min-h-[calc(100vh-72px)] relative">
        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-72 sm:w-80 bg-white shadow-md flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex justify-between items-center p-4 lg:hidden border-b">
            <h3 className="font-bold text-gray-800">Menú</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4 sm:p-5 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 sm:px-5 py-3 mb-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  activeModule === item.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 sm:p-5 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Estado de Servicios</h4>
            {services.map((service, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-2 text-xs sm:text-sm">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${service.active ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-300'}`}></span>
                <span className="text-gray-700 truncate">{service.name}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
