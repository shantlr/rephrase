import { ENTRA_ID } from '@/common/auth';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

export const $authStartMicrosoftEntraId = createServerFn({
  method: 'GET',
  response: 'data',
}).handler(({ signal }) => {
  const { url, state, codeVerifier, scopes } = ENTRA_ID.createAuthUrl();

  throw redirect({
    href: url.toString(),
  });
});
