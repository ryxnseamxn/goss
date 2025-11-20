using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

[ApiController]
[Route("api/chatrooms")]
public class ChatRoomController : ControllerBase
{
    private readonly ChatRoomManager _manager;
    private readonly IHubContext<ChatHub> _hub;

    public ChatRoomController(ChatRoomManager manager, IHubContext<ChatHub> hub)
    {
        _manager = manager;
        _hub = hub;
    }

    [HttpPost("{roomId}")]
    public IActionResult CreateRoom(string roomId)
    {
        if (!_manager.CreateRoom(roomId))
            return Conflict("Room already exists.");

        return Ok("Room created.");
    }

    [HttpPost("{roomId}/message")]
    public async Task<IActionResult> SendMessage(string roomId, [FromBody] string message)
    {
        if (!_manager.RoomExists(roomId))
        {
            return NotFound("Room does not exist.");            
        }

        await _hub.Clients.Group(roomId).SendAsync("ReceiveMessage", message);

        return Ok("Message Sent");
    }

    [HttpDelete("{roomId}")]
    public IActionResult DeleteRoom(string roomId)
    {
        if (!_manager.DeleteRoom(roomId))
            return NotFound("Room does not exist.");

        return Ok("Room deleted.");
    }
}
