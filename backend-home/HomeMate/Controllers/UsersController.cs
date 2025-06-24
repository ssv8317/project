using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System;
using System.Security.Claims;
using HomeMate.Services;

namespace HomeMate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { user = user });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetProfile Error] {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching profile" });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string? location, [FromQuery] string? budgetRange)
        {
            try
            {
                // This is a placeholder for user search functionality
                // You can implement actual search logic based on location, budget, etc.
                return Ok(new { 
                    message = "User search functionality will be implemented",
                    filters = new { location, budgetRange }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SearchUsers Error] {ex}");
                return StatusCode(500, new { message = "An error occurred during search" });
            }
        }
    }
}