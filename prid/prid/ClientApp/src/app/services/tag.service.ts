import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tag } from '../models/tag';
import { map, flatMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class TagService {
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }
    getAll() {
        return this.http.get<Tag[]>(`${this.baseUrl}api/tags`).pipe(
            map(res => res.map(m => new Tag(m)))
        );
    }
    getById(id: number) {
        return this.http.get<Tag>(`${this.baseUrl}api/tags/id/${id}`).pipe(
            map(m => !m ? null : new Tag(m)),
            catchError(err => of(null))
        );
    }
    getByName(name: string) {
      return this.http.get<Tag>(`${this.baseUrl}api/tags/${name}`).pipe(
        map(m => !m ? null : new Tag(m)),
        catchError(err => of(null))
      );
    }
    getByPostId(postId: number) {
        return this.http.get<Tag[]>(`${this.baseUrl}api/tags/postId/${postId}`).pipe(
            map(res => res.map(m => new Tag(m))),
            catchError(err => of(null))
          );
    }
    public update(t: Tag): Observable<boolean> {
        return this.http.put<Tag>(`${this.baseUrl}api/tags/${t.id}`, t).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }
    public delete(t: Tag): Observable<boolean> {
        return this.http.delete<boolean>(`${this.baseUrl}api/tags/${t.id}`).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }
    public add(t: Tag): Observable<boolean> {
        return this.http.post<Tag>(`${this.baseUrl}api/tags`, t).pipe(
            map(res => true),
            catchError(err => {
                console.error(err);
                return of(false);
            })
        );
    }
}