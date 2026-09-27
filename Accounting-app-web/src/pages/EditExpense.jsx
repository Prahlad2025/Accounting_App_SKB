
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getExpenses,
    updateExpense
} from "../services/api";

function getEditableStatus(status) {
    switch (status?.trim().toLowerCase()) {
        case "submitted":
            return "Submitted";
        case "to submit":
            return "To Submit";
        case "cleared":
            return "Cleared";
        default:
            return "To Submit";
    }
}

function EditExpense() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        date: "",
        submissionDate: "",
        purpose: "",
        amount: "",
        billType: "",
        status: "To Submit",
        type: "",
        comments: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Load the existing expense
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        const loadExpense = async () => {
            try {
                const expenses = await getExpenses();

                const expense = expenses.find(
                    (item) => item.id === Number(id)
                );

                if (!expense) {
                    setError("Expense not found.");
                    return;
                }

                setForm({
                    date: expense.date
                        ? expense.date.substring(0, 10)
                        : "",

                    submissionDate: expense.submissionDate
                        ? expense.submissionDate.substring(0, 10)
                        : "",

                    purpose: expense.purpose || "",
                    amount: expense.amount ?? "",
                    billType: expense.billType || "",
                    status: getEditableStatus(expense.status),
                    type: expense.type || "",
                    comments: expense.comments || ""
                });

            } catch (err) {
                console.error("Error loading expense:", err);
                setError(
                    err.message || "Failed to load expense."
                );
            } finally {
                setLoading(false);
            }
        };

        loadExpense();
    }, [id, navigate]);

    // Handle all input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: value
        }));
    };

    // Update expense
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!form.purpose.trim()) {
            setError("Please enter the purpose.");
            return;
        }

        if (!form.billType.trim()) {
            setError("Please enter the bill type.");
            return;
        }

        if (!form.type) {
            setError("Please select the expense type.");
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            setError("Amount must be greater than zero.");
            return;
        }

        setSaving(true);

        try {
            await updateExpense(id, {
                date: new Date(
                    `${form.date}T00:00:00Z`
                ).toISOString(),

                submissionDate: form.submissionDate
                    ? new Date(
                        `${form.submissionDate}T00:00:00Z`
                    ).toISOString()
                    : null,

                purpose: form.purpose.trim(),

                amount: Number(form.amount),

                // Free-text Bill Type
                billType: form.billType.trim(),

                status: form.status,

                type: form.type,

                comments: form.comments.trim() || null
            });

            // Return to Expenses after successful update
            navigate("/expenses");

        } catch (err) {
            console.error("Error updating expense:", err);

            setError(
                err.message || "Failed to update expense."
            );
        } finally {
            setSaving(false);
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    // Loading state
    if (loading) {
        return (
            <div className="dashboard">
                <header className="navbar">
                    <h2>Accounting App</h2>
                </header>

                <main className="dashboard-content">
                    <p>Loading expense...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard">

            {/* Navbar */}
            <header className="navbar">

                <h2>Accounting App</h2>

                <div className="user-section">

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/expenses")}
                    >
                        Expenses
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* Main Content */}
            <main className="dashboard-content">

                <div className="section-header">
                    <div>
                        <h1>Edit Expense</h1>

                        <p>
                            Update your accounting record
                        </p>
                    </div>
                </div>

                <div className="expense-section">

                    {error && (
                        <div
                            className="error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="expense-form"
                    >

                        {/* Date */}
                        <label htmlFor="date">
                            Date
                        </label>

                        <input
                            id="date"
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                        />

                        {/* Submission Date */}
                        <label htmlFor="submissionDate">
                            Submission Date
                        </label>

                        <input
                            id="submissionDate"
                            type="date"
                            name="submissionDate"
                            value={form.submissionDate}
                            onChange={handleChange}
                        />

                        {/* Purpose */}
                        <label htmlFor="purpose">
                            Purpose
                        </label>

                        <input
                            id="purpose"
                            type="text"
                            name="purpose"
                            placeholder="Enter purpose"
                            value={form.purpose}
                            onChange={handleChange}
                            required
                        />

                        {/* Amount */}
                        <label htmlFor="amount">
                            Amount (₹)
                        </label>

                        <input
                            id="amount"
                            type="number"
                            name="amount"
                            placeholder="Enter amount"
                            value={form.amount}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                        />

                        {/* Bill Type - Free Text */}
                        <label htmlFor="billType">
                            Bill Type
                        </label>

                        <input
                            id="billType"
                            type="text"
                            name="billType"
                            placeholder="Enter bill type"
                            value={form.billType}
                            onChange={handleChange}
                            required
                        />

                        {/* Status */}
                        <label htmlFor="status">
                            Status
                        </label>

                        <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="To Submit">
                                To Submit
                            </option>

                            <option value="Submitted">
                                Submitted
                            </option>

                            <option value="Cleared">
                                Cleared
                            </option>
                        </select>

                        {/* Type */}
                        <label htmlFor="type">
                            Type
                        </label>

                        <select
                            id="type"
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select Type
                            </option>

                            <option value="Service">
                                Service
                            </option>

                            <option value="Personal">
                                Personal
                            </option>
                        </select>

                        {/* Comments */}
                        <label htmlFor="comments">
                            Comments
                        </label>

                        <textarea
                            id="comments"
                            name="comments"
                            placeholder="Optional comments"
                            value={form.comments}
                            onChange={handleChange}
                            rows="4"
                        />

                        {/* Buttons */}
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "15px"
                            }}
                        >

                            <button
                                type="submit"
                                disabled={saving}
                            >
                                {saving
                                    ? "Updating..."
                                    : "Update Expense"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/expenses")
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default EditExpense;