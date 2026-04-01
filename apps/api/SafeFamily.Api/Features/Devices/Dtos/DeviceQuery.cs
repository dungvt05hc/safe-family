using SafeFamily.Api.Domain.Devices;

namespace SafeFamily.Api.Features.Devices.Dtos;

public class DeviceQuery
{
    public Guid? MemberId { get; set; }
    public string? DeviceTypeCode { get; set; }
    public SupportStatus? SupportStatus { get; set; }
    public string? Search { get; set; }
}
