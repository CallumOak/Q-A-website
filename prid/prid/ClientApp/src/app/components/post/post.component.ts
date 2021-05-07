import { Component, OnInit, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from 'src/app/models/post';
import { MatTableDataSource, MatPaginator, MatSort, MatButtonToggleGroup } from '@angular/material';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { StateService } from 'src/app/services/state.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { Role, User } from 'src/app/models/user';
import { Vote } from 'src/app/models/vote';
import { isUndefined } from 'util';
import { UserService } from 'src/app/services/user.service';
import { PassThrough } from 'stream';
import { PostService } from 'src/app/services/post.service';
import { VoteService } from 'src/app/services/vote.service';
import { CommentService } from 'src/app/services/comment.service';
import { RefreshService } from 'src/app/services/refresh.service';
import { CommentsComponent } from '../comments/comments.component';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css']
})
export class PostComponent implements AfterViewInit, OnChanges {
    @ViewChild('editorGroup', {static: false}) editorGroup:MatButtonToggleGroup;
    @ViewChild('comments', {static: false}) comments:CommentsComponent;
    @Input() post: Post;
    @Input() question: Post;
    frm: FormGroup;
    ctlBody: FormControl;
    isFrmVisible: boolean;
    userVote: Vote;
    canUpvote: boolean;
    canDownvote: boolean;

    constructor(
        private userService: UserService,
        private authService: AuthenticationService,
        private postService: PostService,
        private commentService: CommentService,
        private refreshService: RefreshService,
        private voteService: VoteService,
        private fb: FormBuilder
    ) {
        this.ctlBody = this.fb.control('', [Validators.required]);
        this.frm = this.fb.group({
            body: this.ctlBody
        });
        this.isFrmVisible = false;
        this.canDownvote = false;
        this.canUpvote = false;
    }

    getUserVote(): void {
        const currentUser = this.authService.currentUser;
        if (currentUser)
        {
            let upvoteReputation = currentUser.reputation >= 15;
            let downvoteReputation = currentUser.reputation >= 30;
            if (currentUser.id == this.post.authorId)
            {
                this.canDownvote = false;
                this.canUpvote = false;
            }
            else
                this.voteService.getById(this.post.id, currentUser.id).subscribe(data => {
                    this.userVote = data;
                    if (this.userVote == null) {
                        this.canDownvote = downvoteReputation;
                        this.canUpvote = upvoteReputation;
                    }
                    else {
                        this.canDownvote = (this.userVote.upDown == 1) ? true : false;
                        this.canUpvote = (this.userVote.upDown == -1) ? true : false;
                    }
                });
        }
    }

    ngAfterViewInit(): void {
        this.userService.getById(this.post.authorId).subscribe(user => {
            this.post.author = user;
        });
        this.getUserVote();
    }

    refresh() {
        this.refreshService.refreshQuestionComponent();
        if (this.comments != null)
        {
            this.comments.refresh();
        }
        this.userService.getById(this.post.authorId).subscribe(user => {
            this.post.author = user;
        });
        this.getUserVote();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.comments != null)
        {
            this.comments.refresh();
        }
    }

    refreshCurrentUserReputation() {
        this.userService.getById(this.authService.currentUser.id).subscribe(user => {
            this.authService.currentUser.reputation = Number(user.reputation);
            sessionStorage.setItem('currentUser', JSON.stringify(this.authService.currentUser));
        })
    }

    delete() {
        this.postService.delete(this.post).subscribe(res => {
            this.refresh();
        });
    }

    canDelete(): boolean {
        const currentUser = this.authService.currentUser;
        if (!currentUser)
            return false;
        const isAdmin = currentUser.role == Role.Admin;
        if (isAdmin)
            return true;
        const isAuthor = currentUser.id == this.post.authorId;
        const isAlone = this.post.commentsCount == 0 && this.post.childsCount == 0;
        return isAuthor && isAlone;
    }

    canEdit(): boolean {
        const currentUser = this.authService.currentUser;
        if (!currentUser)
            return false;
        const isAdmin = currentUser.role == Role.Admin;
        const isAuthor = currentUser.id == this.post.authorId;
        return isAdmin || isAuthor;
    }

    vote(upDown: number) {
        const currentUser = this.authService.currentUser;
        if (!currentUser)
            return;
        if (this.userVote == null) {
            this.voteService.post(this.post.id, currentUser.id, upDown).subscribe(data => {
                this.refreshCurrentUserReputation();
                this.refresh();
            });
        }
        else if (this.userVote.upDown != upDown) {
            this.voteService.delete(this.post.id, currentUser.id).subscribe(data => {
                this.refresh();
            });
        }
    }

    upvote() {
        this.vote(1);
    }

    downvote() {
        this.vote(-1);
    }

    isNotEmpty(): boolean {
        return this.post.commentIds.length > 0;
    }

    toggleChange(event) {
        if (event && event.source) {
            let toggle = event.source;
            let group = toggle.buttonToggleGroup;
            if (event.value.some(item => item == toggle.value)) {
                group.value = [toggle.value];
                this.isFrmVisible = true;
                if (toggle.value == "edit") {
                    this.ctlBody.setValue(this.post.body);
                } else {
                    this.ctlBody.setValue("");
                }
            }
        }
        else {
            this.isFrmVisible = false;
            this.ctlBody.setValue("");
        }
    }

    reset_form() {
        this.editorGroup.value = [];
        this.toggleChange(null);
    }

    editor_submit() {
        let value: Array<string> = this.editorGroup.value;
        const currentUser = this.authService.currentUser;
        if (!currentUser)
            return ;
        if (value.includes("edit"))
        {
            this.post.body = this.ctlBody.value;
            this.postService.update(this.post).subscribe(
               data => {
                    this.reset_form();
                    this.refresh();
               }
            )
        }
        else if (value.includes("comment"))
        {
            this.commentService.post(this.ctlBody.value, currentUser.id, this.post.id).subscribe(
                data => {
                    this.reset_form();
                    this.refresh();
                }
            )
        }
    }

    isOwner(): boolean {
        const currentUser = this.authService.currentUser;
        if (!currentUser)
            return false;
        const isAdmin = currentUser.role == Role.Admin;
        const isOwner = currentUser.id == this.question.authorId;
        return isAdmin || isOwner;
    }

    canSelectAnswer(): boolean {
        if (this.post != this.question && this.question.acceptedAnswerId == null)
            return this.isOwner();
        return false;
    }

    canUnselectAnswer(): boolean {
        if (this.question.acceptedAnswerId == this.post.id)
            return this.isOwner();
        return false;
    }

    selectAnswer() {
        this.question.acceptedAnswerId = this.post.id;
        this.postService.update(this.question).subscribe(
            data => {
                this.refreshCurrentUserReputation();
                this.refresh();
            }
        )
    }

    unselectAnswer() {
        this.question.acceptedAnswerId = null;
        this.postService.update(this.question).subscribe(
            data => {
                this.refresh();
            }
        )
    }
}
