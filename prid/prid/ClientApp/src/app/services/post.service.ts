import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, flatMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { Tag } from '../models/tag';

@Injectable({ providedIn: 'root' })
export class PostService {
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    getAllQuestions(){
        return this.http.get<Post[]>(`${this.baseUrl}api/posts/`).pipe(
            map(res => res.map(m => new Post(m))),
            catchError(err => of(null))
        );
    }

    getAllByTag(tagId: number){
        return this.http.get<Post[]>(`${this.baseUrl}api/posts/byTag/${tagId}`).pipe(
            map(res => res.map(m => new Post(m))),
            catchError(err => of(null))
        )
    }

    getByPseudo(pseudo: string) {
        return this.http.get<Post[]>(`${this.baseUrl}api/posts/${pseudo}`).pipe(
            map(res => res.map(m => new Post(m))),
            catchError(err => of(null))
        );
    }

    post(title: string, body: string, tagids: any, authorId: number, parentId: number, AcceptedAnswerId: number) {
        return this.http.post<boolean>(`${this.baseUrl}api/posts`, { title, body, tagids, authorId, parentId, AcceptedAnswerId }).pipe(
            catchError(err => of(false))
        );
    }

    update(p: Post): Observable<boolean> {
        return this.http.put<Post>(`${this.baseUrl}api/posts/${p.id}`, p).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }

    delete(post: Post) {
        return this.http.delete<boolean>(`${this.baseUrl}api/posts/${post.id}`).pipe(
            catchError(err => of(false))
        );
    }

//questions

    getQuestionById(id: number) {
        return this.http.get<Post>(`${this.baseUrl}api/posts/question/${id}`).pipe(
            map(res => !res ? null : new Post(res)),
            catchError(err => of(null))
        );
    }

    getCommonAnswersByQuestionId(id: number) {
        return this.http.get<Post[]>(`${this.baseUrl}api/posts/common_answers/${id}`).pipe(
            map(res => res.map(p => new Post(p))),
            catchError(err => of(null))
        );
    }

    getCommentsByPostId(id: number) {
        return this.http.get<Comment[]>(`${this.baseUrl}api/comments/${id}`).pipe(
            map(res => res.map(c => new Comment(c))),
            catchError(err => of(null))
        );
    }

    // horrible mais fonctions sympas pour des requetes complexes -> filter, includes, ...
    // getPostsByIds(ids: number[]) {
    //     return this.http.get<Post[]>(`${this.baseUrl}api/posts`).pipe(
    //         map(res => res.filter(p => ids.includes(p.id)).map(p => new Post(p))),
    //         catchError(err => of(null))
    //     );
    // }

    getPostById(id: number) {
        return this.http.get<Post>(`${this.baseUrl}api/posts/post/${id}`).pipe(
            map(res => !res ? null : new Post(res)),
            catchError(err => of(null))
        );
    }
}
