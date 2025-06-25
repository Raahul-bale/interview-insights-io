
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
        
        // Calculate overlay styles with better mobile handling
        const rect = element.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;
        const padding = isMobile ? 8 : 12;
        
        setOverlayStyle({
          position: 'fixed',
          top: Math.max(0, rect.top - padding),
          left: Math.max(0, rect.left - padding),
          width: Math.min(window.innerWidth - Math.max(0, rect.left - padding), rect.width + (padding * 2)),
          height: rect.height + (padding * 2),
          borderRadius: isMobile ? '8px' : '12px',
          boxShadow: `0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.4)`,
          pointerEvents: 'none',
          zIndex: 99997,
          transition: 'all 0.2s ease-out',
          border: '2px solid rgba(59, 130, 246, 0.7)'
        });

        // Improved tooltip positioning
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let tooltipWidth = isMobile ? Math.min(viewportWidth - 20, 320) : 360;
        const tooltipHeight = isMobile ? 300 : 240;
        const margin = isMobile ? 16 : 24;
        
        let top, left;
        
        if (isMobile) {
          // Mobile: Always place below or above the target
          if (rect.bottom + margin + tooltipHeight < viewportHeight) {
            // Place below
            top = rect.bottom + margin;
          } else {
            // Place above
            top = Math.max(10, rect.top - tooltipHeight - margin);
          }
          left = Math.max(10, (viewportWidth - tooltipWidth) / 2);
        } else {
          // Desktop: Try right, then left, then below
          const placement = currentStepData.placement || 'right';
          
          switch (placement) {
            case 'right':
              if (rect.right + margin + tooltipWidth < viewportWidth) {
                left = rect.right + margin;
                top = Math.max(20, Math.min(
                  rect.top + (rect.height / 2) - (tooltipHeight / 2),
                  viewportHeight - tooltipHeight - 20
                ));
              } else {
                // Fallback to left
                left = Math.max(10, rect.left - tooltipWidth - margin);
                top = Math.max(20, Math.min(
                  rect.top + (rect.height / 2) - (tooltipHeight / 2),
                  viewportHeight - tooltipHeight - 20
                ));
              }
              break;
            case 'left':
              left = Math.max(10, rect.left - tooltipWidth - margin);
              top = Math.max(20, Math.min(
                rect.top + (rect.height / 2) - (tooltipHeight / 2),
                viewportHeight - tooltipHeight - 20
              ));
              break;
            case 'bottom':
              top = Math.min(rect.bottom + margin, viewportHeight - tooltipHeight - 20);
              left = Math.max(10, Math.min(
                rect.left + (rect.width / 2) - (tooltipWidth / 2),
                viewportWidth - tooltipWidth - 10
              ));
              break;
            case 'top':
            default:
              top = Math.max(20, rect.top - tooltipHeight - margin);
              left = Math.max(10, Math.min(
                rect.left + (rect.width / 2) - (tooltipWidth / 2),
                viewportWidth - tooltipWidth - 10
              ));
              break;
          }
        }

        setTooltipStyle({
          position: 'fixed',
          top: Math.max(10, top),
          left: Math.max(10, left),
          width: tooltipWidth,
          maxHeight: isMobile ? '300px' : '240px',
          zIndex: 99998,
          transform: 'scale(1)',
          opacity: 1,
          transition: 'all 0.2s ease-out'
        });
      }
    };

    const timer = setTimeout(findTarget, 100);
    
    const handleResize = () => setTimeout(findTarget, 50);
    const handleScroll = () => setTimeout(findTarget, 50);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isActive, currentStepData]);

  if (!isActive || !currentStepData || !targetElement) return null;

  const isMobile = window.innerWidth < 768;

  return (
    <>
      {/* Highlight overlay */}
      <div style={overlayStyle} />
      
      {/* Enhanced white glass tooltip */}
      <Card 
        style={tooltipStyle} 
        className="shadow-xl border border-white/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
      >
        <CardHeader className={`${isMobile ? "pb-2 px-4 pt-4" : "pb-3 px-5 pt-4"} relative`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <CardTitle className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-gray-900 dark:text-white leading-tight`}>
                {currentStepData.title}
              </CardTitle>
              <div className={`${isMobile ? "text-xs mt-1" : "text-sm mt-2"} text-gray-500 dark:text-gray-400 font-medium`}>
                Step {currentStep + 1} of {totalSteps}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={completeTour}
              className={`${isMobile ? "h-7 w-7" : "h-8 w-8"} hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-full shrink-0 absolute top-3 right-3`}
            >
              <X className={`${isMobile ? "h-4 w-4" : "h-4 w-4"} text-gray-600 dark:text-gray-400`} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className={`${isMobile ? "space-y-4 px-4 pb-4" : "space-y-4 px-5 pb-5"}`}>
          <p className={`${isMobile ? "text-sm leading-relaxed" : "text-base leading-relaxed"} text-gray-700 dark:text-gray-200`}>
            {currentStepData.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStepData.showPrev && currentStep > 0 && (
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={prevStep}
                  className={`${isMobile ? "h-9 text-xs px-3" : "h-10 px-4"} bg-white/80 border-gray-300/60 hover:bg-white/90 dark:bg-gray-800/80 dark:border-gray-600/60 dark:hover:bg-gray-700/90`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {isMobile ? "Back" : "Previous"}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {currentStepData.showSkip && (
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "default"}
                  onClick={skipTour}
                  className={`${isMobile ? "h-9 text-xs px-3" : "h-10 px-4"} text-gray-500 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60`}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
              )}
              {currentStepData.showNext && (
                <Button
                  size={isMobile ? "sm" : "default"}
                  onClick={nextStep}
                  className={`${isMobile ? "h-9 text-xs px-4" : "h-10 px-5"} bg-primary hover:bg-primary/90 text-white font-medium shadow-md`}
                >
                  {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                  {currentStep !== totalSteps - 1 && (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 pt-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : index < currentStep 
                      ? 'bg-primary/60' 
                      : 'bg-gray-300/60 dark:bg-gray-600/60'
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
