using System;
using System.Collections.Generic;
using System.Text;

namespace SmartLockApp;

public static class Constants
{
    public static string BaseApiUrl = DeviceInfo.Platform == DevicePlatform.Android
        ? "http://10.0.2.2:3000/api"
        : "http://localhost:3000/api";
}