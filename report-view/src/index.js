import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

const root = createRoot(document.getElementById('root'));

const domain = process.env.REACT_APP_AUTH0_TENANT_DOMAIN;
const clientId = process.env.REACT_APP_REPORT_VIEW_CLIENT_ID;
const audience = process.env.REACT_APP_REPORT_API_AUDIENCE_DOMAIN;

root.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: audience,
      scope: "read:current_user update:current_user_metadata openid profile email"
    }}
  >
    <App />
  </Auth0Provider>,
);