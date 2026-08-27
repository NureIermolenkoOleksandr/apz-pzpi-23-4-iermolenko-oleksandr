using SmartLockApp.ViewModels;

namespace SmartLockApp.Views;

public partial class MainPage : ContentPage
{
    public MainPage(MainViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();

        if (BindingContext is MainViewModel vm)
        {
            vm.LoadAccessesCommand.Execute(null);
        }
    }
}