using System.Security.Claims;
using Accounting_App.Api.Data;
using Accounting_App.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Accounting_App.Api.Controllers
{
    [ApiController]
    [Route("api/account-balance")]
    [Authorize]
    public class AccountBalanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountBalanceController(
            ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException();

            return int.Parse(userId);
        }

        // GET: api/account-balance
        [HttpGet]
        public async Task<IActionResult> GetBalance()
        {
            var userId = GetUserId();

            var balance = await _context.AccountBalances
                .FirstOrDefaultAsync(
                    x => x.UserId == userId
                );

            // Create the initial balance record
            // if the user does not have one yet.
            if (balance == null)
            {
                balance = new AccountBalance
                {
                    UserId = userId,
                    Advance = 0,
                    Cash = 0,
                    HDFC = 0,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.AccountBalances.Add(balance);

                await _context.SaveChangesAsync();
            }

            return Ok(balance);
        }

        // PUT: api/account-balance
        [HttpPut]
        public async Task<IActionResult> UpdateBalance(
            AccountBalance updatedBalance)
        {
            var userId = GetUserId();

            var balance =
                await _context.AccountBalances
                    .FirstOrDefaultAsync(
                        x => x.UserId == userId
                    );

            // Create record if it doesn't exist.
            if (balance == null)
            {
                balance = new AccountBalance
                {
                    UserId = userId
                };

                _context.AccountBalances.Add(balance);
            }

            balance.Advance = updatedBalance.Advance;
            balance.Cash = updatedBalance.Cash;
            balance.HDFC = updatedBalance.HDFC;
            balance.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(balance);
        }
    }
}