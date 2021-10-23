import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'area',
})
export class AreaPipe implements PipeTransform {

  public transform(value: number): string {
    // eslint-disable-next-line
    const thousands = Math.floor(value / 1000);
    if (thousands) {
      return `${thousands}k`;
    }
    return Math.floor(value).toString();
  }

}
