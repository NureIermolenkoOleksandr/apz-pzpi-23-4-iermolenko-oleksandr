using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using SmartLockApp.Services;

namespace SmartLockApp.ViewModels;

public partial class LoginViewModel : ObservableObject
{
    private readonly AuthService _authService;

    [ObservableProperty]
    private string _email;

    [ObservableProperty]
    private string _password;

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(IsNotBusy))] 
    private bool _isBusy;

    public bool IsNotBusy => !IsBusy; 

    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(HasError))]
    private string _errorMessage;

    public bool HasError => !string.IsNullOrEmpty(ErrorMessage); 

    public LoginViewModel(AuthService authService)
    {
        _authService = authService;
    }

    [RelayCommand]
    private async Task LoginAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Будь ласка, введіть email та пароль.";
            return;
        }

        IsBusy = true;
        ErrorMessage = string.Empty;

        var (isSuccess, error, user) = await _authService.LoginAsync(Email, Password);

        IsBusy = false;

        if (isSuccess)
        {
          
            await Shell.Current.GoToAsync("//MainPage");
        }
        else
        {
            ErrorMessage = error;
        }
    }

    [RelayCommand]
    private async Task GoToRegisterAsync()
    {
        await Shell.Current.GoToAsync(nameof(Views.RegisterPage));
    }
}