export const clickThresholdPx = 5;

export type Gesture =
  | { kind: 'idle' }
  | { kind: 'pressed'; pointerId: number; startX: number; startY: number }
  | { kind: 'dragging'; pointerId: number; lastX: number; lastY: number };

export type PointerSample = { type: 'down' | 'move' | 'up' | 'cancel'; pointerId: number; x: number; y: number };

export type GestureEffect = { type: 'look'; dx: number; dy: number } | { type: 'click'; x: number; y: number };

export const idleGesture: Gesture = { kind: 'idle' };

export function stepGesture(gesture: Gesture, sample: PointerSample): { gesture: Gesture; effect?: GestureEffect } {
  const { type, pointerId, x, y } = sample;
  const press: Gesture = { kind: 'pressed', pointerId, startX: x, startY: y };
  if (gesture.kind === 'idle') return type === 'down' ? { gesture: press } : { gesture };
  if (pointerId !== gesture.pointerId) return type === 'down' ? { gesture: idleGesture } : { gesture };
  if (type === 'down') return { gesture: press };
  if (type === 'cancel') return { gesture: idleGesture };

  if (gesture.kind === 'pressed') {
    const dx = x - gesture.startX;
    const dy = y - gesture.startY;
    const travelled = Math.hypot(dx, dy) >= clickThresholdPx;
    if (type === 'up') return travelled ? { gesture: idleGesture } : { gesture: idleGesture, effect: { type: 'click', x, y } };
    if (type === 'move' && travelled) {
      return { gesture: { kind: 'dragging', pointerId, lastX: x, lastY: y }, effect: { type: 'look', dx, dy } };
    }
    return { gesture };
  }

  if (type === 'up') return { gesture: idleGesture };
  if (type === 'move') {
    return {
      gesture: { kind: 'dragging', pointerId, lastX: x, lastY: y },
      effect: { type: 'look', dx: x - gesture.lastX, dy: y - gesture.lastY },
    };
  }
  return { gesture };
}
