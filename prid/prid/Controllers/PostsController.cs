using System;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using prid.Models;
using PRID_Framework;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Text;
using System.Security.Claims;
using prid.Helpers;

namespace prid.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly PridContext _context;

        public PostsController(PridContext context) {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PostDTO>>> GetAllQuestions()
        {
            return Ok((await _context.Posts.Where(p => p.ParentId == null).ToListAsync()).ToDTO(_context));
        }

        [AllowAnonymous]
        [HttpGet("byTag/{tagId}")]
        public async Task<ActionResult<IEnumerable<PostDTO>>> GetAllByTag(int tagId)
        {
            return Ok((await _context.Posts.Where(p => p.ParentId == null && p.PostTags.Any(pt => pt.TagId == tagId)).ToListAsync()).ToDTO(_context));
        }
        
        [HttpGet("{pseudo}")]
        public async Task<ActionResult<IEnumerable<PostDTO>>> GetForUser(string pseudo)
        {
            var user = User.Identity.Name;
            var isAdmin = User.IsInRole(Role.Admin.ToString());
            return Ok((await _context.Posts.Where(m => m.Author.Pseudo == pseudo && 
                (isAdmin || m.Author.Pseudo == user)).ToListAsync()).ToDTO(_context));
        }

        [AllowAnonymous]
        [HttpGet("question/{id}")]
        public async Task<ActionResult<PostDTO>> GetQuestionById(int id)
        {
            var post = await _context.Posts.SingleOrDefaultAsync(p => p.Id == id && p.Title != null);
            if (post == null)
                return NotFound();
            return Ok(post.ToDTO(_context));
        }

        [AllowAnonymous]
        [HttpGet("post/{id}")]
        public async Task<ActionResult<PostDTO>> GetPostById(int id)
        {
            var post = await _context.Posts.SingleOrDefaultAsync(p => p.Id == id);
            if (post == null)
                return NotFound();
            return Ok(post.ToDTO(_context));
        }

        [AllowAnonymous]
        [HttpGet("common_answers/{id}")]
        public async Task<ActionResult<IEnumerable<PostDTO>>> getCommonAnswersByQuestionId(int id)
        {
            var post = await _context.Posts.SingleOrDefaultAsync(p => p.Id == id);
            if (post == null)
                return NotFound();
            return Ok((await _context.Posts.Where(p => p.ParentId == id && post.AcceptedAnswerId != p.Id).ToListAsync()).ToDTO(_context));
        }

        [HttpPost]
        public async Task<ActionResult<Boolean>> Post(PostDTO data) {
            var post = new Post() {
                Title = data.Title,
                Body = data.Body,
                Timestamp = DateTime.Now,
                ParentId = data.ParentId,
                AuthorId = data.AuthorId,
                AcceptedAnswerId = data.AcceptedAnswerId
            };
            _context.Posts.Add(post);
            if (data.TagIds != null)
            {
                foreach(int tagID in data.TagIds){
                    var postTag = new PostTag(){
                        TagId = tagID,
                        PostId = post.Id
                    };
                    post.PostTags.Add(postTag);
                }
            }
            await _context.SaveChangesAsync();
            return Ok(post.Id);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Boolean>> Put(int id, PostDTO data) {
            var post = await _context.Posts.SingleOrDefaultAsync(p => p.Id == id);
            if (post == null)
                return NotFound();
            var isAdmin = User.IsInRole(Role.Admin.ToString());
            var author = await _context.Users.FindAsync(post.AuthorId);
            var isAuthor = User.Identity.Name == author.Pseudo;
            if (isAdmin || isAuthor)
            {
                if (post.AcceptedAnswerId == null && data.AcceptedAnswerId != null)
                {
                    var acceptedAnswer = await _context.Posts.FindAsync(data.AcceptedAnswerId);
                    if (acceptedAnswer == null)
                        return NotFound();
                    var answerAuthor = await _context.Users.FindAsync(acceptedAnswer.AuthorId);
                    author.Reputation += 2;
                    answerAuthor.Reputation += 15;
                }
                post.Body = data.Body;
                post.Timestamp = DateTime.Now;
                post.ParentId = data.ParentId;
                post.AuthorId = data.AuthorId;
                post.AcceptedAnswerId = data.AcceptedAnswerId;
                await _context.SaveChangesAsync();
                return Ok(true);
            }
            else {
                return BadRequest(new ValidationErrors().Add("Not Authorized", "User"));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Boolean>> Delete(int id) {
            var isAdmin = User.IsInRole(Role.Admin.ToString());
            var post = await _context.Posts.FindAsync(id);
            if (post != null) {
                var author = await _context.Users.FindAsync(post.AuthorId);
                var isAuthor = User.Identity.Name == author.Pseudo;
                var commentsCount = await _context.Comments.Where(c => c.PostId == id).CountAsync();
                var childsCount = await _context.Posts.Where(p => p.ParentId == id).CountAsync();
                var isAlone = commentsCount == 0 && childsCount == 0;
                if (isAdmin || (isAuthor && isAlone)) {
                    _context.Posts.Remove(post);
                    await _context.SaveChangesAsync();
                    return Ok(true);
                }
                else {
                    return BadRequest(new ValidationErrors().Add("Not Authorized", "User"));
                }
            }
            else {
                return NotFound();
            }
        }
    }
}
