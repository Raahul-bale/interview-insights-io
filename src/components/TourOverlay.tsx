
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
        const padding = window.innerWidth < 768 ? 6 : 10;
        
        setOverlayStyle({
          position: 'fixed',
          top: Math.max(0, rect.top - padding),
          left: Math.max(0, rect.left - padding),
          width: Math.min(window.innerWidth - (rect.left - padding), rect.width + (padding * 2)),
          height: rect.height + (padding * 2),
          borderRadius: window.innerWidth < 768 ? '12px' : '16px',
          boxShadow: '0 0 0 6px rgba(59, 130, 246, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none',
          zIndex: 99997,
          transition: 'all 0.3s ease-in-out',
          border: '2px solid rgba(59, 130, 246, 0.8)'
        });

        // Calculate tooltip position - improved mobile responsive
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        let tooltipWidth = isMobile ? Math.min(window.innerWidth - 24, 340) : 380;
        if (isTablet) tooltipWidth = 350;
        
        const placement = isMobile ? 'bottom' : (currentStepData.placement || 'right');
        const margin = isMobile ? 12 : 20;
        
        let top, left;
        
        if (isMobile) {
          // Mobile: place tooltip below target with safe margins
          top = Math.min(
            rect.bottom + margin, 
            window.innerHeight - 320
          );
          left = (window.innerWidth - tooltipWidth) / 2;
          
          // Ensure tooltip doesn't go off screen
          if (top < rect.bottom + 8) {
            top = rect.top - 280;
          }
        } else {
          // Desktop positioning logic with better bounds checking
          switch (placement) {
            case 'top':
              top = Math.max(20, rect.top - 200 - margin);
              left = Math.max(10, Math.min(
                rect.left + (rect.width / 2) - (tooltipWidth / 2),
                window.innerWidth - tooltipWidth - 10
              ));
              break;
            case 'bottom':
              top = Math.min(rect.bottom + margin, window.innerHeight - 220);
              left = Math.max(10, Math.min(
                rect.left + (rect.width / 2) - (tooltipWidth / 2),
                window.innerWidth - tooltipWidth - 10
              ));
              break;
            case 'left':
              top = Math.max(20, Math.min(
                rect.top + (rect.height / 2) - 100,
                window.innerHeight - 220
              ));
              left = Math.max(10, rect.left - tooltipWidth - margin);
              break;
            case 'right':
            default:
              top = Math.max(20, Math.min(
                rect.top + (rect.height / 2) - 100,
                window.innerHeight - 220
              ));
              left = Math.min(rect.right + margin, window.innerWidth - tooltipWidth - 10);
              break;
          }
        }

        setTooltipStyle({
          position: 'fixed',
          top: Math.max(10, top),
          left: Math.max(10, left),
          width: tooltipWidth,
          maxHeight: isMobile ? '280px' : '240px',
          zIndex: 99998,
          transform: 'scale(1)',
          opacity: 1,
          transition: 'all 0.3s ease-in-out',
          overflow: 'visible'
        });
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(findTarget, 150);
    
    // Re-calculate on window resize and scroll
    const handleResize = () => setTimeout(findTarget, 100);
    const handleScroll = () => setTimeout(findTarget, 50);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isActive, currentStepData]);

  console.log('TourOverlay render check - isActive:', isActive, 'currentStepData:', currentStepData, 'targetElement:', targetElement);
  if (!isActive || !currentStepData || !targetElement) return null;

  const isMobile = window.innerWidth < 768;

  return (
    <>
      {/* Highlight overlay */}
      <div style={overlayStyle} />
      
      {/* Tooltip with enhanced white glass effect */}
      <Card 
        style={tooltipStyle} 
        className="shadow-2xl border-2 border-white/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
      >
        <CardHeader className={isMobile ? "pb-2 px-4 pt-4" : "pb-3 px-6 pt-5"}>
          <div className="flex items-center justify-between">
            <CardTitle className={`${isMobile ? "text-base" : "text-lg"} font-bold text-gray-900 dark:text-white`}>
              {currentStepData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={completeTour}
              className={`${isMobile ? "h-6 w-6" : "h-7 w-7"} hover:bg-gray-100/70 dark:hover:bg-gray-800/70 rounded-full`}
            >
              <X className={`${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} text-gray-600 dark:text-gray-400`} />
            </Button>
          </div>
          <div className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500 dark:text-gray-400 font-medium`}>
            Step {currentStep + 1} of {totalSteps}
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "space-y-4 px-4 pb-4" : "space-y-5 px-6 pb-5"}>
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
                  className={`${isMobile ? "h-9 text-xs px-3" : "h-10 px-4"} bg-white/70 border-gray-300/60 hover:bg-white/90 dark:bg-gray-800/70 dark:border-gray-600/60 dark:hover:bg-gray-700/90 backdrop-blur-sm`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {isMobile ? "Prev" : "Previous"}
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
                  className={`${isMobile ? "h-9 text-xs px-4" : "h-10 px-5"} bg-primary/95 hover:bg-primary text-white font-medium shadow-lg`}
                >
                  {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                  {currentStep !== totalSteps - 1 && (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-primary shadow-sm' 
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
