using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    private readonly ChatRoomManager _rooms;

    public ChatHub(ChatRoomManager rooms)
    {
        _rooms = rooms;
    }

    public async Task<bool> JoinRoom(string roomId)
    {
        if (!_rooms.RoomExists(roomId))
        {
            return false; 
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        _rooms.AddUserToRoom(roomId, Context.ConnectionId);
        
        await Clients.All.SendAsync("RoomUpdated", new RoomInfo
        {
            RoomId = roomId,
            RoomName = _rooms.RoomNames.GetValueOrDefault(roomId, roomId),
            UserCount = _rooms.Rooms[roomId].Count
        });
        
        return true; 
    }

    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        _rooms.RemoveUserFromRoom(roomId, Context.ConnectionId);
        
        await Clients.All.SendAsync("RoomUpdated", new RoomInfo
        {
            RoomId = roomId,
            RoomName = _rooms.RoomNames.GetValueOrDefault(roomId, roomId),
            UserCount = _rooms.Rooms[roomId].Count
        });
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var roomId = _rooms.FindUserRoom(Context.ConnectionId);
        
        if (roomId != null)
        {
            _rooms.RemoveUserFromRoom(roomId, Context.ConnectionId);
            
            await Clients.All.SendAsync("RoomUpdated", new RoomInfo
            {
                RoomId = roomId,
                RoomName = _rooms.RoomNames.GetValueOrDefault(roomId, roomId),
                UserCount = _rooms.Rooms[roomId].Count
            });
        }
        
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string roomId, string message)
    {
        await Clients.Group(roomId).SendAsync("ReceiveMessage", Context.ConnectionId, message);
    }

    public async Task BroadcastRoomCreated(string roomId)
    {
        await Clients.All.SendAsync("RoomCreated", roomId);
    }

    public List<RoomInfo> GetAllRooms()
    {
        return _rooms.Rooms.Select(r => new RoomInfo
        {
            RoomId = r.Key,
            RoomName = _rooms.RoomNames.GetValueOrDefault(r.Key, r.Key),
            UserCount = r.Value.Count
        }).ToList();
    }
}

public class RoomInfo
{
    public string RoomId { get; set; } = string.Empty;
    public string RoomName { get; set; } = string.Empty;
    public int UserCount { get; set; }
}
