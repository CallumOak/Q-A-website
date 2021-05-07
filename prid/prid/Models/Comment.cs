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
    public class Comment : IValidatableObject 
    {
        [Key]
        public int Id {get; set;}

        [Required(ErrorMessage = "Required")]
        public string Body {get; set;}

        [Required(ErrorMessage = "Required")]
        public DateTime Timestamp { get; set; }

        public int AuthorId {get; set;}
        public int PostId {get; set;}
        public virtual User Author {get; set;}
        public virtual Post Post {get; set;}
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            PridContext currContext = (PridContext)validationContext.GetService(typeof(DbContext));
            Debug.Assert(currContext != null);
            if (currContext == null)
                yield return new ValidationResult("No Context", new[] { nameof(Id) });
        }
    }
}
