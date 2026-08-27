using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using SmartLockApp.Models;
using SmartLockApp.Services;
using OtpNet;

using DeviceInfo = SmartLockApp.Models.DeviceInfo;

namespace SmartLockApp.ViewModels;

public partial class AccessKeyDisplayItem : ObservableObject
{
    public AccessKeyResponse OriginalKey { get; }

    [ObservableProperty] private string _timeRemainingText = "Безлімітний доступ";
    [ObservableProperty] private Color _timeRemainingColor = Colors.Gray;

    [ObservableProperty] private bool _isPinVisible;
    [ObservableProperty] private string _currentPin;
    [ObservableProperty] private string _pinRemainingText;
    [ObservableProperty] private double _pinProgress;

    private IDispatcherTimer _pinTimer;

    public AccessKeyDisplayItem(AccessKeyResponse key)
    {
        OriginalKey = key;
    }

    public void TogglePin()
    {
        IsPinVisible = !IsPinVisible;
        if (IsPinVisible) StartPinTimer();
        else StopPinTimer();
    }

    private void StartPinTimer()
    {
        UpdatePin();
        _pinTimer = Application.Current.Dispatcher.CreateTimer();
        _pinTimer.Interval = TimeSpan.FromSeconds(1);
        _pinTimer.Tick += (s, e) => UpdatePin();
        _pinTimer.Start();
    }

    private void StopPinTimer()
    {
        _pinTimer?.Stop();
    }

    private void UpdatePin()
    {
        try
        {
            string secret = OriginalKey?.Device?.TotpSecret ?? "KVKFKRCPNZQUYMLX";
            var base32Bytes = Base32Encoding.ToBytes(secret);
            var totp = new Totp(base32Bytes, step: 30);

            CurrentPin = totp.ComputeTotp();
            int remaining = totp.RemainingSeconds();

            PinRemainingText = $"Оновлення через {remaining} сек";
            PinProgress = remaining / 30.0; 
        }
        catch
        {
            CurrentPin = "ПОМИЛКА";
            PinRemainingText = "Неможливо згенерувати код";
        }
    }
}

public class AccessGroup : List<AccessKeyDisplayItem>
{
    public string GroupName { get; set; }
    public AccessGroup(string name, IEnumerable<AccessKeyDisplayItem> items) : base(items)
    {
        GroupName = name;
    }
}

public partial class MainViewModel : ObservableObject
{
    private readonly DeviceService _deviceService;
    private List<AccessKeyDisplayItem> _allItems = new();

    [ObservableProperty] private bool _isRefreshing;
    [ObservableProperty] private string _searchQuery;

    public ObservableCollection<AccessGroup> GroupedAccesses { get; } = new();

    public MainViewModel(DeviceService deviceService)
    {
        _deviceService = deviceService;
        LoadAccessesAsync();
    }

    partial void OnSearchQueryChanged(string value)
    {
        FilterData();
    }

    [RelayCommand]
    private async Task LoadAccessesAsync()
    {
        IsRefreshing = true;
        var keys = await _deviceService.GetMyKeysAsync();

        _allItems.Clear();
        foreach (var key in keys)
        {
            _allItems.Add(new AccessKeyDisplayItem(key));
        }

        FilterData();
        IsRefreshing = false;
    }

    private void FilterData()
    {
        GroupedAccesses.Clear();
        var query = SearchQuery?.ToLower() ?? "";

        var filtered = _allItems.Where(k =>
            k.OriginalKey.Device?.Name?.ToLower().Contains(query) == true ||
            k.OriginalKey.Device?.Room?.Name?.ToLower().Contains(query) == true
        );

        var groups = filtered
            .GroupBy(k =>
            {
                var bName = k.OriginalKey.Device?.Room?.Building?.Name ?? "Невідома будівля";
                var rName = k.OriginalKey.Device?.Room?.Name ?? "Невідома кімната";
                return $"{bName} • {rName}";
            })
            .Select(g => new AccessGroup(g.Key, g));

        foreach (var group in groups) GroupedAccesses.Add(group);
    }

    [RelayCommand]
    private async Task RemoteOpenAsync(AccessKeyDisplayItem item)
    {
        if (item?.OriginalKey?.Device == null) return;
        bool success = await _deviceService.RemoteOpenAsync(item.OriginalKey.Device.Id);
        if (success)
            await Shell.Current.DisplayAlert("Успіх", $"Відкриваємо {item.OriginalKey.Device.Name}!", "OK");
        else
            await Shell.Current.DisplayAlert("Помилка", "Не вдалося відкрити.", "OK");
    }

    [RelayCommand]
    private void TogglePin(AccessKeyDisplayItem item)
    {
        item?.TogglePin();
    }
}