using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.VisualBasic;

namespace server.Model;

public class User
{



    public Guid Id { get; set; } = Guid.NewGuid(); 
    [Required]
    public int Phone { get; set; }
    [Required]
    public string Username { get; set; } = String.Empty;
    [Required]
    public UserRole Role { get; set; }
}
