import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/common/ui/card';
import { Button } from '@/app/common/ui/button';
import { KeyRound, Plus, Clock, Ban, ShieldX } from 'lucide-react';
import {
  useApiTokens,
  useRevokeApiToken,
} from '@/app/features/api-tokens/use-api-tokens';

export const Route = createFileRoute('/_authenticated/api-tokens/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useApiTokens();
  const tokens = data?.tokens ?? [];
  const revoke = useRevokeApiToken();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="pl-0 text-sm">
              <Link to="/dashboard" className="inline-flex items-center gap-2">
                ← Back to dashboard
              </Link>
            </Button>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-muted-foreground" />
              API Tokens
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage tokens used to access wording schemas and
              values.
            </p>
          </div>
          <Button asChild size="sm" className="inline-flex items-center gap-2">
            <Link to="/api-tokens/create">
              <Plus className="w-4 h-4" />
              New token
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading tokens...</p>
            ) : error ? (
              <p className="text-sm text-destructive">Failed to load tokens</p>
            ) : tokens.length === 0 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  No API tokens yet.
                </p>
                <Button asChild size="sm">
                  <Link to="/api-tokens/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create token
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires{' '}
                          {token.expiresAt
                            ? new Date(token.expiresAt).toLocaleDateString()
                            : '—'}
                        </span>
                        {token.revokedAt && (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <Ban className="w-3 h-3" /> Revoked
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="text-right">
                        <div>
                          Created{' '}
                          {token.createdAt
                            ? new Date(token.createdAt).toLocaleDateString()
                            : '—'}
                        </div>
                        {token.lastUsedAt && (
                          <div>
                            Last used{' '}
                            {new Date(token.lastUsedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {!token.revokedAt && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={revoke.isPending}
                          onClick={() => revoke.mutate(token.id)}
                          className="inline-flex items-center gap-1"
                        >
                          <ShieldX className="w-4 h-4" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
