using Microsoft.Extensions.Logging;
using SmartLockApp.Services;
using SmartLockApp.ViewModels;
using SmartLockApp.Views;

namespace SmartLockApp;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

        builder.Services.AddSingleton<AuthService>();
        builder.Services.AddSingleton<DeviceService>();

        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<RegisterViewModel>();
        builder.Services.AddTransient<MainViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();

        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<RegisterPage>();
        builder.Services.AddTransient<MainPage>();
        builder.Services.AddTransient<ProfilePage>(); 

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}