
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useTourContext } from '@/contexts/TourContext';

const TourOverlay = () => {
  const { 
    isActive, 
    currentStepData, 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    skipTour,
    completeTour
  } = useTourContext();
  
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    console.log('TourOverlay effect - isActive:', isActive, 'currentStepData:', currentStepData);
    if (!isActive || !currentStepData) return;

    const findTarget = () => {
      console.log('Looking for target:', currentStepData.target);
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      console.log('Found element:', element);
      if (element) {
        setTargetElement(element);
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        
        // Calculate overlay styles - mobile responsive
        const rect = element.getBoundingClientRect();
        const padding = window.innerWidth < 768 ? 4 : 8;
        
        setOverlayStyle({
          position: 'fixed',
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + (padding * 2),
          height: rect.height + (padding * 2),
          borderRadius: window.innerWidth < 768 ? '8px' : '12px',
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none',
          zIndex: 9998,
          transition: 'all 0.3s ease'
        });

        // Calculate tooltip position - mobile responsive
        const isMobile = window.innerWidth < 768;
        const tooltipWidth = isMobile ? window.innerWidth - 32 : 320;
        const tooltipMaxHeight = isMobile ? 'auto' : '220px';
        const placement = isMobile ? 'bottom' : (currentStepData.placement || 'right');
        const margin = isMobile ? 8 : 16;
        
        let top, left;
        
        if (isMobile) {
          // On mobile, always place tooltip at bottom with full width
          top = Math.min(rect.bottom + margin, window.innerHeight - 300);
          left = 16;
        } else {
          // Desktop positioning logic
          switch (placement) {
            case 'top':
              top = rect.top - 180 - margin;
              left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
              break;
            case 'bottom':
              top = rect.bottom + margin;
              left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
              break;
            case 'left':
              top = rect.top + (rect.height / 2) - 90;
              left = rect.left - tooltipWidth - margin;
              break;
            case 'right':
              top = rect.top + (rect.height / 2) - 90;
              left = rect.right + margin;
              break;
            default:
              top = rect.top + (rect.height / 2) - 90;
              left = rect.right + margin;
          }

          // Ensure tooltip stays within viewport on desktop
          if (left < 10) left = 10;
          if (left + tooltipWidth > window.innerWidth - 10) left = window.innerWidth - tooltipWidth - 10;
          if (top < 10) top = 10;
          if (top + 180 > window.innerHeight - 10) top = window.innerHeight - 180 - 10;
        }

        setTooltipStyle({
          position: 'fixed',
          top,
          left,
          width: tooltipWidth,
          maxHeight: tooltipMaxHeight,
          zIndex: 9999,
          transform: 'scale(1)',
          opacity: 1,
          transition: 'all 0.3s ease',
          overflow: isMobile ? 'visible' : 'hidden'
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

  console.log('TourOverlay render check - isActive:', isActive, 'currentStepData:', currentStepData, 'targetElement:', targetElement);
  if (!isActive || !currentStepData || !targetElement) return null;

  const isMobile = window.innerWidth < 768;

  return (
    <>
      {/* Highlight overlay */}
      <div style={overlayStyle} />
      
      {/* Tooltip */}
      <Card style={tooltipStyle} className="shadow-xl border-2 border-primary bg-card/98 backdrop-blur-sm">
        <CardHeader className={isMobile ? "pb-2 px-4 pt-4" : "pb-3"}>
          <div className="flex items-center justify-between">
            <CardTitle className={isMobile ? "text-base font-semibold" : "text-lg font-semibold"}>
              {currentStepData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={completeTour}
              className={isMobile ? "h-5 w-5" : "h-6 w-6"}
            >
              <X className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
            </Button>
          </div>
          <div className={isMobile ? "text-xs text-muted-foreground" : "text-xs text-muted-foreground"}>
            Step {currentStep + 1} of {totalSteps}
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "space-y-3 px-4 pb-4" : "space-y-4"}>
          <p className={isMobile ? "text-sm text-foreground leading-relaxed" : "text-sm text-foreground"}>
            {currentStepData.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStepData.showPrev && currentStep > 0 && (
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={prevStep}
                  className={isMobile ? "h-8 text-xs" : "h-8"}
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  {isMobile ? "Prev" : "Previous"}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {currentStepData.showSkip && (
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "sm"}
                  onClick={skipTour}
                  className={isMobile ? "h-8 text-xs text-muted-foreground" : "h-8 text-muted-foreground"}
                >
                  <SkipForward className="h-3 w-3 mr-1" />
                  Skip
                </Button>
              )}
              {currentStepData.showNext && (
                <Button
                  size={isMobile ? "sm" : "sm"}
                  onClick={nextStep}
                  className={isMobile ? "h-8 text-xs" : "h-8"}
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
          <div className="flex justify-center gap-1 pt-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full transition-colors ${
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
