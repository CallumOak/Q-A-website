import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from 'src/app/models/post';
import { Comment } from 'src/app/models/comment';
import { MatTableDataSource, MatPaginator, MatSort, MatButtonToggleGroup } from '@angular/material';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { StateService } from 'src/app/services/state.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { Role, User } from 'src/app/models/user';
import { isUndefined } from 'util';
import { UserService } from 'src/app/services/user.service';
import { CommentService } from 'src/app/services/comment.service';
import { RefreshService } from 'src/app/services/refresh.service';
import { CommentsComponent } from '../comments/comments.component';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html'
})
export class CommentComponent implements AfterViewInit {
    @ViewChild('editorGroup', {static: false}) editorGroup:MatButtonToggleGroup;
    @Input() comment: Comment;
    @Input() commentsComponent: CommentsComponent;
    author: User;
    frm: FormGroup;
    ctlBody: FormControl;
    isFrmVisible: boolean;

    constructor(
        private userService: UserService,
        private authService: AuthenticationService,
        private commentService: CommentService,
        private refreshService: RefreshService,
        private fb: FormBuilder
    ) {
        this.ctlBody = this.fb.control('', [Validators.required]);
        this.frm = this.fb.group({
            body: this.ctlBody
        });
        this.isFrmVisible = false;
    }

    refresh() {
        this.refreshService.refreshQuestionComponent();
        this.commentsComponent.refresh();
    }

    ngAfterViewInit(): void {
        this.userService.getById(this.comment.authorId).subscribe(user => {
            this.author = user;
        });
    }

    delete() {
        this.commentService.delete(this.comment).subscribe(res => {
            this.refresh();
        });
    }

    canDelete(): boolean {
        const currentUser = this.authService.currentUser;
        if (!currentUser)
            return false;
        const isAdmin = currentUser.role == Role.Admin;
        const isAuthor = currentUser.id == this.comment.authorId;
        return isAdmin || isAuthor;
    }

    canEdit(): boolean {
        const currentUser = this.authService.currentUser;
        if (!currentUser)
            return false;
        const isAdmin = currentUser.role == Role.Admin;
        const isAuthor = currentUser.id == this.comment.authorId;
        return isAdmin || isAuthor;
    }

    toggleChange(event) {
        if (event && event.source) {
            let toggle = event.source;
            let group = toggle.buttonToggleGroup;
            if (event.value.some(item => item == toggle.value)) {
                group.value = [toggle.value];
                this.isFrmVisible = true;
                if (toggle.value == "edit") {
                    this.ctlBody.setValue(this.comment.body);
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

    editor_submit(formDirective: FormGroupDirective) {
        let value: Array<string> = this.editorGroup.value;
        if (value.includes("edit"))
        {
            this.comment.body = this.ctlBody.value;
            this.commentService.update(this.comment).subscribe(
               data => {
                   this.reset_form();
                   this.refresh();
               }
            );
        }
    }
}
