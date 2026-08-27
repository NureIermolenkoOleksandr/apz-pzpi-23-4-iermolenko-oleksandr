using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Data;

namespace SmartLockApp.ViewModels;

public partial class ProfileViewModel : ObservableObject
{
    [ObservableProperty] private string _fullName;
    [ObservableProperty] private string _email;
    [ObservableProperty] private string _role;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsNotEditing))]
    private bool _isEditing;

    public bool IsNotEditing => !IsEditing;

    public ProfileViewModel()
    {
        LoadProfileData();
    }

    private async void LoadProfileData()
    {
        Email = await SecureStorage.Default.GetAsync("user_email") ?? "Невідомо";
        FullName = await SecureStorage.Default.GetAsync("user_fullname") ?? "Гість";
        Role = await SecureStorage.Default.GetAsync("user_role") ?? "TENANT";
    }

    [RelayCommand]
    private void EditProfile() => IsEditing = true;

    [RelayCommand]
    private async Task SaveProfileAsync()
    {
        await SecureStorage.Default.SetAsync("user_fullname", FullName);
        IsEditing = false;
        await Shell.Current.DisplayAlert("Успіх", "Профіль успішно оновлено.", "OK");
    }

    [RelayCommand]
    private async Task LogoutAsync()
    {
        SecureStorage.Default.Remove("jwt_token");
        SecureStorage.Default.Remove("user_role");
        SecureStorage.Default.Remove("user_email");
        SecureStorage.Default.Remove("user_fullname");

        await Shell.Current.GoToAsync("//LoginPage");
    }
}