import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useTour } from '@/hooks/useTour';
import { useAuth } from '@/contexts/AuthContext';

const TourOverlay = () => {
  const { user } = useAuth();
  const { 
    isActive, 
    currentStepData, 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    skipTour,
    completeTour
  } = useTour(user);
  
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const findTarget = () => {
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Calculate overlay styles
        const rect = element.getBoundingClientRect();
        const padding = 8;
        
        setOverlayStyle({
          position: 'fixed',
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + (padding * 2),
          height: rect.height + (padding * 2),
          borderRadius: '12px',
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none',
          zIndex: 9998,
          transition: 'all 0.3s ease'
        });

        // Calculate tooltip position - beside each feature
        const tooltipWidth = 300;
        const tooltipHeight = 180;
        const placement = currentStepData.placement || 'right';
        const margin = 16; // Space between element and tooltip
        
        let top, left;
        
        switch (placement) {
          case 'top':
            top = rect.top - tooltipHeight - margin;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'bottom':
            top = rect.bottom + margin;
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left - tooltipWidth - margin;
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + margin;
            break;
          default:
            // Default to right side
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + margin;
        }

        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 10) left = 10;
        if (left + tooltipWidth > viewportWidth - 10) left = viewportWidth - tooltipWidth - 10;
        if (top < 10) top = 10;
        if (top + tooltipHeight > viewportHeight - 10) top = viewportHeight - tooltipHeight - 10;

        setTooltipStyle({
          position: 'fixed',
          top,
          left,
          width: tooltipWidth,
          zIndex: 9999,
          transform: 'scale(1)',
          opacity: 1,
          transition: 'all 0.3s ease'
        });
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(findTarget, 100);
    
    // Re-calculate on window resize
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget);
    };
  }, [isActive, currentStepData]);

  if (!isActive || !currentStepData || !targetElement) return null;

  return (
    <>
      {/* Highlight overlay */}
      <div style={overlayStyle} />
      
      {/* Tooltip */}
      <Card style={tooltipStyle} className="shadow-xl border-2 border-primary bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {currentStepData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={completeTour}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground">
            {currentStepData.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStepData.showPrev && currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="h-8"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {currentStepData.showSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="h-8 text-muted-foreground"
                >
                  <SkipForward className="h-3 w-3 mr-1" />
                  Skip Tour
                </Button>
              )}
              {currentStepData.showNext && (
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="h-8"
                >
                  {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                  {currentStep !== totalSteps - 1 && (
                    <ChevronRight className="h-3 w-3 ml-1" />
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-1 pt-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TourOverlay;