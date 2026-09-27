using System.Security.Claims;
using Accounting_App.Api.Data;
using Accounting_App.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Accounting_App.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExpensesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get logged-in user's ID from JWT
        private int GetUserId()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException();

            return int.Parse(userId);
        }


        // =========================
        // GET ALL EXPENSES
        // =========================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
        {
            var userId = GetUserId();

            var expenses = await _context.Expenses
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            return Ok(expenses);
        }


        // =========================
        // GET EXPENSE BY ID
        // =========================

        [HttpGet("{id}")]
        public async Task<ActionResult<Expense>> GetExpense(int id)
        {
            var userId = GetUserId();

            var expense = await _context.Expenses
                .FirstOrDefaultAsync(
                    e => e.Id == id && e.UserId == userId
                );

            if (expense == null)
                return NotFound();

            return Ok(expense);
        }


        // =========================
        // CREATE EXPENSE
        // =========================

        [HttpPost]
        public async Task<ActionResult<Expense>> CreateExpense(
            Expense expense)
        {
            var userId = GetUserId();

            if (expense.Amount <= 0)
                return BadRequest(
                    "Amount must be greater than zero."
                );

            expense.Date = DateTime.SpecifyKind(
                expense.Date,
                DateTimeKind.Utc
            );

            // IMPORTANT:
            // Never accept UserId from the client.
            // Always use the logged-in user's ID.
            expense.UserId = userId;

            // Don't allow client to assign another user
            expense.User = null;

            _context.Expenses.Add(expense);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetExpense),
                new { id = expense.Id },
                expense
            );
        }


        // =========================
        // UPDATE EXPENSE
        // =========================

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(
            int id,
            Expense updatedExpense)
        {
            var userId = GetUserId();

            if (id != updatedExpense.Id)
                return BadRequest("ID mismatch.");

            var expense = await _context.Expenses
                .FirstOrDefaultAsync(
                    e => e.Id == id && e.UserId == userId
                );

            if (expense == null)
                return NotFound();

            updatedExpense.Date = DateTime.SpecifyKind(
                updatedExpense.Date,
                DateTimeKind.Utc
            );

            expense.Date = updatedExpense.Date;
            expense.SubmissionDate = updatedExpense.SubmissionDate;
            expense.Purpose = updatedExpense.Purpose;
            expense.Amount = updatedExpense.Amount;
            expense.BillType = updatedExpense.BillType;
            expense.Status = updatedExpense.Status;
            expense.Type = updatedExpense.Type;
            expense.Comments = updatedExpense.Comments;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        // =========================
        // DELETE EXPENSE
        // =========================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var userId = GetUserId();

            var expense = await _context.Expenses
                .FirstOrDefaultAsync(
                    e => e.Id == id && e.UserId == userId
                );

            if (expense == null)
                return NotFound();

            _context.Expenses.Remove(expense);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}