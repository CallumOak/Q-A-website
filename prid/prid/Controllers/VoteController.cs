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
    public class VotesController : ControllerBase
    {
        private readonly PridContext _context;

        public VotesController(PridContext context) {
            _context = context;
        }

        [HttpGet("id/{postId}_{userId}")]
        public async Task<ActionResult<VoteDTO>> GetVoteById(int postId, int userId)
        {
            var vote = await _context.Votes.SingleOrDefaultAsync(v => v.PostId == postId && v.AuthorId == userId);
            if (vote == null)
                return NotFound();
            return Ok(vote.ToDTO());
        }

        [AllowAnonymous]
        [HttpGet("score/{postId}")]
        public async Task<ActionResult<VoteDTO>> GetScore(int postId)
        {
            var score = await _context.Votes.Where(v => v.PostId == postId).SumAsync(v => v.UpDown);
            return Ok(score);
        }

        [HttpDelete("id/{postId}_{userId}")]
        public async Task<ActionResult<Boolean>> Delete(int postId, int userId)
        {
            var isAdmin = User.IsInRole(Role.Admin.ToString());
            var vote = await _context.Votes.SingleOrDefaultAsync(v => v.PostId == postId && v.AuthorId == userId);
            if (vote != null) {
                var author = await _context.Users.FindAsync(vote.AuthorId);
                var isAuthor = User.Identity.Name == author.Pseudo;
                if (isAdmin || isAuthor) {
                    _context.Votes.Remove(vote);
                    await _context.SaveChangesAsync();
                    return Ok(true);
                }
            }
            return Ok(false);
        }

        [HttpPost]
        public async Task<ActionResult<Boolean>> Post(VoteDTO data)
        {
            var vote = new Vote() {
                AuthorId = data.AuthorId,
                PostId = data.PostId,
                UpDown = data.UpDown
            };
            var voter = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == User.Identity.Name);
            if (voter == null)
                return NotFound();
            var post = await _context.Posts.SingleOrDefaultAsync(p => p.Id == vote.PostId);
            if (post == null)
                return NotFound();
            var voted = await _context.Users.SingleOrDefaultAsync(u => u.Id == post.AuthorId);
            if (voted == null)
                return NotFound();
            if (voter.Id == voted.Id)
                return BadRequest(new ValidationErrors().Add("Not Authorized", "User"));
            var prev_vote = await _context.Votes.SingleOrDefaultAsync(v => v.PostId == vote.PostId && v.AuthorId == vote.AuthorId);
            if (prev_vote != null)
                return BadRequest(new ValidationErrors().Add("This vote already Exists", "Vote"));
            var canvote = false;
            if (vote.UpDown == 1) {
                canvote = voter.Reputation >= 15;
                voted.Reputation += 10;
            } else if (vote.UpDown == -1) {
                canvote = voter.Reputation >= 30;
                voted.Reputation = Math.Max(voted.Reputation - 2, 0);
                voter.Reputation -= 1;
            } else {
                return BadRequest(new ValidationErrors().Add("Not Authorized", "Vote"));
            }
            _context.Votes.Add(vote);
            await _context.SaveChangesAsync();
            return Ok(true);
        }
    }
}
