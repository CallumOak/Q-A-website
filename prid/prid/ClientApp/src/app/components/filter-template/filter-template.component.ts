import { Component, ViewChild, Input, OnChanges, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/models/post';
import { MatTableDataSource, MatSort, MatMenuTrigger } from '@angular/material';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { StateService } from 'src/app/services/state.service';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-filter-template',
    templateUrl: './filter-template.component.html',
    styleUrls: ['./filter-template.component.css']
})
export class FilterTemplateComponent implements OnChanges, AfterViewInit {
    dataSource: MatTableDataSource<Post> = new MatTableDataSource();
    filter: string;
    state: MatTableState;
    frm: FormGroup;

    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild('filterMenu', { static: false }) filterMenu: MatMenuTrigger;
    @Input() openFilter: boolean;

    constructor(
        private stateService: StateService,
        private postService: PostService,
        private route: ActivatedRoute,
        private router: Router
    ) {
    }
    ngAfterViewInit(): void {
        this.filterMenu.openMenu();
    }


    ngOnChanges(){

        if(this.openFilter) {
            this.filterMenu.openMenu();
        }
    }
}
