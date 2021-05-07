export class Tag{
    id: number;
    name: string;
    posts: number;
    constructor(data: any){
        if(data){
            this.id = data.id;
            this.name = data.name;
            this.posts = data.posts;
        }
    }
}