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
    public enum Role {
        Admin = 1, Member = 0
    }
    public class User : IValidatableObject{

        [Key]
        public int Id { get; set;}

        [Required(ErrorMessage = "Required")]
        [MinLength(3, ErrorMessage = "Minimum 3 characters")]
        [MaxLength(10, ErrorMessage = "Maximum 10 characters")]
        [RegularExpression(@"[a-zA-Z][a-zA-Z_]*")]
        public string Pseudo {get; set;}

        [Required(ErrorMessage = "Required")]
        [MinLength(3, ErrorMessage = "Minimum 3 characters")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Required")]
        [RegularExpression(@"^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$")]
        public string Email { get; set; }
        
        [MinLength(3, ErrorMessage = "Minimum 3 characters")]
        [MaxLength(50, ErrorMessage = "Maximum 50 characters")]
        public string LastName  { get; set; }
        
        [MinLength(3, ErrorMessage = "Minimum 3 characters")]
        [MaxLength(50, ErrorMessage = "Maximum 50 characters")]
        public string FirstName  { get; set; } 
        public DateTime? BirthDate  { get; set; }
        public Role Role { get; set; } = Role.Member;
        [NotMapped]
        public string Token { get; set; }
        public int? Age {
            get {
                if (!BirthDate.HasValue)
                    return null;
                var today = DateTime.Today;
                var age = today.Year - BirthDate.Value.Year;
                if (BirthDate.Value.Date > today.AddYears(-age)) age--;
                return age;
            }
        }
        
        [Required(ErrorMessage = "Required")]
        [Range(0.0, double.MaxValue)]
        public int Reputation  { get; set; }

        public virtual IList<Comment> Comments { get; set; } = new List<Comment>();
        public virtual IList<Vote> Votes { get; set; } = new List<Vote>();
        public virtual IList<Post> Posts { get; set; } = new List<Post>();
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            PridContext currContext = (PridContext)validationContext.GetService(typeof(DbContext));
            Debug.Assert(currContext != null);
            if (Age.HasValue && Age < 18)
                yield return new ValidationResult("Must be 18 years old", new[] { nameof(BirthDate) });
            if (LastName != null && FirstName == null)
                yield return new ValidationResult("Must have first name because of last name", new[] {nameof(FirstName), nameof(LastName)});
            var user = (from u in currContext.Users where u.Pseudo == Pseudo && u.Id != Id select u).FirstOrDefault();
            if (user != null)
                yield return new ValidationResult("Already in use", new[] { nameof(Pseudo) });
            user = (from u in currContext.Users where u.Email == Email && u.Id != Id select u).FirstOrDefault();
            if (user != null)
                yield return new ValidationResult("Already in use", new[] { nameof(Email) });
        }
    }
}
