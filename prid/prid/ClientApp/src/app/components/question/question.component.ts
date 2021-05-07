import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from 'src/app/models/post';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { StateService } from 'src/app/services/state.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { isUndefined } from 'util';
import { PostService } from 'src/app/services/post.service';
import { UserService } from 'src/app/services/user.service';
import { TagService } from 'src/app/services/tag.service';
import { Role, User } from 'src/app/models/user';
import { Tag } from 'src/app/models/tag';
import { RefreshService } from 'src/app/services/refresh.service';
import { PostComponent } from '../post/post.component';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.css']
})
export class QuestionComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['content'];
    dataSource: MatTableDataSource<Post> = new MatTableDataSource();
    questionId: number;
    question: Post;
    acceptedAnswer: Post;
    filter: string;
    state: MatTableState;
    frm: FormGroup;
    ctlBody: FormControl;
    author: User;
    tags: Array<Tag>;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private userService: UserService,
        private authService: AuthenticationService,
        private stateService: StateService,
        private postService: PostService,
        private tagService: TagService,
        private refreshService: RefreshService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.state = this.stateService.answerListState;
        this.state.filter = "";
        this.ctlBody = this.fb.control('', [Validators.required]);
        this.frm = this.fb.group({
            body: this.ctlBody
        });
    }

    ngOnInit(): void {
        this.questionId = Number(this.route.snapshot.paramMap.get('id'));
        if (isNaN(this.questionId))
            this.router.navigate(['']);
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: Post, filter: string) => {
            const str = data.timestamp + ' ' + data.body + ' ' + data.authorId;
            return str.toLowerCase().includes(filter);
        };

        this.state.bind(this.dataSource);

        this.refreshService.questionComponent = this;

        this.refresh();
    }

    refresh() {
        this.postService.getQuestionById(this.questionId).subscribe(post => {
            this.question = post;
            if (!this.question)
                this.router.navigate(["**"]);
            this.userService.getById(this.question.authorId).subscribe(user => {
                this.question.author = user;
                this.author = user;
            });
            this.tagService.getByPostId(this.question.id).subscribe(res => {
                this.tags = res;
            });
            this.postService.getCommonAnswersByQuestionId(this.question.id).subscribe(posts => {
                this.dataSource.data = posts;
                this.state.restoreState(this.dataSource);
                this.filter = this.state.filter;
                this.question.childsCount = posts.length;
            });
            this.postService.getPostById(this.question.acceptedAnswerId).subscribe(post => {
                this.acceptedAnswer = post;
                if (this.acceptedAnswer)
                    this.userService.getById(this.acceptedAnswer.authorId).subscribe(user => {
                        this.acceptedAnswer.author = user;
                    });
            });
        });
    }

    filterChanged(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();

        this.state.filter = this.dataSource.filter;

        if (this.dataSource.paginator)
            this.dataSource.paginator.firstPage();
    }

    post() {
        const currentUser = this.authService.currentUser;
        if (currentUser)
            this.postService.post(
                null, 
                this.ctlBody.value, 
                null, 
                currentUser.id, 
                this.question.id, 
                null
                ).subscribe(res => {
                this.ctlBody.setValue("");
                this.refresh();
            });
    }
}
