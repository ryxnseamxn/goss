public class ChatRoomManager
{
    private readonly Dictionary<string, HashSet<string>> _rooms = new();
    public IReadOnlyDictionary<string, HashSet<string>> Rooms => _rooms;

    public void AddUserToRoom(string roomId, string connectionId)
    {
        if (!_rooms.ContainsKey(roomId))
            _rooms[roomId] = new HashSet<string>();

        _rooms[roomId].Add(connectionId);
    }

    public bool CreateRoom(string roomId)
    {
        if (_rooms.ContainsKey(roomId))
        {
            return false; 
        }

        _rooms[roomId] = new HashSet<string>();
        return true; 
    }

    public bool DeleteRoom(string roomId)
    {
        return _rooms.Remove(roomId);
    }

    public bool RoomExists(string roomId)
    {
        return _rooms.ContainsKey(roomId);
    }
}
