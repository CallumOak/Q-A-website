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
    public class Vote : IValidatableObject 
    {
        public int AuthorId {set; get;}
        public int PostId {set; get;}
        [Required(ErrorMessage = "Required")]
        public int UpDown {get; set;}
        public virtual Post Post {get; set;}
        public virtual User Author {get; set;}
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            PridContext currContext = (PridContext)validationContext.GetService(typeof(DbContext));
            Debug.Assert(currContext != null);
            if (!(UpDown == 1 || UpDown == -1))
                yield return new ValidationResult("value should be Up (1) or Down (-1)", new[] {nameof(UpDown)});
        }
    }
}
