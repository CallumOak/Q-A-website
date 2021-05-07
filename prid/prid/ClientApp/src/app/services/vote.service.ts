import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, flatMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { Vote } from '../models/vote';

@Injectable({ providedIn: 'root' })
export class VoteService {
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    getById(postId: number, userId: number) {
        return this.http.get<Vote>(`${this.baseUrl}api/votes/id/${postId}_${userId}`).pipe(
          map(m => !m ? null : new Vote(m)),
          catchError(err => of(null))
        );
      }

    post(postId: number, authorId: number, upDown: number) {
        return this.http.post<boolean>(`${this.baseUrl}api/votes`, { postId, authorId, upDown }).pipe(
            catchError(err => of(false))
        );
    }

    delete(postId: number, userId: number) {
        return this.http.delete<boolean>(`${this.baseUrl}api/votes/id/${postId}_${userId}`).pipe(
            catchError(err => of(false))
        );
    }

    getScore(postId: number) {
        return this.http.get<number>(`${this.baseUrl}api/votes/score/${postId}`).pipe(
            catchError(err => of(null))
        );
    }
}
