using System;

namespace prid.Models {

    public class CommentDTO {
        public int Id {get; set;}
        public string Body {get; set;}
        public DateTime Timestamp {get; set;}
        public int AuthorId {get; set;}
        public int PostId {get; set;}
    }
}