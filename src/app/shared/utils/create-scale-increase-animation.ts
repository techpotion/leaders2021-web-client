import {
  AnimationTriggerMetadata,
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

export function createScaleIncreaseAnimation(
): AnimationTriggerMetadata {
  const edgeStyle = style({ transform: 'scale(.8)', opacity: 0 });

  return trigger('scaleIncrease', [
    transition(':enter', [
      edgeStyle,
      animate('.3s ease-in-out', style({ transform: 'none', opacity: 1 })),
    ]),
    transition(':leave', [
      style({ overflow: 'hidden' }),
      animate('.3s ease-in-out', edgeStyle),
    ]),
  ]);
}
