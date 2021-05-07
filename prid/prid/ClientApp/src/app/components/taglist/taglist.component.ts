import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, PageEvent, MatSortHeader } from '@angular/material';
import * as _ from 'lodash';
import { Tag } from '../../models/tag';
import { TagService } from '../../services/tag.service';
import { EditTagComponent } from '../edit-tag/edit-tag.component';
import { AuthenticationService } from '../../services/authentication.service';
import { StateService } from 'src/app/services/state.service';
import { MatTableState } from 'src/app/helpers/mattable.state';
import {Role} from '../../models/user';
import { Router } from '@angular/router';
@Component({
    selector: 'app-taglist',
    templateUrl: './taglist.component.html',
    styleUrls: ['./taglist.component.css']
})
export class TagListComponent implements AfterViewInit, OnDestroy{
    displayedColumns: string[];
    dataSource: MatTableDataSource<Tag> = new MatTableDataSource();
    state: MatTableState;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    constructor(
        private tagService: TagService,
        private stateService: StateService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
		private authenticationService: AuthenticationService,
        private router: Router
    ) {
        this.state = this.stateService.tagListState;
        this.displayedColumns = ['name', 'posts'];
        if(this.currentUser && this.isAdmin){
            this.displayedColumns = ['name', 'posts', 'actions'];
        }
    }
    ngAfterViewInit(): void {
        // lie le datasource au sorter et au paginator
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // établit les liens entre le data source et l'état de telle sorte que chaque fois que 
        // le tri ou la pagination est modifié l'état soit automatiquement mis à jour
        this.state.bind(this.dataSource);
        // récupère les données 
        this.refresh();
    }
    refresh() {
        this.tagService.getAll().subscribe(tags => {
            // assigne les données récupérées au datasource
            this.dataSource.data = tags;
            // restaure l'état du datasource (tri et pagination) à partir du state
            this.state.restoreState(this.dataSource);
        });
    }
    // appelée quand on clique sur le bouton "edit"
    edit(tag: Tag) {
        const dlg = this.dialog.open(EditTagComponent, { data: { tag: tag, isNew: false } });
        dlg.beforeClose().subscribe(res => {
            if (res) {
                _.assign(tag, res);
                this.tagService.update(res).subscribe(res => {
                    if (!res) {
                        this.snackBar.open(`There was an error at the server. The update has not been done! Please try again.`, 'Dismiss', { duration: 10000 });
                        this.refresh();
                    }
                });
            }
        });
    }
    // appelée quand on clique sur le bouton "delete"
    delete(tag: Tag) {
        const backup = this.dataSource.data;
        this.dataSource.data = _.filter(this.dataSource.data, m => m.id !== tag.id);
        const snackBarRef = this.snackBar.open(`Tag '${tag.name}' will be deleted`, 'Undo', { duration: 10000 });
        snackBarRef.afterDismissed().subscribe(res => {
            if (!res.dismissedByAction)
                this.tagService.delete(tag).subscribe();
            else
                this.dataSource.data = backup;
        });
    }
    // appelée quand on clique sur le bouton "new tag"
    create() {
        const tag = new Tag({});
        const dlg = this.dialog.open(EditTagComponent, { data: { tag: tag, isNew: true } });
        dlg.beforeClose().subscribe(res => {
            if (res) {
                this.dataSource.data = [...this.dataSource.data, new Tag(res)];
                this.tagService.add(res).subscribe(res => {
                    if (!res) {
                        this.snackBar.open(`There was an error at the server. The tag has not been created! Please try again.`, 'Dismiss', { duration: 10000 });
                        this.refresh();
                    }
                });
            }
        });
    }
    ngOnDestroy(): void {
        this.snackBar.dismiss();
    }
	get currentUser() {
		return this.authenticationService.currentUser;
	}
	get isAdmin() {
		return this.currentUser && this.currentUser.role === Role.Admin;
    }
    
    redirectToQuestions(tagId: number){
        if(tagId != null){
		    this.router.navigate(['/questions/' + tagId]);
        }
    }
}