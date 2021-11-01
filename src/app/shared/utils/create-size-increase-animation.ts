import {
  AnimationTriggerMetadata,
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

export function createSizeIncreaseAnimation(
  property: 'height' | 'width',
  maxProperty?: number,
): AnimationTriggerMetadata {
  const value = maxProperty ?? '*';

  return trigger('sizeIncrease', [
    transition(':enter', [
      style({ [property]: 0, overflow: 'hidden' }),
      animate('.3s ease-in-out', style({ [property]: value })),
    ]),
    transition(':leave', [
      style({ overflow: 'hidden' }),
      animate('.3s ease-in-out', style({ [property]: 0 })),
    ]),
  ]);
}
