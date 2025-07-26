'use client';

import { Twitter, Copy, Share2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FacebookIcon } from './icons/facebook-icon';
import { trackContentShare } from '@/app/actions/analytics-actions';

interface ShareButtonsProps {
  title: string;
  url: string;
  contentType?: 'blog' | 'event' | 'course' | 'service';
  contentId?: string;
}

const socialLinks = (url: string, title: string) => ({
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
});

export function ShareButtons({ title, url, contentType, contentId }: ShareButtonsProps) {
  const { toast } = useToast();
  const links = socialLinks(url, title);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copiado!', description: 'O link foi copiado para a área de transferência.' });
    
    // Track share if content info is provided
    if (contentType && contentId) {
      trackContentShare(contentType, contentId, 'copy_link');
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    // Track share if content info is provided
    if (contentType && contentId) {
      trackContentShare(contentType, contentId, platform);
    }
  };
  
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold">Compartilhar:</span>
      <div className="flex items-center gap-2">
         <Button variant="outline" size="icon" asChild>
          <a 
            href={links.whatsapp} 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Compartilhar no WhatsApp"
            onClick={() => handleSocialShare('whatsapp')}
          >
            <MessageSquare className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" size="icon" asChild>
          <a 
            href={links.twitter} 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Compartilhar no Twitter/X"
            onClick={() => handleSocialShare('twitter')}
          >
            <Twitter className="h-4 w-4" />
          </a>
        </Button>
         <Button variant="outline" size="icon" asChild>
          <a 
            href={links.facebook} 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Compartilhar no Facebook"
            onClick={() => handleSocialShare('facebook')}
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="outline" size="icon" onClick={handleCopyLink} aria-label="Copiar link">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SharePopover({ title, url, contentType, contentId }: ShareButtonsProps) {
  const { toast } = useToast();
  const links = socialLinks(url, title);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copiado!', description: 'O link foi copiado para a área de transferência.' });
    
    // Track share if content info is provided
    if (contentType && contentId) {
      trackContentShare(contentType, contentId, 'copy_link');
    }
  };

  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    // Track share if content info is provided
    if (contentType && contentId) {
      trackContentShare(contentType, contentId, platform);
    }
  };

  return (
      <Popover>
          <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Compartilhar"><Share2 className="h-4 w-4"/></Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
              <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" asChild>
                      <a 
                        href={links.whatsapp} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Compartilhar no WhatsApp"
                        onClick={() => handleSocialShare('whatsapp')}
                      >
                         <MessageSquare className="h-4 w-4" />
                      </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                      <a 
                        href={links.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title={`Compartilhar no Twitter/X`}
                        onClick={() => handleSocialShare('twitter')}
                      >
                          <Twitter className="h-4 w-4" />
                      </a>
                  </Button>
                   <Button variant="ghost" size="icon" asChild>
                      <a 
                        href={links.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title={`Compartilhar no Facebook`}
                        onClick={() => handleSocialShare('facebook')}
                      >
                          <FacebookIcon className="h-4 w-4" />
                      </a>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copiar link">
                      <Copy className="h-4 w-4" />
                  </Button>
              </div>
          </PopoverContent>
      </Popover>
  )
}
