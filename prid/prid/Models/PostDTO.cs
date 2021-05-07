using System;
using System.Collections.Generic;

namespace prid.Models {

    public class PostDTO {
        public int Id {get; set;}
        public string Title {get; set;}
        public string Body {get; set;}
        public DateTime Timestamp {get; set;}
        public int? ParentId {get; set;}
        public int AuthorId {get; set;}
        public UserDTO Author {get; set; }
        public int? AcceptedAnswerId { get; set; }
        public IList<int> CommentIds { get; set; }
        public IList<int> ChildIds { get; set; }
        public IList<int> VoteIds { get; set; }
        public IList<int> TagIds { get; set; }
        public int Score { get; set; }
        public IList<TagDTO> Tags {get; set; }
    }
}