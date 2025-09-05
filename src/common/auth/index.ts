import { db } from '@/data';
import { TanstackStartAuth } from '@/lib/authjs-tanstack-start';
import { KyselyAdapter } from '@auth/kysely-adapter';

export const {} = TanstackStartAuth({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  adapter: KyselyAdapter(db),
});
