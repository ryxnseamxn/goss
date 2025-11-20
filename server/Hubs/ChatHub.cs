using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    private readonly ChatRoomManager _rooms;

    public ChatHub(ChatRoomManager rooms)
    {
        _rooms = rooms;
    }

    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        _rooms.AddUserToRoom(roomId, Context.ConnectionId);
    }

    public async Task SendMessage(string roomId, string message)
    {
        await Clients.Group(roomId).SendAsync("ReceiveMessage", Context.ConnectionId, message);
    }
}
