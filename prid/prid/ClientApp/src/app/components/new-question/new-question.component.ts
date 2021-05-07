import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/models/post';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { StateService } from 'src/app/services/state.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective, FormArray, ValidatorFn } from '@angular/forms';
import { Role } from 'src/app/models/user';
import { of } from 'rxjs';
import { TagService } from 'src/app/services/tag.service';

@Component({
    selector: 'app-new-question',
    templateUrl: './new-question.component.html',
    styleUrls: ['./new-question.component.css']
})
export class NewQuestionComponent {
    frm: FormGroup;
    ctlBody: FormControl;
    ctlTitle: FormControl;
    tagsList = [];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    constructor(
        private authService: AuthenticationService,
        private postService: PostService,
        private tagService: TagService,
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.ctlBody = this.fb.control('', [Validators.required]);
        this.ctlTitle = this.fb.control('', [Validators.required]);
        this.frm = this.fb.group({
            body: this.ctlBody,
            title: this.ctlTitle,
            tags: new FormArray([], this.minSelectedCheckboxes(1))
        });
        this.getTags();
    }

    getTags() {
        this.tagsList = [];
        this.tagService.getAll().subscribe(
            res => {
                res.forEach((tag) => {
                    this.tagsList.push({id: tag.id, name: tag.name});
                });
                this.addCheckboxes();
            }
        );
    }

    private addCheckboxes() {
        this.tagsList.forEach((o, i) => {
            const control = new FormControl(i === 0); // if first item set to true, else false
            (this.frm.controls.tags as FormArray).push(control);
          });
      }

    post(formDirective: FormGroupDirective) {
        const selectedTagIds = this.frm.value.tags
        .map((v, i) => (v ? this.tagsList[i].id : null))
        .filter(v => v !== null);
        this.postService.post(
            this.ctlTitle.value,
            this.ctlBody.value, 
            selectedTagIds, 
            this.authService.currentUser.id, 
            null, 
            null
            ).subscribe(res => {
            // see: https://stackoverflow.com/a/48217303/2029363
            this.ctlBody.setValue("");
            this.router.navigate(['/question/' + res])
        });
    }

    minSelectedCheckboxes(min = 1) {
        const validator: ValidatorFn = (formArray: FormArray) => {
          const totalSelected = formArray.controls
            // get a list of checkbox values (boolean)
            .map(control => control.value)
            // total up the number of checked checkboxes
            .reduce((prev, next) => next ? prev + next : prev, 0);
      
          // if the total is not greater than the minimum, return the error message
          return totalSelected >= min ? null : { required: true };
        };
      
        return validator;
      }
}
