import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ShareLinkProps {
  itemId: number;
  itemType: 'expense' | 'earning';
}

const ShareLink: React.FC<ShareLinkProps> = ({ itemId, itemType }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const getShareLink = useCallback(() => {
    if (typeof window !== 'undefined' && window.location) {
      const url = new URL(window.location.href);
      url.search = `?share=${itemType}-${itemId}`;
      return url.toString();
    }
    return '';
  }, [itemId, itemType]);

  const copyToClipboard = () => {
    const shareLink = getShareLink();
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        toast({
          title: 'Link Copied',
          description: 'The share link has been copied to your clipboard.',
        });
        setIsDialogOpen(false);
      }).catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to copy link. Please try again.',
          variant: 'destructive',
        });
      });
    } else {
      toast({
        title: 'Error',
        description: 'Unable to generate share link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Share</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {itemType.charAt(0).toUpperCase() + itemType.slice(1)} Details</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input value={getShareLink()} readOnly />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareLink;