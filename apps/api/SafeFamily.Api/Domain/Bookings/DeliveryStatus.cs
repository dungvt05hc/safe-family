namespace SafeFamily.Api.Domain.Bookings;

public enum DeliveryStatus
{
    Pending    = 0,  // Payment received; fulfillment not yet triggered
    Processing = 1,  // Placeholder report + checklist created; team preparing materials
    Delivered  = 2,  // Materials delivered (report FileUrl set, admin marked done)
    Failed     = 3,  // Delivery could not be completed
}
