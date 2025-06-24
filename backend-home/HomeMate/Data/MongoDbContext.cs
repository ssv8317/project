using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using HomeMate.Models;
using System;

namespace HomeMate.Data
{
    public class MongoDbContext
    {
        public IMongoDatabase Database { get; }

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("MongoDb");
            if (string.IsNullOrEmpty(connectionString))
            {
                connectionString = "mongodb://localhost:27017/homemate";
            }

            try
            {
                var mongoUrl = new MongoUrl(connectionString);
                var client = new MongoClient(mongoUrl);
                Database = client.GetDatabase(mongoUrl.DatabaseName ?? "homemate");
                
                // Test the connection
                Database.RunCommand<MongoDB.Bson.BsonDocument>(new MongoDB.Bson.BsonDocument("ping", 1));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MongoDB connection error: {ex.Message}");
                throw;
            }
        }

        public IMongoCollection<User> Users => Database.GetCollection<User>("users");
        
        // Add indexes for better performance
        public async void CreateIndexes()
        {
            try
            {
                // Create unique index on email
                var emailIndexKeys = Builders<User>.IndexKeys.Ascending(u => u.Email);
                var emailIndexOptions = new CreateIndexOptions { Unique = true };
                await Users.Indexes.CreateOneAsync(new CreateIndexModel<User>(emailIndexKeys, emailIndexOptions));
                
                // Create index on location preference for matching
                var locationIndexKeys = Builders<User>.IndexKeys.Ascending(u => u.LocationPreference);
                await Users.Indexes.CreateOneAsync(new CreateIndexModel<User>(locationIndexKeys));
                
                Console.WriteLine("✅ Database indexes created successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️  Index creation warning: {ex.Message}");
            }
        }
    }
}