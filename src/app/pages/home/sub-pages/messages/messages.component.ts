import { Component, ElementRef, OnInit, ViewChild, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageModel } from '../../../../models/message.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { SocketState, loadConversation, selectConversation, selectUser } from '../../../../store/socket.state';
import { ActivatedRoute } from '@angular/router';
import { iif, map, of, switchMap, tap } from 'rxjs';
import { ConversationService } from '../../../../services/conversation.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../../components/loader/loader.component';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SocketService } from '../../../../services/socket.service';
import { MessageComponent } from '../../../../components/message/message.component';
import { UserModel } from '../../../../models/user.model';
@Component({
  standalone: true,
  imports: [CommonModule, LoaderComponent, FormsModule, ReactiveFormsModule, ButtonModule, InputTextareaModule, MessageComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {

  fg!: FormGroup;
  loading: boolean = false;
  otherId!: string;
  other!: UserModel|undefined;
  messages: MessageModel[] = [];

  @ViewChild('chat')
  list!: ElementRef;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _fb: FormBuilder,
    private readonly _store: Store<{socket: SocketState}>,
    private readonly _conversationService: ConversationService,
    private readonly _socketService: SocketService,
  ) {
    // création d'un signal sur l'id de la route
    const routeIdSignal = toSignal(this._route.params.pipe(map(({id}) => id)));
    // à chaque fois que l'id de la route change
    effect(() => {
      this.otherId = routeIdSignal();
      // on réinitialise les données locales
      this.fg.reset(); 
      this.loading = true;

      // on cherche dans le store les détails de l'utilisateur correspondant à l'id de la route
      this._store.select(selectUser(this.otherId))
        .subscribe(other => this.other = other);

      // on cherche la conversation avec le correspondant dans le store
      this._store.select(selectConversation(this.otherId)).pipe(
        switchMap((messages) => 
          // si on a pas encore chargé la conversation
          iif(() => !messages,
            // on charge la conversation sur l'api
            this._conversationService.getByOtherId(this.otherId).pipe(
              // on met à jour le store
              tap(messages => this._store.dispatch(loadConversation({ user: this.otherId, messages }))
            )),
            of(messages)
          )
        ),
      ).subscribe((messages) => {
        this.loading = false;
        this.messages = messages;
        setTimeout(() => {
          // on scroll vers le bas à chaque nouveau message
          this.list.nativeElement.scrollTop = this.list.nativeElement.scrollHeight;
        }, 10);
      })
    });

  } 

  ngOnInit(): void {
    this.fg = this._fb.group({ message: [] });

    this.fg.valueChanges.subscribe(({message}) => {
      this._socketService.notifyIsTyping(this.otherId, !!message?.length);
    });
  }

  send() {
    if(!this.fg.value.message) {
      return;
    }
    this._socketService.sendMessage(this.otherId, this.fg.value.message);
    this.fg.reset();
  }
}
