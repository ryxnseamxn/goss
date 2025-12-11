using server.Model;
using Microsoft.EntityFrameworkCore;

namespace server.Services;

public class MessageService
{
    private readonly GossContext _context;

    public MessageService(GossContext context)
    {
        _context = context;
    }

    public async Task<Message> AddMessageAsync(string roomId, string username, string email, string content)
    {
        var message = new Message
        {
            RoomId = roomId,
            Username = username,
            Email = email,
            Content = content,
            Timestamp = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<List<Message>> GetMessagesByRoomAsync(string roomId)
    {
        return await _context.Messages
            .Where(m => m.RoomId == roomId)
            .OrderBy(m => m.Timestamp)
            .ToListAsync();
    }

    public async Task<bool> DeleteMessagesByRoomAsync(string roomId)
    {
        var messages = await _context.Messages.Where(m => m.RoomId == roomId).ToListAsync();
        _context.Messages.RemoveRange(messages);
        await _context.SaveChangesAsync();
        return true;
    }
}
