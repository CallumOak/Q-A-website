using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prid.Models
{
    public class Post : IValidatableObject
    {
        [Key]
        public int Id {get; set;}
        public string Title {get; set;}
        [Required(ErrorMessage = "Required")]
        public string Body {get; set;}
        [Required(ErrorMessage = "Required")]
        public DateTime Timestamp {get; set;}
        public int? ParentId {get; set;}
        public int AuthorId {get; set;}
        public int? AcceptedAnswerId {get; set;}
        public virtual Post Parent {get; set;}
        public virtual User Author {get; set;}
        public virtual Post AcceptedAnswer {get; set;}
        public virtual IList<Comment> Comments { get; set; } = new List<Comment>();
        public virtual IList<Post> Childs {get; set; } = new List<Post>();
        public virtual IList<Vote> Votes {get; set; } = new List<Vote>();
        public virtual IList<PostTag> PostTags {get; set;} = new List<PostTag>();
        [NotMapped]
        public IEnumerable<Tag> Tags {
            get => PostTags.Select(pt => pt.Tag);
        }
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            PridContext currContext = (PridContext)validationContext.GetService(typeof(DbContext));
            Debug.Assert(currContext != null);
            if (Parent == null && Title == null)
                yield return new ValidationResult("A Question must have a Title", new[] { nameof(Title) });
            if (Parent != null && (Title != null || Title.Equals("")))
                yield return new ValidationResult("An Answer cannot have a Title", new[] {nameof(Title) });
        }
    }
}