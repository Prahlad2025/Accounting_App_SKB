import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getExpenses,
    deleteExpense
} from "../services/api";

function Expenses() {

    const navigate = useNavigate();

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [billTypeFilter, setBillTypeFilter] = useState("");
    const [error, setError] = useState("");

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

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };


    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteExpense(id);

            setExpenses(
                expenses.filter(
                    expense => expense.id !== id
                )
            );

        } catch (err) {

            setError(err.message);

        }
    };


    const activeExpenses = expenses.filter(
        (expense) =>
            expense.status?.trim().toLowerCase() !== "cleared"
    );

    const billTypes = [...new Set(
        activeExpenses
            .map((expense) => expense.billType?.trim())
            .filter(Boolean)
    )].sort((first, second) => first.localeCompare(second));

    const filteredExpenses = activeExpenses.filter(
        (expense) => {

            const searchText = search.toLowerCase().trim();

            return (
                (!billTypeFilter || expense.billType?.trim() === billTypeFilter) &&
                (
                expense.purpose
                    ?.toLowerCase()
                    .includes(searchText) ||

                expense.type
                    ?.toLowerCase()
                    .includes(searchText) ||

                expense.status
                    ?.toLowerCase()
                    .includes(searchText) ||

                expense.billType
                    ?.toLowerCase()
                    .includes(searchText)
                )
            );
        }
    );

    const totalFilteredAmount = filteredExpenses.reduce(
        (total, expense) => total + Number(expense.amount || 0),
        0
    );


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
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            navigate("/");
                        }}
                    >
                        Logout
                    </button>

                </div>

            </header>


            <main className="dashboard-content">

                <div className="section-header">

                    <div>

                        <h1>Expenses</h1>

                        <p>
                            Manage your expense records
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            navigate("/expenses/add")
                        }
                    >
                        + Add Expense
                    </button>

                </div>


                <div className="expense-section">

                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "20px",
                            border: "1px solid #ddd",
                            borderRadius: "7px"
                        }}
                    />

                    <label htmlFor="billTypeFilter">
                        Filter by Bill Type
                    </label>
                    <select
                        id="billTypeFilter"
                        value={billTypeFilter}
                        onChange={(e) => setBillTypeFilter(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "7px"
                        }}
                    >
                        <option value="">All Bill Types</option>
                        {billTypes.map((billType) => (
                            <option key={billType} value={billType}>
                                {billType}
                            </option>
                        ))}
                    </select>


                    {error && (
                        <div className="error">
                            {error}
                        </div>
                    )}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "16px",
                            padding: "18px 20px",
                            marginBottom: "20px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "10px"
                        }}
                    >
                        <span>Total Filtered Expenses</span>
                        <strong>
                            ₹
                            {totalFilteredAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </strong>
                    </div>


                    {loading ? (

                        <p>
                            Loading expenses...
                        </p>

                    ) : filteredExpenses.length === 0 ? (

                        <div className="empty-state">

                            <h3>
                                No expenses found
                            </h3>

                            <p>
                                Add an expense to get started.
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
                                        <th>Comments</th>
                                        <th>Actions</th>

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
                                                        expense.amount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>


                                                <td>
                                                    {
                                                        expense.billType
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        expense.status
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        expense.type
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        expense.comments ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "8px"
                                                        }}
                                                    >

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/expenses/edit/${expense.id}`
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    expense.id
                                                                )
                                                            }
                                                            style={{
                                                                background:
                                                                    "#dc2626",
                                                                color:
                                                                    "white"
                                                            }}
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

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

export default Expenses;