import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hello, [appHello]',
  standalone: true,
  imports: [],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent {
  @Input()
  name: string = 'Khun';
}
