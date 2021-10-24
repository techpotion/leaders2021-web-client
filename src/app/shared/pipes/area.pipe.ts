import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'area',
})
export class AreaPipe implements PipeTransform {

  public transform(value: number | null): string {
    const nonNullValue = value ?? 0;
    // eslint-disable-next-line
    const thousands = Math.floor(nonNullValue / 1000);
    if (thousands) {
      return `${thousands}k`;
    }
    return Math.floor(nonNullValue).toString();
  }

}
