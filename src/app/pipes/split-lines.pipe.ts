import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitLines',
  standalone: true
})
export class SplitLinesPipe implements PipeTransform {

  transform(value: string): string[]|null {
    return value?.split('\n')
  }

}
