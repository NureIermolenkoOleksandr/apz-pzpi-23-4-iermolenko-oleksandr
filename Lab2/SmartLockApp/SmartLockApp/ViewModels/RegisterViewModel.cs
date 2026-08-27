using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using SmartLockApp.Services;

namespace SmartLockApp.ViewModels;

public partial class RegisterViewModel : ObservableObject
{
    private readonly AuthService _authService;

    [ObservableProperty] private string _fullName;
    [ObservableProperty] private string _email;
    [ObservableProperty] private string _password;
    [ObservableProperty] private string _confirmPassword;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsNotBusy))]
    private bool _isBusy;
    public bool IsNotBusy => !IsBusy;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string _errorMessage;
    public bool HasError => !string.IsNullOrEmpty(ErrorMessage);

    public RegisterViewModel(AuthService authService)
    {
        _authService = authService;
    }

    [RelayCommand]
    private async Task RegisterAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password) || string.IsNullOrWhiteSpace(FullName))
        {
            ErrorMessage = "Будь ласка, заповніть всі поля.";
            return;
        }

        if (Password != ConfirmPassword)
        {
            ErrorMessage = "Паролі не співпадають.";
            return;
        }

        IsBusy = true;
        ErrorMessage = string.Empty;

        var (isSuccess, error) = await _authService.RegisterAsync(Email, Password, FullName);

        IsBusy = false;

        if (isSuccess)
        {
            await Shell.Current.DisplayAlert("Успіх", "Реєстрація успішна! Тепер ви можете увійти.", "OK");
            await Shell.Current.GoToAsync(".."); 
        }
        else
        {
            ErrorMessage = error;
        }
    }

    [RelayCommand]
    private async Task GoToLoginAsync()
    {
        await Shell.Current.GoToAsync("..");
    }
}