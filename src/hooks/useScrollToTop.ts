import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to scroll to top when route changes
 * Automatically scrolls to the top of the page whenever the user navigates to a new page
 * Works on both desktop and mobile by scrolling the document body and html elements
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll both window and document body for better mobile compatibility
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Also scroll the document element (for some mobile browsers)
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Use setTimeout as fallback for mobile browsers that need a delay
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 0);
  }, [pathname]);
};
