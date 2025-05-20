"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

// Define a more specific type for the ref if you know it will always be a certain HTML element
// For generic use, HTMLElement is fine.
// type ElementRefType = React.RefObject<HTMLElement>; // Removed unused type

export const useScrollAnimation = (options?: ScrollAnimationOptions) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null); // Initialize with null, will be set to the DOM element

  // Memoize options to prevent re-running effect unnecessarily if options object is recreated on each render
  const memoizedOptions = useRef(options);
  useEffect(() => {
    memoizedOptions.current = options;
  }, [options]);


  const intersectionCallback = useCallback((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const [entry] = entries;
    const currentOpts = memoizedOptions.current || {}; // Use latest options
    const triggerOnce = currentOpts.triggerOnce !== undefined ? currentOpts.triggerOnce : true;


    if (entry.isIntersecting) {
      setIsVisible(true);
      if (triggerOnce && elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    } else {
      // Optional: If you want the animation to reverse when scrolling out of view
      // and triggerOnce is false, you could set isVisible to false here.
      // if (!triggerOnce) {
      //   setIsVisible(false);
      // }
    }
  }, []); // No dependencies needed here as it uses refs and latest options

  useEffect(() => {
    const currentElement = elementRef.current;
    const currentOpts = memoizedOptions.current || {};
    const threshold = currentOpts.threshold !== undefined ? currentOpts.threshold : 0.01;
    const rootMargin = currentOpts.rootMargin !== undefined ? currentOpts.rootMargin : '0px 0px -80px 0px';

    const observer = new IntersectionObserver(intersectionCallback, {
      threshold,
      rootMargin,
    });

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [intersectionCallback]); // Rerun effect if callback changes (though it shouldn't with useCallback)

  // The ref returned here is a callback ref to assign the DOM element to elementRef.current
  const setRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      elementRef.current = node;
      // Re-run observer setup if the node changes (though typically it won't after initial mount)
      // This is implicitly handled by the useEffect's dependency on elementRef.current via its usage
    }
  }, []);


  return [setRef, isVisible] as const;
}; 