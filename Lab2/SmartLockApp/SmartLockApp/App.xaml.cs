using Microsoft.Extensions.DependencyInjection;

namespace SmartLockApp;

public partial class App : Application
{
    public App()
    {
        InitializeComponent();

        MainPage = new AppShell();
    }
}