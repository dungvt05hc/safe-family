namespace SafeFamily.Api.Features.Devices.Dtos;

public record DeviceSummaryResponse(
    int Total,
    int WithoutScreenLock,
    int WithoutBackup,
    int WithoutBiometric,
    int EndOfLife,
    int WithoutFindMyDevice);
