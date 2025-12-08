import React from "react";
import { createRoot } from "react-dom/client";
import { ReactKeycloakProvider } from '@react-keycloak/web';
import "./index.css";
import App from "./App";
import keycloak from './keycloak';

const keycloakProviderInitConfig = {
  onLoad: 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256',
};

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ReactKeycloakProvider 
    authClient={keycloak} 
    initOptions={keycloakProviderInitConfig}
    LoadingComponent={<div className="flex items-center justify-center min-h-screen"><div className="text-xl">Cargando autenticación...</div></div>}
  >
    <App />
  </ReactKeycloakProvider>
);
