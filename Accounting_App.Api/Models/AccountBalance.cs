namespace Accounting_App.Api.Models
{
    public class AccountBalance
    {
        public int Id { get; set; }

        public decimal Advance { get; set; }

        public decimal Cash { get; set; }

        public decimal HDFC { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }

        public User? User { get; set; }
    }
}