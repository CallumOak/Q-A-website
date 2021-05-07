using Microsoft.EntityFrameworkCore;

namespace prid.Models
{
    public class PridContext : DbContext
    {
        public PridContext(DbContextOptions<PridContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Tag> Tags {get; set;}
        public DbSet<Post> Posts {get; set;}
        public DbSet<Comment> Comments {get; set;}
        public DbSet<Vote> Votes {get; set;}
        public DbSet<PostTag> PostTags {get; set;}

        protected override void OnModelCreating(ModelBuilder modelBuilder) {

            base.OnModelCreating(modelBuilder);

            //Primary keys
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Pseudo)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Tag>()
                .HasIndex(t => t.Name)
                .IsUnique();

            modelBuilder.Entity<PostTag>().HasKey(pt => new {pt.PostId, pt.TagId});

            modelBuilder.Entity<Vote>().HasKey(v => new {v.AuthorId, v.PostId});

            //Vote
            modelBuilder.Entity<Vote>()
                .HasOne<User>(v => v.Author)
                .WithMany(u => u.Votes)
                .HasForeignKey(v => v.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Vote>()
                .HasOne<Post>(v => v.Post)
                .WithMany(p => p.Votes)
                .HasForeignKey(v => v.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            //PostTag

            modelBuilder.Entity<PostTag>()
                .HasOne<Post>(pt => pt.Post)
                .WithMany(p => p.PostTags)
                .HasForeignKey(pt => pt.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PostTag>()
                .HasOne<Tag>(pt => pt.Tag)
                .WithMany(t => t.PostTags)
                .HasForeignKey(pt => pt.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            //Comment
            modelBuilder.Entity<Comment>()
                .HasOne<Post>(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Comment>()
                .HasOne<User>(c => c.Author)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            //Post
            modelBuilder.Entity<Post>()
                .HasOne<Post>(p => p.Parent)
                .WithMany(p => p.Childs)
                .HasForeignKey(p => p.ParentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Post>()
                .HasOne<User>(p => p.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<Post>()
                .HasOne<Post>(p => p.AcceptedAnswer)
                .WithOne() //pas oblige d'avoir la reciproque
                .HasForeignKey<Post>(p => p.AcceptedAnswerId)
                .OnDelete(DeleteBehavior.SetNull);

        }
    }
}
