import { useEffect, useRef } from 'react';
import { idleGesture, stepGesture, type Gesture, type PointerSample } from './gesture';

export type PointerIntentHandlers = {
  onLook(dx: number, dy: number): void;
  onClick(clientX: number, clientY: number): void;
};

export function usePointerIntent(element: HTMLElement, handlers: PointerIntentHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let gesture: Gesture = idleGesture;
    const feed = (type: PointerSample['type']) => (event: PointerEvent) => {
      if (type === 'down') {
        if (event.button !== 0) return;
        element.setPointerCapture(event.pointerId);
      }
      const step = stepGesture(gesture, { type, pointerId: event.pointerId, x: event.clientX, y: event.clientY });
      gesture = step.gesture;
      if (step.effect?.type === 'look') handlersRef.current.onLook(step.effect.dx, step.effect.dy);
      if (step.effect?.type === 'click') handlersRef.current.onClick(step.effect.x, step.effect.y);
    };
    const listeners = [
      ['pointerdown', feed('down')],
      ['pointermove', feed('move')],
      ['pointerup', feed('up')],
      ['pointercancel', feed('cancel')],
    ] as const;
    for (const [name, listener] of listeners) element.addEventListener(name, listener);
    return () => {
      for (const [name, listener] of listeners) element.removeEventListener(name, listener);
    };
  }, [element]);
}
