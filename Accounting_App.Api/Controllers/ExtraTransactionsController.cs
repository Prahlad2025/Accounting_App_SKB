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
    public class ExtraTransactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExtraTransactionsController(
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

        // GET: api/ExtraTransactions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExtraTransaction>>> GetExtras()
        {
            var userId = GetUserId();

            var extras = await _context.ExtraTransactions
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.Date)
                .ToListAsync();

            return Ok(extras);
        }

        // GET: api/ExtraTransactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ExtraTransaction>> GetExtra(int id)
        {
            var userId = GetUserId();

            var extra = await _context.ExtraTransactions
                .FirstOrDefaultAsync(
                    x => x.Id == id &&
                         x.UserId == userId
                );

            if (extra == null)
                return NotFound();

            return Ok(extra);
        }

        // POST: api/ExtraTransactions
        [HttpPost]
        public async Task<ActionResult<ExtraTransaction>> CreateExtra(
            ExtraTransaction extra)
        {
            var userId = GetUserId();

            extra.Date = DateTime.SpecifyKind(
                extra.Date,
                DateTimeKind.Utc
            );

            extra.UserId = userId;
            extra.User = null;

            _context.ExtraTransactions.Add(extra);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetExtra),
                new { id = extra.Id },
                extra
            );
        }

        // PUT: api/ExtraTransactions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExtra(
            int id,
            ExtraTransaction updatedExtra)
        {
            var userId = GetUserId();

            if (id != updatedExtra.Id)
                return BadRequest("ID mismatch.");

            var extra = await _context.ExtraTransactions
                .FirstOrDefaultAsync(
                    x => x.Id == id &&
                         x.UserId == userId
                );

            if (extra == null)
                return NotFound();

            updatedExtra.Date = DateTime.SpecifyKind(
                updatedExtra.Date,
                DateTimeKind.Utc
            );

            extra.Date = updatedExtra.Date;
            extra.Purpose = updatedExtra.Purpose;
            extra.Amount = updatedExtra.Amount;
            extra.Comments = updatedExtra.Comments;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ExtraTransactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExtra(int id)
        {
            var userId = GetUserId();

            var extra = await _context.ExtraTransactions
                .FirstOrDefaultAsync(
                    x => x.Id == id &&
                         x.UserId == userId
                );

            if (extra == null)
                return NotFound();

            _context.ExtraTransactions.Remove(extra);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}