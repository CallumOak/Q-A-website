import { Injectable } from "@angular/core";
import { MatTableState } from "../helpers/mattable.state";
@Injectable({ providedIn: 'root' })
export class StateService {
    public userListState = new MatTableState('pseudo', 'asc', 5);
    public tagListState = new MatTableState('tag', 'asc', 5);
    public postListState = new MatTableState('timestamp', 'desc', 5);
    public answerListState = new MatTableState('timestamp', 'asc', 5);
    public commentsListState = new MatTableState('timestamp', 'asc', 5);
    public questionListState = new MatTableState('title', 'asc' , 5);
}