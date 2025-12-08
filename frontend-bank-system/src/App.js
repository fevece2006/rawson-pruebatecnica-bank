import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import Dashboard from './components/Dashboard';

function App() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-xl font-semibold text-gray-800">Cargando...</div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const user = {
    username: keycloak.tokenParsed?.preferred_username || 'Usuario',
    email: keycloak.tokenParsed?.email,
    name: keycloak.tokenParsed?.name,
    roles: keycloak.tokenParsed?.realm_access?.roles || [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard user={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;
