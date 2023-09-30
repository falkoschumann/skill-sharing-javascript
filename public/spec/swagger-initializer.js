/* global SwaggerUIBundle */
/* global SwaggerUIStandalonePreset */

window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: './openapi-0.1.0.yaml',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: 'StandaloneLayout',
  });
};
