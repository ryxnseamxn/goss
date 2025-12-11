using Microsoft.AspNetCore.Mvc;
using server.Services;
using server.Model;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost("sync")]
    public async Task<ActionResult<User>> SyncUser([FromBody] SyncUserRequest request)
    {
        var user = await _userService.GetOrCreateUserAsync(request.Email, request.Username);
        return Ok(user);
    }

    [HttpGet("{email}")]
    public async Task<ActionResult<User>> GetUser(string email)
    {
        var user = await _userService.GetUserByEmailAsync(email);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPatch("{email}")]
    public async Task<ActionResult> UpdateUser(string email, [FromBody] UpdateUserRequest request)
    {
        var success = await _userService.UpdateUserAsync(email, request.Username, request.Phone);
        if (!success) return NotFound();
        return NoContent();
    }
}

public record SyncUserRequest(string Email, string? Username = null);
public record UpdateUserRequest(string? Username = null, int? Phone = null);
