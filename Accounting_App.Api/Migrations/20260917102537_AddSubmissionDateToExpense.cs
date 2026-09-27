using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Accounting_App.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmissionDateToExpense : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "SubmissionDate",
                table: "Expenses",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmissionDate",
                table: "Expenses");
        }
    }
}
