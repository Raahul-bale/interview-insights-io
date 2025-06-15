import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useTour } from '@/hooks/useTour';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const TourButton = () => {
  const { user } = useAuth();
  const { startTour, hasSeenTour } = useTour(user);

  const handleTourClick = () => {
    // Always start/restart the tour when clicked
    startTour();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleTourClick}
          className="relative"
        >
          <HelpCircle className="h-5 w-5" />
          {!hasSeenTour && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{hasSeenTour ? 'Restart Tour' : 'Take a Tour'}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TourButton;