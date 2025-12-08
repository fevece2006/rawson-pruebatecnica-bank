module.exports = function override(config, env) {
  // Ignorar warnings de source maps de node_modules
  if (config.module && config.module.rules) {
    config.module.rules.forEach(rule => {
      if (rule.oneOf) {
        rule.oneOf.forEach(oneOfRule => {
          if (oneOfRule.use && oneOfRule.use.some) {
            oneOfRule.use.forEach(useEntry => {
              if (useEntry.loader && useEntry.loader.includes('source-map-loader')) {
                if (!useEntry.options) {
                  useEntry.options = {};
                }
                useEntry.options.filterSourceMappingUrl = (url, resourcePath) => {
                  // Ignorar source maps de node_modules/@react-keycloak
                  if (resourcePath.includes('node_modules/@react-keycloak')) {
                    return false;
                  }
                  return true;
                };
              }
            });
          }
        });
      }
    });
  }

  // Suprimir warnings de source maps
  config.ignoreWarnings = [
    {
      module: /node_modules\/@react-keycloak/,
    },
    function ignoreSourcemapsloaderWarnings(warning) {
      return (
        warning.module &&
        warning.module.resource.includes('node_modules') &&
        warning.details &&
        warning.details.includes('source-map-loader')
      );
    },
  ];

  return config;
};
