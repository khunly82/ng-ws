import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageModel } from '../../../../models/message.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { SocketState, loadConversation, selectConversation } from '../../../../store/socket.state';
import { ActivatedRoute } from '@angular/router';
import { iif, of, switchMap, tap } from 'rxjs';
import { ConversationService } from '../../../../services/conversation.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../../../components/loader/loader.component';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SocketService } from '../../../../services/socket.service';
import { MessageComponent } from '../../../../components/message/message.component';
@Component({
  standalone: true,
  imports: [CommonModule, LoaderComponent, FormsModule, ReactiveFormsModule, ButtonModule, InputTextareaModule, MessageComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {

  messages: MessageModel[] = [];
  fg!: FormGroup;
  loading: boolean = false;
  otherId!: string;

  @ViewChild('chat')
  list!: ElementRef;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _fb: FormBuilder,
    private readonly _store: Store<{socket: SocketState}>,
    private readonly _conversationService: ConversationService,
    private readonly _socketService: SocketService,
  ) {} 

  ngOnInit(): void {
    this.fg = this._fb.group({
      message: [null, [Validators.required]]
    });

    this._route.params.pipe(
      tap(({id}) => {
        this.otherId = id;
        this.fg.reset();
        this.loading = true;
      }),
      switchMap(({id}) => this._store.select(selectConversation(id)).pipe(
        switchMap((messages) => 
          iif(() => !!messages, 
            // si le store a déjà chargé la conversation
            of(messages),
            // sinon on charge la conversation depuis le serveur 
            this._conversationService.getByOtherId(id).pipe(
              // on enregistre la conversation dans le store
              tap(messages => this._store.dispatch(loadConversation({ user: id, messages })))
            )
          )
        ),
      )),
      tap(() => this.loading = false)
    ).subscribe(messages => {
      this.messages = messages;
      setTimeout(() => {
        this.list.nativeElement.scrollTop = this.list.nativeElement.scrollHeight;
      }, 100)
    });
  }

  send() {
    if(this.fg.invalid) {
      return;
    }
    this._socketService.sendMessage(this.otherId, this.fg.value.message);
    this.fg.reset();
  }
}