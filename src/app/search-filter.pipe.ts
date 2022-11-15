import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {

  transform(list: any[], text: string): any {
    const search = text.toLowerCase();
    return list.filter((item: any) => {
      return item.value.name.toLowerCase().includes(search);
    });
  }
}
