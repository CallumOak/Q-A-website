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
    public class Tag : IValidatableObject 
    {
        [Key]
        public int Id {get; set;}
        [Required(ErrorMessage = "Required")]
        public string Name {get; set;}
        public virtual IList<PostTag> PostTags {get; set;} = new List<PostTag>();
        [NotMapped]
        public IEnumerable<Post> Posts {
            get => PostTags.Select(pt => pt.Post);
        }
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            PridContext currContext = (PridContext)validationContext.GetService(typeof(DbContext));
            Debug.Assert(currContext != null);
            var tag = (from t in currContext.Tags where t.Name == Name && t.Id != Id select t).FirstOrDefault();
            if (tag != null)
                yield return new ValidationResult("Already in use", new[] { nameof(Name) });
        }
    }
}