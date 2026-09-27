namespace Accounting_App.Api.Models
{
    public class ExtraTransaction
    {
        public int Id { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        public string Purpose { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string? Comments { get; set; }

        public int UserId { get; set; }

        public User? User { get; set; }
    }
}