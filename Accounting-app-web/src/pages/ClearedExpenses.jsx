import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExpenses } from "../services/api";

function ClearedExpenses() {
    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const currentMonth = (() => {
        const today = new Date();
        return `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}`;
    })();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        loadExpenses();
    }, [navigate]);

    const loadExpenses = async () => {
        try {
            const data = await getExpenses();
            setExpenses(data);
        } catch (error) {
            console.error(
                "Failed to load cleared expenses:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const getExpenseMonth = (expense) => {
        if (!expense.date) {
            return null;
        }

        const expenseDate = new Date(expense.date);
        if (Number.isNaN(expenseDate.getTime())) {
            return null;
        }

        return `${expenseDate.getFullYear()}-${String(
            expenseDate.getMonth() + 1
        ).padStart(2, "0")}`;
    };

    const allClearedExpenses = expenses.filter(
        (expense) =>
            expense.status?.trim().toLowerCase() === "cleared"
    );

    const months = [...new Set([
        currentMonth,
        ...allClearedExpenses
            .map(getExpenseMonth)
            .filter(Boolean)
    ])]
        .sort((first, second) => second.localeCompare(first))
        .map((value) => ({
            value,
            label: new Date(`${value}-01T00:00:00`).toLocaleDateString(
                "en-IN",
                { month: "long", year: "numeric" }
            )
        }));

    // Filter cleared expenses by selected month.
    const clearedExpenses = allClearedExpenses.filter(
        (expense) => getExpenseMonth(expense) === selectedMonth
    );

    // Search within selected month's cleared expenses
    const filteredExpenses = clearedExpenses.filter(
        (expense) => {
            const searchText =
                search.toLowerCase().trim();

            if (!searchText) {
                return true;
            }

            return (
                expense.purpose
                    ?.toLowerCase()
                    .includes(searchText) ||

                expense.comments
                    ?.toLowerCase()
                    .includes(searchText) ||

                expense.type
                    ?.toLowerCase()
                    .includes(searchText) ||

                expense.billType
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }
    );

    const totalClearedAmount =
        filteredExpenses.reduce(
            (total, expense) =>
                total +
                Number(expense.amount || 0),
            0
        );

    const selectedMonthLabel =
        months.find(
            (month) =>
                month.value === selectedMonth
        )?.label || selectedMonth;

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    return (
        <div className="dashboard">

            <header className="navbar">

                <h2>Accounting App</h2>

                <div className="user-section">

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate("/expenses")
                        }
                    >
                        Expenses
                    </button>

                    <button onClick={logout}>
                        Logout
                    </button>

                </div>

            </header>


            <main className="dashboard-content">

                <div className="section-header">

                    <div>
                        <h1>Cleared Expenses</h1>

                        <p>
                            View cleared expenses month-wise
                        </p>
                    </div>

                </div>


                {/* Month selector */}

                <div
                    className="expense-section"
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <label
                        style={{
                            display: "block",
                            fontWeight: "600",
                            marginBottom: "8px"
                        }}
                    >
                        Select Month
                    </label>

                    <select
                        value={selectedMonth}
                        onChange={(e) =>
                            setSelectedMonth(
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            maxWidth: "350px",
                            padding: "12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "7px",
                            fontSize: "15px"
                        }}
                    >

                        {months.map((month) => (
                            <option
                                key={month.value}
                                value={month.value}
                            >
                                {month.label}
                            </option>
                        ))}

                    </select>

                </div>


                {/* Summary */}

                <div className="summary-grid">

                    <div className="summary-card">

                        <h3>
                            {selectedMonthLabel}
                        </h3>

                        <p>
                            {filteredExpenses.length}
                        </p>

                        <small>
                            Cleared Expenses
                        </small>

                    </div>


                    <div className="summary-card">

                        <h3>
                            Total Cleared
                        </h3>

                        <p>
                            ₹
                            {totalClearedAmount.toLocaleString(
                                "en-IN"
                            )}
                        </p>

                    </div>

                </div>


                {/* Table */}

                <div className="expense-section">

                    <div className="section-header">

                        <div>
                            <h2>
                                {selectedMonthLabel}
                            </h2>

                            <p>
                                Cleared status expenses
                            </p>
                        </div>

                    </div>


                    <input
                        type="text"
                        placeholder="Search purpose, bill type, comments, type..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "15px",
                            marginBottom: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "7px",
                            fontSize: "15px"
                        }}
                    />


                    {loading ? (

                        <p>
                            Loading cleared expenses...
                        </p>

                    ) : filteredExpenses.length === 0 ? (

                        <div className="empty-state">

                            <h3>
                                No cleared expenses
                            </h3>

                            <p>
                                There are no cleared
                                expenses for{" "}
                                {selectedMonthLabel}.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={{
                                overflowX: "auto"
                            }}
                        >

                            <table>

                                <thead>

                                    <tr>
                                        <th>Date</th>
                                        <th>Submission Date</th>
                                        <th>Purpose</th>
                                        <th>Amount</th>
                                        <th>Bill Type</th>
                                        <th>Status</th>
                                        <th>Type</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredExpenses.map(
                                        (expense) => (

                                            <tr
                                                key={
                                                    expense.id
                                                }
                                            >

                                                <td>
                                                    {expense.date
                                                        ? new Date(
                                                            expense.date
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "-"
                                                    }
                                                </td>


                                                <td>
                                                    {expense.submissionDate
                                                        ? new Date(
                                                            expense.submissionDate
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        expense.purpose
                                                    }
                                                </td>


                                                <td>
                                                    ₹
                                                    {Number(
                                                        expense.amount ||
                                                        0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>


                                                <td>{expense.billType || "-"}</td>


                                                <td>
                                                    <span
                                                        style={{
                                                            background:
                                                                "#dcfce7",
                                                            color:
                                                                "#166534",
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "20px",
                                                            fontSize:
                                                                "13px",
                                                            fontWeight:
                                                                "600"
                                                        }}
                                                    >
                                                        Cleared
                                                    </span>
                                                </td>


                                                <td>
                                                    {
                                                        expense.type
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default ClearedExpenses;