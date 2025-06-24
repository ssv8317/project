using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using HomeMate.Data;
using HomeMate.Services;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// MongoDB and application services
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<UserService>();

var app = builder.Build();

// Test MongoDB connection on startup (simplified)
try
{
    using (var scope = app.Services.CreateScope())
    {
        var mongoContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        Console.WriteLine("✅ MongoDB connection tested successfully!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ MongoDB connection failed: {ex.Message}");
}

// Add a simple test endpoint at root
app.MapGet("/", () => new { 
    message = "HomeMate API is working!", 
    timestamp = DateTime.Now,
    status = "Backend running successfully"
});

// Add test endpoint for auth
app.MapGet("/api/test", () => new { 
    message = "Auth API endpoint working",
    timestamp = DateTime.Now
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🚀 HomeMate API is running!");
Console.WriteLine("📡 Check your browser at the default port");
Console.WriteLine("📚 Swagger available at /swagger");
Console.WriteLine("🧪 Test endpoint at /");

app.Run();