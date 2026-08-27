using System.Text.Json.Serialization;

namespace SmartLockApp.Models;

public class AccessKeyResponse
{
    [JsonPropertyName("id")] public string Id { get; set; }
    [JsonPropertyName("validFrom")] public DateTime ValidFrom { get; set; }
    [JsonPropertyName("validTo")] public DateTime? ValidTo { get; set; }

    [JsonPropertyName("device")] public DeviceInfo Device { get; set; }
}

public class BuildingInfo
{
    [JsonPropertyName("name")] public string Name { get; set; }
}

public class RoomInfo
{
    [JsonPropertyName("name")] public string Name { get; set; }
    [JsonPropertyName("building")] public BuildingInfo Building { get; set; }
}

public class DeviceInfo
{
    [JsonPropertyName("id")] public string Id { get; set; }
    [JsonPropertyName("name")] public string Name { get; set; }
    [JsonPropertyName("serialNumber")] public string SerialNumber { get; set; }
    [JsonPropertyName("status")] public string Status { get; set; }

    [JsonPropertyName("room")] public RoomInfo Room { get; set; }

    [JsonPropertyName("totpSecret")]
    public string TotpSecret { get; set; }
}