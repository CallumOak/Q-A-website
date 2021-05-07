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
    public class TagsController : ControllerBase
    {
        private readonly PridContext _context;

        public TagsController(PridContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TagDTO>>> GetAll()
        {
            return (await _context.Tags.ToListAsync()).ToDTO(_context);
        }

        [AllowAnonymous]
        [HttpGet("{name}")]
        public async Task<ActionResult<TagDTO>> GetByName(string name)
        {
            var tag = await _context.Tags.SingleOrDefaultAsync(t => t.Name == name);
            if (tag == null)
                return NotFound();
            return tag.ToDTO(_context);
        }

        [AllowAnonymous]
        [HttpGet("id/{id}")]
        public async Task<ActionResult<TagDTO>> GetById(int id)
        {
            var tag = await _context.Tags.SingleOrDefaultAsync(t => t.Id == id);
            if (tag == null)
                return NotFound();
            return tag.ToDTO(_context);
        }

        [AllowAnonymous]
        [HttpGet("postId/{postId}")]
        public async Task<ActionResult<IEnumerable<TagDTO>>> GetByPostId(int postId)
        {
            return (await _context.Tags.Where(t =>
                t.PostTags.Where(pt => pt.PostId == postId).Count() > 0).ToListAsync()).ToDTO(_context);
        }

        [Authorized(Role.Admin)]
        [HttpPost]
        public async Task<ActionResult<TagDTO>> PostTag(TagDTO data)
        {
            var prevTag = await _context.Tags.SingleOrDefaultAsync(t => t.Name == data.Name);
            if (prevTag != null)
                return BadRequest(new ValidationErrors().Add("duplicate", "Tag"));
            var newTag = new Tag()
            {
                Name = data.Name
            };
            _context.Tags.Add(newTag);
            await _context.SaveChangesAsync(); //withvalidation?
            return CreatedAtAction(nameof(GetByName), new { name = newTag.Name }, newTag.ToDTO(_context));
        }

        [Authorized(Role.Admin)]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTag(int id, TagDTO tagDTO)
        {
            var prevTag = await _context.Tags.SingleOrDefaultAsync(t => t.Name == tagDTO.Name);
            if (prevTag != null)
                return BadRequest(new ValidationErrors().Add("duplicate", "Tag"));
            var tag = await _context.Tags.SingleOrDefaultAsync(t => t.Id == id);
            if (tag == null)
                return NotFound();
            tag.Name = tagDTO.Name;
            await _context.SaveChangesAsync(); //withvalidation?
            return NoContent();
        }

        [Authorized(Role.Admin)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTag(int id)
        {
            var tag = await _context.Tags.SingleOrDefaultAsync(t => t.Id == id);

            if (tag == null)
                return NotFound();

            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
