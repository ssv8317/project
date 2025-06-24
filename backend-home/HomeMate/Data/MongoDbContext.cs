using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using HomeMate.Models;

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

            var mongoUrl = new MongoUrl(connectionString);
            var client = new MongoClient(mongoUrl);
            Database = client.GetDatabase(mongoUrl.DatabaseName ?? "homemate");
        }

        public IMongoCollection<User> Users => Database.GetCollection<User>("users");
    }
}