import { User } from "./user";
import { Tag } from "./tag";

export class Post {
    id: number;
    title: string;
    body: string;
    timestamp: string;
    authorId: number;
    parentId: number;
    acceptedAnswerId: number;
    commentIds: number[];
    childIds: number[];
    voteIds: number[];
    tagIds: number[];
    commentsCount: number;
    tags: Tag[];
    childsCount: number;
    score: number;
    author: User;
    authorPseudo: string;
    constructor(data: any) {
        if (data) {
            this.id = data.id;
            this.title = data.title;
            this.body = data.body;
            this.timestamp = data.timestamp;
            this.authorId = data.authorId;
            this.parentId = data.parentId;
            this.acceptedAnswerId = data.acceptedAnswerId;
            this.commentIds = data.commentIds;
            this.childIds = data.childIds;
            this.voteIds = data.voteIds;
            this.tagIds = data.tagIds;
            this.commentsCount = 0;
            this.tags = data.tags;
            this.childsCount = 0;
            this.score = data.score;
            this.author = new User(data.author);
            this.authorPseudo = this.author.pseudo;
        }
    }

    get votesCount(){
        return this.voteIds.length;
    }
    get childrenCount(){
        return this.childIds.length;
    }

    get tagNames():string[]{
        var retVal = [];
        this.tags.forEach((tag) => {
            retVal.push(tag.name);
        })
        return retVal;
    }
}
