import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useTourContext } from '@/contexts/TourContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const TourButton = () => {
  const { startTour, hasSeenTour } = useTourContext();

  const handleTourClick = () => {
    console.log('Tour button clicked!');
    // Always start/restart the tour when clicked
    startTour();
    console.log('startTour() called');
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