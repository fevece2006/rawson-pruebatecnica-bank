import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'rawson-bank',
  clientId: 'rawson-bank-frontend',
});

export default keycloak;
