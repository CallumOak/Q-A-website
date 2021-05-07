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
    public class CommentsController : ControllerBase
    {
        private readonly PridContext _context;

        public CommentsController(PridContext context) {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<CommentDTO>>> GetCommentsByPostId(int id)
        {
            return Ok((await _context.Comments.Where(p => p.PostId == id).ToListAsync()).ToDTO());
        }

        [HttpPost]
        public async Task<ActionResult<Boolean>> Post(CommentDTO data) {
            var comment = new Comment() {
                Body = data.Body,
                Timestamp = DateTime.Now,
                PostId = data.PostId,
                AuthorId = data.AuthorId
            };
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return Ok(true);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Boolean>> Delete(int id) {
            var isAdmin = User.IsInRole(Role.Admin.ToString());
            var comment = await _context.Comments.FindAsync(id);
            var author = await _context.Users.FindAsync(comment.AuthorId);
            if (comment != null) {
                var isAuthor = User.Identity.Name == author.Pseudo;
                if (isAdmin || isAuthor) {
                    _context.Comments.Remove(comment);
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

        [HttpPut("{id}")]
        public async Task<ActionResult<Boolean>> Put(int id, CommentDTO data) {
            var comment = await _context.Comments.SingleOrDefaultAsync(c => c.Id == id);
            if (comment == null)
                return NotFound();
            var isAdmin = User.IsInRole(Role.Admin.ToString());
            var author = await _context.Users.FindAsync(comment.AuthorId);
            var isAuthor = User.Identity.Name == author.Pseudo;
            if (isAdmin || isAuthor)
            {
                comment.Body = data.Body;
                comment.Timestamp = DateTime.Now;
                comment.PostId = data.PostId;
                comment.AuthorId = data.AuthorId;
                await _context.SaveChangesAsync();
                return Ok(true);
            }
            else {
                return BadRequest(new ValidationErrors().Add("Not Authorized", "User"));
            }
        }
    }
}
