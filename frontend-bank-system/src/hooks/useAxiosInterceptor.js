import { useKeycloak } from '@react-keycloak/web';

export const useAxiosInterceptor = () => {
  const { keycloak } = useKeycloak();

  const getAuthConfig = () => {
    if (keycloak?.token) {
      return {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      };
    }
    return {};
  };

  return { getAuthConfig, token: keycloak?.token };
};
