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
    public class UsersController : ControllerBase
    {
        private readonly PridContext _context;

        public UsersController(PridContext context) {
            _context = context;
        }

        [Authorized(Role.Admin)]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetAll() {
            return (await _context.Users.ToListAsync()).ToDTO();
        }

        [AllowAnonymous]
        [HttpGet("pseudo/{pseudo}")]
        public async Task<ActionResult<UserDTO>> GetByPseudo(string pseudo)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == pseudo);
            if (user == null)
                return NotFound();
            return user.ToDTO();
        }

        [AllowAnonymous]
        [HttpGet("id/{id}")]
        public async Task<ActionResult<UserDTO>> GetById(int id)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound();
            return user.ToDTO();
        }

        [AllowAnonymous]
        [HttpGet("email/{email}")]
        public async Task<ActionResult<UserDTO>> GetByEmail(string email)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return NotFound();
            return user.ToDTO();
        }
        
        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult<UserDTO>> PostUser(UserDTO data) {
        
        var newUser = new User() {
            Pseudo = data.Pseudo,
            Password = TokenHelper.GetPasswordHash(data.Password),
            Email = data.Email,
            LastName = data.LastName,
            FirstName = data.FirstName,
            BirthDate = data.BirthDate,
            Reputation = data.Reputation,
            Role = data.Role
        };
            _context.Users.Add(newUser);
            var res = await _context.SaveChangesAsyncWithValidation();
            if (!res.IsEmpty)
                return BadRequest(res);
            return CreatedAtAction(nameof(GetByPseudo), new { pseudo = newUser.Pseudo }, newUser.ToDTO());
        }

        [Authorized(Role.Admin)]
        [HttpPut("{pseudo}")]
        public async Task<IActionResult> PutUser(string pseudo, UserDTO userDTO) {
            if (pseudo != userDTO.Pseudo)
                return BadRequest();
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == pseudo);
            if (user == null)
                return NotFound();
            user.Pseudo = userDTO.Pseudo;
            user.Email = userDTO.Email;
            user.LastName = userDTO.LastName;
            user.FirstName = userDTO.FirstName;
            user.BirthDate = userDTO.BirthDate;
            user.Reputation = userDTO.Reputation;
            if (userDTO.Password != null && userDTO.Password.Length >= 3)
                user.Password = TokenHelper.GetPasswordHash(userDTO.Password); 
            var res = await _context.SaveChangesAsyncWithValidation();
            if (!res.IsEmpty)
            {
                return BadRequest(res);
            }
            return NoContent();
        }

        [Authorized(Role.Admin)]
        [HttpDelete("{pseudo}")]
        public async Task<IActionResult> DeleteUser(string pseudo) {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == pseudo);

            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        public async Task<ActionResult<User>> Authenticate(UserDTO data) {
            var user = await Authenticate(data.Pseudo, data.Password);
            if (user == null)
                return BadRequest(new ValidationErrors().Add("User not found", "Pseudo"));
            if (user.Token == null)
                return BadRequest(new ValidationErrors().Add("Incorrect password", "Password"));
            return Ok(user);
        }

        private async Task<User> Authenticate(string pseudo, string password) {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Pseudo == pseudo);
            // return null if user not found
            if (user == null)
                return null;
            if (user.Password == TokenHelper.GetPasswordHash(password)) {
                // authentication successful so generate jwt token
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes("my-super-secret-key");
                var tokenDescriptor = new SecurityTokenDescriptor {
                    Subject = new ClaimsIdentity(new Claim[]
                                                {
                                                    new Claim(ClaimTypes.Name, user.Pseudo),
                                                    new Claim(ClaimTypes.Role, user.Role.ToString())
                                                }),
                    IssuedAt = DateTime.UtcNow,
                    Expires = DateTime.UtcNow.AddMinutes(100000), //MODIF
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                user.Token = tokenHandler.WriteToken(token);
            }
            // remove password before returning
            user.Password = null;
            return user;
        }
    }
}
