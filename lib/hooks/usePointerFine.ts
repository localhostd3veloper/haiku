import { useEffect, useState } from 'react';

/**
 * Hook that detects whether the user's primary input mechanism is a fine-grained pointer device.
 *
 * Fine pointers are devices like mice, styluses, or touchpads that can accurately
 * hover and make precise selections. This is useful for adapting UI behavior based
 * on input capabilities.
 *
 * @returns {boolean} `true` if the device has a fine pointer (e.g., mouse), `false` otherwise
 *
 * @example
 * ```tsx
 * const HasFinePointer = () => {
 *   const isFinePointer = usePointerFine();
 *
 *   return (
 *     <div>
 *       {isFinePointer ? 'Using a mouse!' : 'Touch or coarse pointer detected'}
 *     </div>
 *   );
 * };
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer#fine
 */
export function usePointerFine(): boolean {
  const checkPointerCapability = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: fine)').matches;
  };

  const [hasFinePointer, setHasFinePointer] = useState(checkPointerCapability);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(pointer: fine)');

    const handlePointerChange = (): void => {
      setHasFinePointer(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handlePointerChange);

    // Re-check on resize and orientation changes
    // (some devices switch pointer types on rotation)
    window.addEventListener('resize', handlePointerChange);
    window.addEventListener('orientationchange', handlePointerChange);

    handlePointerChange();

    return () => {
      mediaQuery.removeEventListener('change', handlePointerChange);
      window.removeEventListener('resize', handlePointerChange);
      window.removeEventListener('orientationchange', handlePointerChange);
    };
  }, []);

  return hasFinePointer;
}
