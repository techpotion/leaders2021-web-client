import {
  AnimationTriggerMetadata,
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

export function createOpacityIncreaseAnimation(
): AnimationTriggerMetadata {
  return trigger('opacityIncrease', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('.3s ease-in-out', style({ opacity: 1 })),
    ]),
    transition(':leave', [
      style({ opacity: 1 }),
      animate('.3s ease-in-out', style({ opacity: 0 })),
    ]),
  ]);
}
