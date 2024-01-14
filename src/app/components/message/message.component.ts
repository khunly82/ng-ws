import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MessageModel } from '../../models/message.model';
import { SplitLinesPipe } from '../../pipes/split-lines.pipe';

@Component({
  selector: 'li[appMessage]',
  standalone: true,
  imports: [CommonModule, SplitLinesPipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input()
  message!: MessageModel;
}
