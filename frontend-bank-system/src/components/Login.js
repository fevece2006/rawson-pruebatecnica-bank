import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === 'admin' && password === 'admin') {
      onLogin({ username, role: 'admin' });
    } else if (username === 'user' && password === 'user') {
      onLogin({ username, role: 'user' });
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🏦 Rawson Bank System</h1>
          <p className="text-gray-600 text-xs sm:text-sm">Sistema Bancario Distribuido</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 sm:py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center">
          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Credenciales de prueba:</p>
          <p className="text-xs text-gray-600">
            👤 Admin: <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 text-xs">admin / admin</code>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            👤 Usuario: <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 text-xs">user / user</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
