namespace Accounting_App.Api.Models
{
    public class Expense
    {
        public int Id { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        public DateTime? SubmissionDate { get; set; }

        public string Purpose { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string BillType { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string? Comments { get; set; }

        public int UserId { get; set; }

        public User? User { get; set; }
    }
}