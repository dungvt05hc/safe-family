namespace SafeFamily.Api.Domain.Devices;

public enum SupportStatus
{
    Unknown = 0,
    Supported = 1,
    EndOfLife = 2,
    NoLongerReceivingUpdates = 3,
}
