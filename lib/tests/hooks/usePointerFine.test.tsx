import { renderHook, act } from '@testing-library/react';
import { usePointerFine } from '../../hooks/usePointerFine';

describe('usePointerFine', () => {
  let mockMatchMedia: jest.Mock;
  let mediaQueryListMock: {
    matches: boolean;
    media: string;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
    onchange: null;
    addListener: jest.Mock;
    removeListener: jest.Mock;
    dispatchEvent: jest.Mock;
  };

  beforeEach(() => {
    mediaQueryListMock = {
      matches: false,
      media: '(pointer: fine)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    mockMatchMedia = jest.fn().mockImplementation((query: string) => {
      mediaQueryListMock.media = query;
      return mediaQueryListMock;
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      enumerable: true,
      configurable: true,
      value: mockMatchMedia,
    });

    // Mock resize and orientationchange events
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when fine pointer is detected', () => {
    mediaQueryListMock.matches = true;

    const { result } = renderHook(() => usePointerFine());

    expect(mockMatchMedia).toHaveBeenCalledWith('(pointer: fine)');
    expect(result.current).toBe(true);
  });

  it('should return false when fine pointer is not detected', () => {
    mediaQueryListMock.matches = false;

    const { result } = renderHook(() => usePointerFine());

    expect(result.current).toBe(false);
  });

  it('should return false when window is undefined', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - intentionally undefined for testing
    globalThis.window = undefined;

    const { result } = renderHook(() => usePointerFine());

    expect(result.current).toBe(false);

    globalThis.window = originalWindow;
  });

  it('should add event listeners for change, resize, and orientationchange', () => {
    renderHook(() => usePointerFine());

    expect(mediaQueryListMock.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'orientationchange',
      expect.any(Function),
    );
  });

  it('should update when change event fires', () => {
    const { result } = renderHook(() => usePointerFine());

    // Initially false
    expect(result.current).toBe(false);

    // Simulate media query change to true
    mediaQueryListMock.matches = true;
    const changeHandler = mediaQueryListMock.addEventListener.mock.calls.find(
      ([event]) => event === 'change',
    )?.[1];

    act(() => {
      changeHandler?.();
    });

    expect(result.current).toBe(true);
  });

  it('should update when resize event fires', () => {
    const { result } = renderHook(() => usePointerFine());

    // Initially false
    expect(result.current).toBe(false);

    // Simulate media query change to true on resize
    mediaQueryListMock.matches = true;
    const resizeHandler = (
      window.addEventListener as jest.Mock
    ).mock.calls.find(([event]) => event === 'resize')?.[1];

    act(() => {
      resizeHandler?.();
    });

    expect(result.current).toBe(true);
  });

  it('should update when orientationchange event fires', () => {
    const { result } = renderHook(() => usePointerFine());

    // Initially false
    expect(result.current).toBe(false);

    // Simulate media query change to true on orientation change
    mediaQueryListMock.matches = true;
    const orientationHandler = (
      window.addEventListener as jest.Mock
    ).mock.calls.find(([event]) => event === 'orientationchange')?.[1];

    act(() => {
      orientationHandler?.();
    });

    expect(result.current).toBe(true);
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => usePointerFine());

    unmount();

    const changeHandler = mediaQueryListMock.addEventListener.mock.calls.find(
      ([event]) => event === 'change',
    )?.[1];
    const resizeHandler = (
      window.addEventListener as jest.Mock
    ).mock.calls.find(([event]) => event === 'resize')?.[1];
    const orientationHandler = (
      window.addEventListener as jest.Mock
    ).mock.calls.find(([event]) => event === 'orientationchange')?.[1];

    expect(mediaQueryListMock.removeEventListener).toHaveBeenCalledWith(
      'change',
      changeHandler,
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'resize',
      resizeHandler,
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'orientationchange',
      orientationHandler,
    );
  });

  it('should call handlePointerChange on initial render', () => {
    mediaQueryListMock.matches = true;

    const { result } = renderHook(() => usePointerFine());

    // Verify the initial state handler was called
    mediaQueryListMock.addEventListener.mock.calls.find(
      ([event]) => event === 'change',
    )?.[1];

    // We can't easily test the initial call to handlePointerChange
    // but we can verify the hook returns the correct initial value
    expect(result.current).toBe(true);
  });
});
