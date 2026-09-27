import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getExtras,
    createExtra,
    updateExtra,
    deleteExtra,
} from "../services/api";

function Extras() {
    const navigate = useNavigate();
    const [extras, setExtras] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        date: new Date().toISOString().split("T")[0],
        purpose: "",
        amount: "",
        comments: "",
    });

    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    async function loadExtras() {
        try {
            setLoading(true);
            const data = await getExtras();
            setExtras(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadExtras();
    }, []);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!form.purpose.trim()) {
            setError("Purpose is required.");
            return;
        }

        if (form.amount === "") {
            setError("Amount is required.");
            return;
        }

        const data = {
            date: new Date(form.date).toISOString(),
            purpose: form.purpose,
            amount: Number(form.amount),
            comments: form.comments,
        };

        try {
            if (editingId) {
                await updateExtra(editingId, data);
            } else {
                await createExtra(data);
            }

            resetForm();
            await loadExtras();
        } catch (err) {
            setError(err.message);
        }
    }

    function startEdit(extra) {
        setEditingId(extra.id);

        setForm({
            date: extra.date
                ? new Date(extra.date)
                      .toISOString()
                      .split("T")[0]
                : "",
            purpose: extra.purpose || "",
            amount: extra.amount ?? "",
            comments: extra.comments || "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this extra transaction?"
        );

        if (!confirmed) return;

        try {
            await deleteExtra(id);
            await loadExtras();
        } catch (err) {
            setError(err.message);
        }
    }

    function resetForm() {
        setEditingId(null);

        setForm({
            date: new Date()
                .toISOString()
                .split("T")[0],
            purpose: "",
            amount: "",
            comments: "",
        });
    }

    const totalExtra = extras.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        Extra Transactions
                    </h1>

                    <p style={styles.subtitle}>
                        Manage additional accounting entries
                    </p>
                </div>

                <button
                    style={styles.dashboardButton}
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </button>
            </div>

            <div style={styles.card}>
                <h2>
                    {editingId
                        ? "Edit Extra"
                        : "Add Extra"}
                </h2>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                        <div>
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>

                        <div>
                            <label>Purpose</label>
                            <input
                                type="text"
                                name="purpose"
                                value={form.purpose}
                                onChange={handleChange}
                                placeholder="Enter purpose"
                                style={styles.input}
                            />
                        </div>

                        <div>
                            <label>Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                style={styles.input}
                            />
                        </div>

                        <div>
                            <label>Comments</label>
                            <input
                                type="text"
                                name="comments"
                                value={form.comments}
                                onChange={handleChange}
                                placeholder="Optional"
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.actions}>
                        <button
                            type="submit"
                            style={styles.primaryButton}
                        >
                            {editingId
                                ? "Update Extra"
                                : "Add Extra"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={styles.secondaryButton}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div style={styles.summaryCard}>
                <span>Total Extra</span>

                <strong>
                    ₹
                    {totalExtra.toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }
                    )}
                </strong>
            </div>

            <div style={styles.card}>
                <h2>All Extra Transactions</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : extras.length === 0 ? (
                    <p>No extra transactions found.</p>
                ) : (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Purpose</th>
                                    <th>Amount</th>
                                    <th>Comments</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {extras.map((extra) => (
                                    <tr key={extra.id}>
                                        <td>
                                            {new Date(
                                                extra.date
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}
                                        </td>

                                        <td>
                                            {extra.purpose}
                                        </td>

                                        <td>
                                            ₹
                                            {Number(
                                                extra.amount
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}
                                        </td>

                                        <td>
                                            {extra.comments ||
                                                "-"}
                                        </td>

                                        <td>
                                            <button
                                                onClick={() =>
                                                    startEdit(
                                                        extra
                                                    )
                                                }
                                                style={
                                                    styles.editButton
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        extra.id
                                                    )
                                                }
                                                style={
                                                    styles.deleteButton
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
    },

    title: {
        margin: 0,
    },

    subtitle: {
        color: "#666",
        marginTop: "6px",
    },

    card: {
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        marginBottom: "20px",
        boxShadow:
            "0 2px 10px rgba(0,0,0,0.08)",
    },

    summaryCard: {
        display: "flex",
        justifyContent: "space-between",
        padding: "22px",
        background: "#f3f7ff",
        borderRadius: "12px",
        marginBottom: "20px",
        fontSize: "20px",
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginTop: "15px",
    },

    input: {
        width: "100%",
        padding: "11px",
        marginTop: "6px",
        border: "1px solid #ddd",
        borderRadius: "7px",
        boxSizing: "border-box",
    },

    actions: {
        marginTop: "20px",
        display: "flex",
        gap: "10px",
    },

    primaryButton: {
        padding: "11px 20px",
        border: "none",
        borderRadius: "7px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
    },

    secondaryButton: {
        padding: "11px 20px",
        border: "1px solid #ccc",
        borderRadius: "7px",
        background: "white",
        cursor: "pointer",
    },

    dashboardButton: {
        padding: "10px 18px",
        border: "none",
        borderRadius: "7px",
        background: "#111827",
        color: "white",
        cursor: "pointer",
    },

    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "12px",
        borderRadius: "7px",
        marginBottom: "15px",
    },

    tableWrapper: {
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "15px",
    },

    editButton: {
        marginRight: "8px",
        padding: "7px 12px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },

    deleteButton: {
        padding: "7px 12px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        color: "white",
        background: "#dc2626",
    },
};

export default Extras;