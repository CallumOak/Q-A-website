import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, flatMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { QuestionComponent } from '../components/question/question.component';
import { CommentsComponent } from '../components/comments/comments.component';
import { NavMenuComponent } from '../components/nav-menu/nav-menu.component';

@Injectable({ providedIn: 'root' })
export class RefreshService {
    questionComponent: QuestionComponent;
    constructor() {}

    refreshQuestionComponent() {
        this.questionComponent.refresh();
    }
}
