using server.Model;
using Microsoft.EntityFrameworkCore;

namespace server.Services;

public class UserService
{
    private readonly GossContext _context;

    public UserService(GossContext context)
    {
        _context = context;
    }

    public async Task<User> GetOrCreateUserAsync(string email, string? username = null)
    {
        var user = await _context.Users.FindAsync(email);
        
        if (user == null)
        {
            user = new User
            {
                Email = email,
                Username = username ?? email.Split('@')[0],
                Phone = 0,
                Role = UserRole.User
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        
        return user;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FindAsync(email);
    }

    public async Task<bool> UpdateUserRoleAsync(string email, UserRole role)
    {
        var user = await _context.Users.FindAsync(email);
        if (user == null) return false;

        user.Role = role;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateUserAsync(string email, string? username = null, int? phone = null)
    {
        var user = await _context.Users.FindAsync(email);
        if (user == null) return false;

        if (username != null) user.Username = username;
        if (phone.HasValue) user.Phone = phone.Value;
        
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HasRoleAsync(string email, UserRole role)
    {
        var user = await _context.Users.FindAsync(email);
        return user?.Role == role;
    }
}
