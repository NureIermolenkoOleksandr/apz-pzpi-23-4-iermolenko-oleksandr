
using System.Text.Json.Serialization;

namespace SmartLockApp.Models;

public class LoginRequest
{
    [JsonPropertyName("email")]
    public string Email { get; set; }

    [JsonPropertyName("password")]
    public string Password { get; set; }
}

public class RegisterRequest
{
    [JsonPropertyName("email")]
    public string Email { get; set; }

    [JsonPropertyName("password")]
    public string Password { get; set; }

    [JsonPropertyName("fullName")]
    public string FullName { get; set; }
}

public class User
{
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; }

    [JsonPropertyName("role")]
    public string Role { get; set; }

    [JsonPropertyName("fullName")]
    public string FullName { get; set; }
}

public class LoginResponse
{
    [JsonPropertyName("token")]
    public string Token { get; set; }

    [JsonPropertyName("user")]
    public User User { get; set; }
}