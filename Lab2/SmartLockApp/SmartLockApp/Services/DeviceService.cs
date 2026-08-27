using System.Net.Http.Headers;
using System.Net.Http.Json;
using SmartLockApp.Models;

namespace SmartLockApp.Services;

public class DeviceService
{
    private readonly HttpClient _httpClient;

    public DeviceService()
    {
        _httpClient = new HttpClient();
        _httpClient.BaseAddress = new Uri(Constants.BaseApiUrl + "/");
    }

    private async Task SetAuthHeader()
    {
        var token = await SecureStorage.Default.GetAsync("jwt_token");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<List<AccessKeyResponse>> GetMyKeysAsync()
    {
        try
        {
            await SetAuthHeader();
            var response = await _httpClient.GetAsync("access-keys/my");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<List<AccessKeyResponse>>();
            }
        }
        catch { }
        return new List<AccessKeyResponse>();
    }

    public async Task<bool> RemoteOpenAsync(string deviceId)
    {
        try
        {
            await SetAuthHeader();
            var response = await _httpClient.PostAsync($"devices/{deviceId}/open", null);
            return response.IsSuccessStatusCode;
        }
        catch { return false; }
    }
}