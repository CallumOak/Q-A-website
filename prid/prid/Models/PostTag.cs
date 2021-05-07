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
    public class PostTag
    {
        public int TagId {get; set;}

        public int PostId {get; set;}

        public virtual Post Post {get; set;}

        public virtual Tag Tag {get; set;}

    }
}
