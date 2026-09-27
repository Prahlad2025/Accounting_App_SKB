using Accounting_App.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Accounting_App.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Expense> Expenses { get; set; }

        public DbSet<ExtraTransaction> ExtraTransactions { get; set; }

        public DbSet<AccountBalance> AccountBalances { get; set; }

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User email must be unique
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // User → Expenses
            modelBuilder.Entity<User>()
                .HasMany(u => u.Expenses)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User → Extra Transactions
            modelBuilder.Entity<User>()
                .HasMany(u => u.ExtraTransactions)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User → Account Balance
            // One user has one current account balance
            modelBuilder.Entity<User>()
                .HasOne(u => u.AccountBalance)
                .WithOne(a => a.User)
                .HasForeignKey<AccountBalance>(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Ensure one AccountBalance per user
            modelBuilder.Entity<AccountBalance>()
                .HasIndex(a => a.UserId)
                .IsUnique();
        }
    }
}