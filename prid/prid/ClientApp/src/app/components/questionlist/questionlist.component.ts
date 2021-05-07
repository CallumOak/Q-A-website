import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/models/post';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { MatTableState } from 'src/app/helpers/mattable.state';
import { StateService } from 'src/app/services/state.service';
import { FormGroup} from '@angular/forms';
import { Tag } from 'src/app/models/tag';
import { TagService } from 'src/app/services/tag.service';

@Component({
    selector: 'app-questionlist',
    templateUrl: './questionlist.component.html',
    styleUrls: ['./questionlist.component.css']
})
export class QuestionsListComponent implements AfterViewInit, OnInit {
    displayedColumns: string[] = ['score', 'childrenCount', 'title', 'authorPseudo', 'tagIds', 'timestamp'];
    dataSource: MatTableDataSource<Post> = new MatTableDataSource();
    filter: string = "";
    state: MatTableState;
    frm: FormGroup;
    public selectedTag: number;
    public tags: Tag[];

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    templateFor: string;

    constructor(
        private stateService: StateService,
        private postService: PostService,
        private tagService: TagService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.state = this.stateService.questionListState;
        this.tagService.getAll().subscribe(res => this.tags = res);
    }
    
    onFilterClick(templateFor: string){

        this.templateFor = templateFor;
      }

      ngOnInit(): void {
          var tagId = this.route.snapshot.paramMap.get('id');
          if(tagId != null){
              this.selectedTag = Number(tagId);
              this.tagService.getById(this.selectedTag).subscribe(res => {
                if (res == null)
                    this.router.navigate(["**"]);
              });
          }
          
      }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: Post, filter: string) => {
            const str = data.title + ' ' + data.authorId;
            return str.toLowerCase().includes(filter);
        };

        this.state.bind(this.dataSource);

        this.filterByTag();
    }

    refresh() {
        this.postService.getAllQuestions().subscribe(posts => {
            this.dataSource.data = posts;

            this.state.restoreState(this.dataSource);

            this.filter = this.state.filter;
        });
    }

    filterChanged(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();

        this.state.filter = this.dataSource.filter;

        if (this.dataSource.paginator)
            this.dataSource.paginator.firstPage();
    }

    filterByTag(){
        if(this.selectedTag == null){
            this.refresh();
        }
        else{
            this.postService.getAllByTag(this.selectedTag).subscribe(posts => {
                this.dataSource.data = posts;

                this.state.restoreState(this.dataSource);

                this.filter = this.state.filter;
            });
        }
    }

    redirectToFilteredByTag(tagId: string){
        if(tagId != null){
            this.router.navigate(['/questions/' + tagId]);
            this.filterByTag();
        }
        else{
            this.router.navigate(['/questions']);
            this.filterByTag();
        }
    }

    redirectToQuestion(postId: number){
        if(postId != null){
		    this.router.navigate(['/question/' + postId]);
        }
    }
}
