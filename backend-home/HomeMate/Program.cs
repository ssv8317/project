using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HomeMate.Data;
using HomeMate.Services;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS with more specific configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT Authentication Configuration
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-super-secret-jwt-key-that-should-be-at-least-32-characters-long!";
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, // Set to true in production with proper issuer
        ValidateAudience = false, // Set to true in production with proper audience
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// MongoDB and application services
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<UserService>();

var app = builder.Build();

// Test MongoDB connection on startup
try
{
    using (var scope = app.Services.CreateScope())
    {
        var mongoContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        // Test connection by getting database stats
        var database = mongoContext.Database;
        var stats = database.RunCommand<MongoDB.Bson.BsonDocument>(new MongoDB.Bson.BsonDocument("dbStats", 1));
        Console.WriteLine("✅ MongoDB connection successful!");
        Console.WriteLine($"📊 Database: {database.DatabaseNamespace.DatabaseName}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ MongoDB connection failed: {ex.Message}");
    Console.WriteLine("⚠️  Make sure MongoDB is running on mongodb://localhost:27017");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeMate API V1");
        c.RoutePrefix = "swagger";
    });
}

// Middleware order is important!
app.UseCors("AllowAngular");
app.UseAuthentication(); // Add this before UseAuthorization
app.UseAuthorization();

// Add health check endpoints
app.MapGet("/", () => new { 
    message = "HomeMate API is running!", 
    timestamp = DateTime.Now,
    status = "Backend running successfully",
    version = "1.0.0"
});

app.MapGet("/api/health", () => new { 
    status = "healthy",
    timestamp = DateTime.Now,
    database = "connected" // You could add actual DB health check here
});

app.MapControllers();

Console.WriteLine("🚀 HomeMate API is starting...");
Console.WriteLine($"🌐 Environment: {app.Environment.EnvironmentName}");
Console.WriteLine("📡 Available endpoints:");
Console.WriteLine("   - API: https://localhost:56636 or http://localhost:56637");
Console.WriteLine("   - Swagger: https://localhost:56636/swagger");
Console.WriteLine("   - Health: https://localhost:56636/api/health");

app.Run();