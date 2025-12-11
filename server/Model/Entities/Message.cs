namespace server.Model;

public class Message
{
    public int Id { get; set; }
    public required string RoomId { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string Content { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
