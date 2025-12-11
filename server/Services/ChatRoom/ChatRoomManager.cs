public class ChatRoomManager
{
    private readonly Dictionary<string, HashSet<string>> _rooms = new();
    private readonly Dictionary<string, string> _roomNames = new(); // roomId -> roomName
    public IReadOnlyDictionary<string, HashSet<string>> Rooms => _rooms;
    public IReadOnlyDictionary<string, string> RoomNames => _roomNames;

    public void AddUserToRoom(string roomId, string connectionId)
    {
        if (!_rooms.ContainsKey(roomId))
            _rooms[roomId] = new HashSet<string>();

        _rooms[roomId].Add(connectionId);
    }

    public bool CreateRoom(string roomId, string roomName)
    {
        if (_rooms.ContainsKey(roomId))
        {
            return false; 
        }

        _rooms[roomId] = new HashSet<string>();
        _roomNames[roomId] = roomName;
        return true; 
    }

    public bool DeleteRoom(string roomId)
    {
        _roomNames.Remove(roomId);
        return _rooms.Remove(roomId);
    }

    public bool RoomExists(string roomId)
    {
        return _rooms.ContainsKey(roomId);
    }

    public void RemoveUserFromRoom(string roomId, string connectionId)
    {
        if (_rooms.ContainsKey(roomId))
        {
            _rooms[roomId].Remove(connectionId);
        }
    }

    public void RemoveUserFromAllRooms(string connectionId)
    {
        foreach (var room in _rooms.Values)
        {
            room.Remove(connectionId);
        }
    }

    public string? FindUserRoom(string connectionId)
    {
        return _rooms.FirstOrDefault(r => r.Value.Contains(connectionId)).Key;
    }
}
