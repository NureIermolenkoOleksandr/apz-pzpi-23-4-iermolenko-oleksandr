using System.Net.Http.Json;
using SmartLockApp.Models;

namespace SmartLockApp.Services;

public class AuthService
{
    private readonly HttpClient _httpClient;

    public AuthService()
    {
        _httpClient = new HttpClient();
        _httpClient.BaseAddress = new Uri(Constants.BaseApiUrl + "/");
    }

    public async Task<(bool IsSuccess, string ErrorMessage, User UserInfo)> LoginAsync(string email, string password)
    {
        try
        {
            var request = new LoginRequest { Email = email, Password = password };
            var response = await _httpClient.PostAsJsonAsync("auth/login", request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<LoginResponse>();

                await SecureStorage.Default.SetAsync("jwt_token", result.Token);
                await SecureStorage.Default.SetAsync("user_role", result.User.Role);

                await SecureStorage.Default.SetAsync("user_email", result.User.Email);
                await SecureStorage.Default.SetAsync("user_fullname", result.User.FullName ?? "Гість");

                return (true, null, result.User);
            }
            else
            {
               
                var errorResult = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
                string errorMsg = errorResult != null && errorResult.ContainsKey("error")
                    ? errorResult["error"]
                    : "Невірний email або пароль";

                return (false, errorMsg, null);
            }
        }
        catch (Exception ex)
        {
            return (false, $"Помилка підключення: {ex.Message}", null);
        }
    }

    public async Task<(bool IsSuccess, string ErrorMessage)> RegisterAsync(string email, string password, string fullName)
    {
        try
        {
            var request = new RegisterRequest { Email = email, Password = password, FullName = fullName };
            var response = await _httpClient.PostAsJsonAsync("auth/register", request);

            if (response.IsSuccessStatusCode)
            {
                return (true, null);
            }
            else
            {
                var errorResult = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
                string errorMsg = errorResult != null && errorResult.ContainsKey("error")
                    ? errorResult["error"]
                    : "Помилка реєстрації";

                return (false, errorMsg);
            }
        }
        catch (Exception ex)
        {
            return (false, $"Помилка підключення: {ex.Message}");
        }
    }

    public void Logout()
    {
        SecureStorage.Default.Remove("jwt_token");
        SecureStorage.Default.Remove("user_role");
    }
}