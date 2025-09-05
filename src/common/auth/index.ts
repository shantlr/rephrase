import * as arctic from 'arctic';
import {
  MICROSOFT_ENTRA_ID_CLIENT_ID,
  MICROSOFT_ENTRA_ID_CLIENT_SECRET,
  MICROSOFT_ENTRA_ID_REDIRECT_URI,
  MICROSOFT_ENTRA_ID_TENANT_ID,
} from '../env/microsoft-entra-id';

const entraId = new arctic.MicrosoftEntraId(
  MICROSOFT_ENTRA_ID_TENANT_ID,
  MICROSOFT_ENTRA_ID_CLIENT_ID,
  MICROSOFT_ENTRA_ID_CLIENT_SECRET,
  MICROSOFT_ENTRA_ID_REDIRECT_URI,
);

export const ENTRA_ID = {
  createAuthUrl: () => {
    const state = arctic.generateState();
    const codeVerifier = arctic.generateCodeVerifier();
    const scopes = ['openid', 'profile'];
    const url = entraId.createAuthorizationURL(state, codeVerifier, scopes);
    return {
      url,
      state,
      codeVerifier,
      scopes,
    };
  },
  validateAuthResponse: async (code: string, codeVerifier: string) => {
    try {
      const tokens = await entraId.validateAuthorizationCode(
        code,
        codeVerifier,
      );
      const accessToken = tokens.accessToken();
      const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
      const refreshToken = tokens.refreshToken();
      return {
        accessToken,
        accessTokenExpiresAt,
        refreshToken,
      };
    } catch (e) {
      if (e instanceof arctic.OAuth2RequestError) {
        // Invalid authorization code, credentials, or redirect URI
        const code = e.code;
        // ...
      }
      if (e instanceof arctic.ArcticFetchError) {
        // Failed to call `fetch()`
        const cause = e.cause;
        // ...
      }

      // Parse error
      throw e;
    }
  },
  refreshAccessToken: async (refreshToken: string) => {
    try {
      const tokens = await entraId.refreshAccessToken(refreshToken, []);
      const accessToken = tokens.accessToken();
      const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
      const newRefreshToken = tokens.refreshToken();
      return {
        accessToken,
        accessTokenExpiresAt,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      if (e instanceof arctic.OAuth2RequestError) {
        // Invalid refresh token or credentials
        const code = e.code;
        // ...
      }
      if (e instanceof arctic.ArcticFetchError) {
        // Failed to call `fetch()`
        const cause = e.cause;
        // ...
      }

      // Parse error
      throw e;
    }
  },
};
