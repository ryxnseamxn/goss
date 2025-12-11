using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace server.Model;

public class User
{
    [Key]
    [Required]
    public required string Email { get; set; }
    [Required]
    public int Phone { get; set; }
    [Required]
    public string Username { get; set; } = String.Empty;
    [Required]
    public UserRole Role { get; set; }
}
