using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using HomeMate.Data;
using HomeMate.Services;

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
              .AllowCredentials(); // Add this for better support
    });
});

// MongoDB and application services
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<UserService>();

// Add logging
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

var app = builder.Build();

// Test MongoDB connection on startup
try
{
    using (var scope = app.Services.CreateScope())
    {
        var mongoContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        Console.WriteLine("🔄 Testing MongoDB connection...");
        
        // Try to ping the database
        var database = mongoContext.Database;
        var collections = await database.ListCollectionNamesAsync();
        
        Console.WriteLine("✅ MongoDB connection successful!");
        Console.WriteLine($"✅ Database: {database.DatabaseNamespace.DatabaseName}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ MongoDB connection failed: {ex.Message}");
    Console.WriteLine("🔧 Make sure MongoDB is running on localhost:27017");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeMate API v1");
        c.RoutePrefix = "swagger";
    });
}

// Middleware order is important
app.UseCors("AllowAngular");
app.UseHttpsRedirection();
app.UseRouting(); // Add explicit routing
app.UseAuthorization();

// Add a test endpoint to verify API is working
app.MapGet("/", () => new { 
    message = "HomeMate API is running", 
    timestamp = DateTime.Now,
    database = "MongoDB connected"
});

// Add a health check endpoint
app.MapGet("/health", async (MongoDbContext context) => {
    try
    {
        var userCount = await context.Users.EstimatedDocumentCountAsync();
        return Results.Ok(new { 
            status = "healthy", 
            database = "connected",
            userCount = userCount,
            timestamp = DateTime.Now 
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapControllers();

Console.WriteLine("🚀 Starting HomeMate API...");
Console.WriteLine("📡 API available at: https://localhost:5001 or http://localhost:5000");
Console.WriteLine("📚 Swagger UI: https://localhost:5001/swagger");
Console.WriteLine("🏥 Health check: https://localhost:5001/health");

app.Run();