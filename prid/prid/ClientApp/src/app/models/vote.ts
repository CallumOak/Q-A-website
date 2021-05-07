export class Vote {
    authorId: number;
    postId: number;
    upDown: number;
    constructor(data: any) {
        if (data) {
            this.authorId = data.authorId;
            this.postId = data.postId;
            this.upDown = data.upDown;
        }
    }
}
