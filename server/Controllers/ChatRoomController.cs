using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.Model.Dto;
using server.Model;
using server.Services;

[ApiController]
[Route("api/chatrooms")]
public class ChatRoomController : ControllerBase
{
    private readonly ChatRoomManager _manager;
    private readonly IHubContext<ChatHub> _hub;
    private readonly MessageService _messageService;

    public ChatRoomController(ChatRoomManager manager, IHubContext<ChatHub> hub, MessageService messageService)
    {
        _manager = manager;
        _hub = hub;
        _messageService = messageService;
    }

    [HttpGet]
    public IActionResult GetAllRooms()
    {
        var rooms = _manager.Rooms.Select(r => new
        {
            roomId = r.Key,
            roomName = _manager.RoomNames.GetValueOrDefault(r.Key, r.Key),
            userCount = r.Value.Count
        });
        return Ok(rooms);
    }

    [HttpGet("{roomId}/messages")]
    public async Task<IActionResult> GetMessages(string roomId)
    {
        if (!_manager.RoomExists(roomId))
            return NotFound("Room does not exist.");

        var messages = await _messageService.GetMessagesByRoomAsync(roomId);
        return Ok(messages);
    }

    [HttpPost("{roomId}")]
    public async Task<IActionResult> CreateRoom(string roomId)
    {
        if (!_manager.CreateRoom(roomId, roomId))
            return Conflict("Room already exists.");

        // Broadcast room creation to all connected clients
        await _hub.Clients.All.SendAsync("RoomCreated", new { roomId, roomName = roomId, userCount = 0 });

        return Ok("Room created.");
    }

    [HttpPost]
    public async Task<IActionResult> CreateRoomWithName([FromBody] CreateRoomRequest request)
    {
        var roomId = Guid.NewGuid().ToString();
        
        if (!_manager.CreateRoom(roomId, request.RoomName))
            return Conflict("Failed to create room.");

        // Broadcast room creation to all connected clients
        await _hub.Clients.All.SendAsync("RoomCreated", new { roomId, roomName = request.RoomName, userCount = 0 });

        return Ok(new { roomId, roomName = request.RoomName });
    }

    [HttpPost("{roomId}/message")]
    public async Task<IActionResult> SendMessage(string roomId, [FromBody] MessageDto messageDto)
    {
        if (!_manager.RoomExists(roomId))
        {
            return NotFound("Room does not exist.");            
        }

        try
        {
            // Save message to database
            var message = await _messageService.AddMessageAsync(roomId, messageDto.Username, messageDto.Email, messageDto.Message);

            // Broadcast message to all clients in the room
            await _hub.Clients.Group(roomId).SendAsync("ReceiveMessage", messageDto);

            return Ok("Message Sent");
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                error = ex.Message,
                type = ex.GetType().Name,
                stack = ex.StackTrace
            });
        }
    }

    [HttpDelete("{roomId}")]
    public async Task<IActionResult> DeleteRoom(string roomId)
    {
        if (!_manager.DeleteRoom(roomId))
            return NotFound("Room does not exist.");

        // Delete all messages for this room
        await _messageService.DeleteMessagesByRoomAsync(roomId);

        // Broadcast room deletion to all connected clients (including those in the room)
        await _hub.Clients.All.SendAsync("RoomDeleted", roomId);

        return Ok("Room deleted.");
    }
}

public record CreateRoomRequest(string RoomName);
