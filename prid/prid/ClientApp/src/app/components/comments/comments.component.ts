import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from 'src/app/models/post';
import { Comment } from 'src/app/models/comment';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { StateService } from 'src/app/services/state.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { Role } from 'src/app/models/user';
import { isUndefined, isNullOrUndefined } from 'util';
import { PostComponent } from '../post/post.component';
import { PostService } from 'src/app/services/post.service';

@Component({
    selector: 'app-comments',
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements AfterViewInit {
    @Input() post: Post;
    displayedColumns: string[] = ['content'];
    dataSource: MatTableDataSource<Comment> = new MatTableDataSource();
    filter: string;
    state: MatTableState;
    frm: FormGroup;
    ctlBody: FormControl;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private authService: AuthenticationService,
        private stateService: StateService,
        private postService: PostService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.state = this.stateService.commentsListState;
        this.state.filter = "";
        this.ctlBody = this.fb.control('', [Validators.required]);
        this.frm = this.fb.group({
            body: this.ctlBody
        });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: Comment, filter: string) => {
            const str = data.timestamp + ' ' + data.body + ' ' + data.authorId;//a changer
            return str.toLowerCase().includes(filter);
        };

        this.state.bind(this.dataSource);

        this.refresh();
    }

    refresh() {
        this.postService.getCommentsByPostId(this.post.id).subscribe(comments => {
            this.dataSource.data = comments;
            this.state.restoreState(this.dataSource);
            this.filter = this.state.filter;
            this.post.commentsCount = comments.length;
        });
    }

    filterChanged(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();

        this.state.filter = this.dataSource.filter;

        if (this.dataSource.paginator)
            this.dataSource.paginator.firstPage();
    }
}