import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, flatMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Post } from '../models/post';
import { Comment } from '../models/comment';

@Injectable({ providedIn: 'root' })
export class CommentService {
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    post(body: string, authorId: number, postId: number) {
        return this.http.post<boolean>(`${this.baseUrl}api/comments`, { body, authorId, postId }).pipe(
            catchError(err => of(false))
        );
    }

    getCommentById(id: number) {
        return null;
    }

    delete(comment: Comment) {
        return this.http.delete<boolean>(`${this.baseUrl}api/comments/${comment.id}`).pipe(
            catchError(err => of(false))
        );
    }

    update(c: Comment): Observable<boolean> {
        return this.http.put<Comment>(`${this.baseUrl}api/comments/${c.id}`, c).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }
}
