import {
  AnimationTriggerMetadata,
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

export function createHeightIncreaseAnimation(
  maxHeight?: number,
): AnimationTriggerMetadata {
  const height = maxHeight ?? '*';

  return trigger('heightIncrease', [
    transition(':enter', [
      style({ height: 0, overflow: 'hidden' }),
      animate('.3s', style({ height })),
    ]),
    transition(':leave', [
      style({ overflow: 'hidden' }),
      animate('.3s', style({ height: 0 })),
    ]),
  ]);
}
