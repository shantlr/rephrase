import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/common/ui/dialog';
import { Button } from '@/app/common/ui/button';
import { useState } from 'react';

type TokenModalProps = {
  token: string | null;
  onClose: () => void;
};

export const TokenModal = ({ token, onClose }: TokenModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!token) {
      return;
    }
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Failed to copy token', e);
    }
  };

  return (
    <Dialog open={!!token} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New API token</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground w-full flex flex-col overflow-hidden">
          <p>This token is shown only once. Copy and store it securely now.</p>
          {token && (
            <div className="font-mono text-sm bg-muted px-3 py-2 rounded border wrap-break-word">
              {token}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCopy} disabled={!token}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
