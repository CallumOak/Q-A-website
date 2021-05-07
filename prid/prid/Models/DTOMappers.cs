using System;

using System.Collections.Generic;

using System.Linq;

using System.Threading.Tasks;

namespace prid.Models {

    public static class DTOMappers {

        public static UserDTO ToDTO(this User user) {

            return new UserDTO {
                Id = user.Id,
                Pseudo = user.Pseudo,
                Email = user.Email,
                LastName = user.LastName,
                FirstName = user.FirstName,
                BirthDate = user.BirthDate,
                Reputation = user.Reputation,
                Role = user.Role,
                PostIds = (from p in user.Posts select p.Id).ToList()
            };
        }

        public static CommentDTO ToDTO(this Comment comment) {

            return new CommentDTO {
                Id = comment.Id,
                Body = comment.Body,
                Timestamp = comment.Timestamp,
                AuthorId = comment.AuthorId,
                PostId = comment.PostId
            };
        }

        public static TagDTO ToDTO(this Tag tag, PridContext context) {
            return new TagDTO {
                Id = tag.Id,
                Name = tag.Name,
                Posts = (from p in context.PostTags where p.TagId == tag.Id select p).Count()
            };
        }

        public static VoteDTO ToDTO(this Vote vote) {
            return new VoteDTO {
                UpDown = vote.UpDown,
                PostId = vote.PostId,
                AuthorId = vote.AuthorId
            };
        }

        public static PostDTO ToDTO(this Post post, PridContext context) {
            var votes = (from v in context.Votes where v.PostId == post.Id select v.AuthorId).ToList();
            return new PostDTO {
                Id = post.Id,
                Title = post.Title,
                Body = post.Body,
                Timestamp = post.Timestamp,
                ParentId = post.ParentId,
                AuthorId = post.AuthorId,
                Author = (from u in context.Users where u.Id == post.AuthorId select u).FirstOrDefault().ToDTO(),
                AcceptedAnswerId = post.AcceptedAnswerId,
                CommentIds = (from c in context.Comments where c.PostId == post.Id select c.Id).ToList(),   
                ChildIds = (from p in context.Posts where p.ParentId == post.Id select p.Id).ToList(),
                VoteIds = votes,
                TagIds = (from pt in context.PostTags where pt.PostId == post.Id select pt.TagId).ToList(),
                Score = context.Votes.Where(v => v.PostId == post.Id).Sum(v => v.UpDown),
                Tags = (from pt in context.PostTags where pt.PostId == post.Id select (from t in context.Tags where t.Id == pt.TagId select t).FirstOrDefault()).ToList().ToDTO(context)
            };
        }

        public static List<UserDTO> ToDTO(this IEnumerable<User> users) {
            return users.Select(o => o.ToDTO()).ToList();
        }

        public static List<CommentDTO> ToDTO(this IEnumerable<Comment> comments) {
            return comments.Select(o => o.ToDTO()).ToList();
        }

        public static List<VoteDTO> ToDTO(this IEnumerable<Vote> votes) {
            return votes.Select(o => o.ToDTO()).ToList();
        }

        public static List<TagDTO> ToDTO(this IEnumerable<Tag> tags, PridContext context) {
            return tags.Select(o => o.ToDTO(context)).ToList();
        }

        public static List<PostDTO> ToDTO(this IEnumerable<Post> posts, PridContext context) {
            return posts.Select(o => o.ToDTO(context)).ToList();
        }
    }

}