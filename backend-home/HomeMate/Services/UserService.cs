using BCrypt.Net;
using HomeMate.Data;
using HomeMate.Dtos;
using HomeMate.Models;
using MongoDB.Driver;
using System;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace HomeMate.Services
{
    public class UserService
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;

        public UserService(MongoDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<User> RegisterUserAsync(RegisterUserDto dto)
        {
            // Check if user already exists
            var existingUser = await _context.Users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                throw new InvalidOperationException("User with this email already exists");
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(), // Normalize email
                PasswordHash = HashPassword(dto.Password),
                Age = dto.Age,
                Gender = dto.Gender,
                Occupation = dto.Occupation,
                College = dto.College,
                SleepSchedule = dto.SleepSchedule,
                CleanlinessLevel = dto.CleanlinessLevel,
                SmokingPreference = dto.SmokingPreference,
                PetFriendly = dto.PetFriendly,
                BudgetRange = dto.BudgetRange,
                LocationPreference = dto.LocationPreference,
                AboutMe = dto.AboutMe,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(user);
            
            // Remove password hash from returned user
            user.PasswordHash = string.Empty;
            return user;
        }

        public async Task<LoginResult> LoginUserAsync(LoginUserDto dto)
        {
            var user = await AuthenticateUserAsync(dto.Email.ToLower(), dto.Password);
            
            if (user == null)
            {
                return null; // Invalid credentials
            }

            var token = GenerateJwtToken(user);
            
            // Remove password hash from returned user
            user.PasswordHash = string.Empty;
            
            return new LoginResult
            {
                Token = token,
                User = user
            };
        }

        public async Task<User> AuthenticateUserAsync(string email, string password)
        {
            var user = await _context.Users.Find(u => u.Email == email.ToLower()).FirstOrDefaultAsync();
            if (user == null)
                return null;

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            return isPasswordValid ? user : null;
        }

        public async Task<User> GetUserByIdAsync(string userId)
        {
            var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user != null)
            {
                user.PasswordHash = string.Empty; // Never return password hash
            }
            return user;
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            var user = await _context.Users.Find(u => u.Email == email.ToLower()).FirstOrDefaultAsync();
            if (user != null)
            {
                user.PasswordHash = string.Empty; // Never return password hash
            }
            return user;
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"] ?? "your-super-secret-jwt-key-that-should-be-at-least-32-characters-long!";
            var key = Encoding.ASCII.GetBytes(jwtKey);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim("userId", user.Id)
                }),
                Expires = DateTime.UtcNow.AddDays(
                    _configuration.GetValue<int>("Jwt:ExpiryInDays", 7)
                ),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
        }
    }
}