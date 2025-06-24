using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System;
using System.Security.Claims;
using HomeMate.Dtos;
using HomeMate.Models;
using HomeMate.Services;

namespace HomeMate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;

        public AuthController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto registerUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userService.RegisterUserAsync(registerUserDto);

                var response = new
                {
                    message = "Registration successful",
                    user = user
                };

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"[Register Error] {ex}");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto loginUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _userService.LoginUserAsync(loginUserDto);
                
                if (result == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                var response = new
                {
                    message = "Login successful",
                    token = result.Token,
                    user = result.User
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Login Error] {ex}");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
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
                Console.WriteLine($"[GetCurrentUser Error] {ex}");
                return StatusCode(500, new { message = "An error occurred while fetching user data" });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // In a stateless JWT system, logout is handled client-side
            // You could implement token blacklisting here if needed
            return Ok(new { message = "Logout successful" });
        }
    }
}