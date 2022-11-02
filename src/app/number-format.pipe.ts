import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {

  transform(value: any, decimals: any): any {
    if (Number.isNaN(value)) {
      return null;
    }
    if (value < 1000) {
      return value + ' B';
    }
    const suffix = [' KB', ' MB', ' GB', ' TB'];
    const exp = Math.floor(Math.log(value) / Math.log(1024));
    return (value / Math.pow(1024, exp)).toFixed(decimals) + suffix[exp - 1];
  }
}
