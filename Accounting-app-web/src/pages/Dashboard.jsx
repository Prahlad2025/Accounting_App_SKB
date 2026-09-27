import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getExpenses,
    getExtras,
    getAccountBalance,
    updateAccountBalance,
} from "../services/api";

function Dashboard() {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [extras, setExtras] = useState([]);
    const [balance, setBalance] = useState({
        advance: 0,
        cash: 0,
        hdfc: 0,
    });

    const [loading, setLoading] = useState(true);
    const [editingBalance, setEditingBalance] = useState(false);
    const [savingBalance, setSavingBalance] = useState(false);
    const [error, setError] = useState("");

    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");

            const [
                expenseData,
                extraData,
                balanceData,
            ] = await Promise.all([
                getExpenses(),
                getExtras(),
                getAccountBalance(),
            ]);

            setExpenses(expenseData);
            setExtras(extraData);

            setBalance({
                advance: Number(balanceData.advance || 0),
                cash: Number(balanceData.cash || 0),
                hdfc: Number(balanceData.hdfc || 0),
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    const billsSubmitted = expenses
        .filter(
            (expense) =>
                expense.status?.trim().toLowerCase() === "submitted"
        )
        .reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );

    const billsNotSubmitted = expenses
        .filter(
            (expense) =>
                expense.status?.trim().toLowerCase() === "to submit"
        )
        .reduce(
            (sum, expense) =>
                sum + Number(expense.amount || 0),
            0
        );

    const totalBills =
        billsSubmitted + billsNotSubmitted;

    const totalExtra = extras.reduce(
        (sum, extra) =>
            sum + Number(extra.amount || 0),
        0
    );

    const totalCashBank =
        balance.cash + balance.hdfc;

    // IMPORTANT:
    // This is the accounting reconciliation formula.
    const reconciliation =
        totalExtra +
        balance.advance -
        totalBills -
        balance.cash -
        balance.hdfc;

    async function handleBalanceSave(e) {
        e.preventDefault();

        try {
            setSavingBalance(true);
            setError("");

            await updateAccountBalance({
                advance: Number(balance.advance),
                cash: Number(balance.cash),
                hdfc: Number(balance.hdfc),
            });

            setEditingBalance(false);

            await loadDashboard();
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingBalance(false);
        }
    }

    function formatCurrency(value) {
        return `₹${Number(value).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    }

    if (loading) {
        return (
            <div style={styles.loading}>
                Loading accounting summary...
            </div>
        );
    }

    return (
        <div className="dashboard-layout" style={styles.app}>
            {/* Sidebar */}
            <aside className="dashboard-sidebar" style={styles.sidebar}>
                <div>
                    <h2 style={styles.logo}>
                        Accounting App
                    </h2>

                    <p style={styles.logoSubtitle}>
                        Personal Accounts
                    </p>
                </div>

                <nav className="dashboard-nav" style={styles.nav}>
                    <button
                        style={{
                            ...styles.navButton,
                            ...styles.activeNavButton,
                        }}
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </button>

                    <button
                        style={styles.navButton}
                        onClick={() => navigate("/expenses")}
                    >
                        Expenses
                    </button>

                    <button
                        style={styles.navButton}
                        onClick={() => navigate("/cleared-expenses")}
                    >
                        Cleared Expenses
                    </button>

                    <button
                        style={styles.navButton}
                        onClick={() => navigate("/extras")}
                    >
                        Extra Transactions
                    </button>
                </nav>

                <button
                    style={styles.logoutButton}
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </aside>

            {/* Main content */}
            <main className="dashboard-main" style={styles.main}>
                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>
                            Accounting Summary
                        </h1>

                        <p style={styles.pageSubtitle}>
                            Current financial position and
                            reconciliation
                        </p>
                    </div>
                </div>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {/* Advance */}
                <section style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>
                            Advance
                        </h2>

                        <button
                            style={styles.editBalanceButton}
                            onClick={() =>
                                setEditingBalance(
                                    !editingBalance
                                )
                            }
                        >
                            {editingBalance
                                ? "Cancel"
                                : "Edit Balances"}
                        </button>
                    </div>

                    {!editingBalance ? (
                        <div style={styles.largeAmount}>
                            {formatCurrency(
                                balance.advance
                            )}
                        </div>
                    ) : (
                        <form
                            onSubmit={
                                handleBalanceSave
                            }
                            style={styles.balanceForm}
                        >
                            <div>
                                <label>
                                    Advance
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={
                                        balance.advance
                                    }
                                    onChange={(e) =>
                                        setBalance({
                                            ...balance,
                                            advance:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    style={styles.input}
                                />
                            </div>

                            <div>
                                <label>Cash</label>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={balance.cash}
                                    onChange={(e) =>
                                        setBalance({
                                            ...balance,
                                            cash: e.target
                                                .value,
                                        })
                                    }
                                    style={styles.input}
                                />
                            </div>

                            <div>
                                <label>HDFC</label>

                                <input
                                    type="number"
                                    step="0.01"
                                    value={balance.hdfc}
                                    onChange={(e) =>
                                        setBalance({
                                            ...balance,
                                            hdfc: e.target
                                                .value,
                                        })
                                    }
                                    style={styles.input}
                                />
                            </div>

                            <button
                                type="submit"
                                style={
                                    styles.saveButton
                                }
                                disabled={
                                    savingBalance
                                }
                            >
                                {savingBalance
                                    ? "Saving..."
                                    : "Save Balances"}
                            </button>
                        </form>
                    )}
                </section>

                {/* Bills */}
                <section style={styles.card}>
                    <h2 style={styles.sectionTitle}>
                        Bills
                    </h2>

                    <div className="dashboard-summary-row" style={styles.summaryRow}>
                        <div>
                            <span
                                style={
                                    styles.summaryLabel
                                }
                            >
                                Total Bills
                                (Not Submitted)
                            </span>

                            <strong
                                style={
                                    styles.summaryValue
                                }
                            >
                                {formatCurrency(
                                    billsNotSubmitted
                                )}
                            </strong>
                        </div>

                        <div>
                            <span
                                style={
                                    styles.summaryLabel
                                }
                            >
                                Total Bills
                                (Submitted)
                            </span>

                            <strong
                                style={
                                    styles.summaryValue
                                }
                            >
                                {formatCurrency(
                                    billsSubmitted
                                )}
                            </strong>
                        </div>

                        <div className="dashboard-total-column" style={styles.totalColumn}>
                            <span
                                style={
                                    styles.summaryLabel
                                }
                            >
                                Total Bills
                            </span>

                            <strong
                                style={
                                    styles.totalValue
                                }
                            >
                                {formatCurrency(
                                    totalBills
                                )}
                            </strong>
                        </div>
                    </div>
                </section>

                {/* Cash and HDFC */}
                <section style={styles.card}>
                    <div style={styles.typeHeader}>
                        <h2 style={styles.sectionTitle}>
                            Type
                        </h2>

                        <span
                            style={styles.currentLabel}
                        >
                            Current
                        </span>
                    </div>

                    <div style={styles.accountRow}>
                        <span>Cash</span>

                        <strong>
                            {formatCurrency(
                                balance.cash
                            )}
                        </strong>
                    </div>

                    <div style={styles.accountRow}>
                        <span>HDFC</span>

                        <strong>
                            {formatCurrency(
                                balance.hdfc
                            )}
                        </strong>
                    </div>

                    <div
                        style={{
                            ...styles.accountRow,
                            ...styles.totalAccountRow,
                        }}
                    >
                        <span>Total</span>

                        <strong>
                            {formatCurrency(
                                totalCashBank
                            )}
                        </strong>
                    </div>
                </section>

                {/* Extra */}
                <section style={styles.card}>
                    <div style={styles.accountRow}>
                        <div>
                            <h2
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Extra
                            </h2>

                            <p
                                style={
                                    styles.smallText
                                }
                            >
                                Total of all extra
                                transactions
                            </p>
                        </div>

                        <strong
                            style={styles.extraAmount}
                        >
                            {formatCurrency(
                                totalExtra
                            )}
                        </strong>
                    </div>
                </section>

                {/* Reconciliation */}
                <section
                    style={{
                        ...styles.reconciliationCard,
                        ...(Math.abs(
                            reconciliation
                        ) < 0.01
                            ? styles.reconciled
                            : styles.notReconciled),
                    }}
                >
                    <p style={styles.reconciliationTitle}>
                        Reconciliation
                    </p>

                    <div
                        style={
                            styles.reconciliationAmount
                        }
                    >
                        {formatCurrency(
                            reconciliation
                        )}
                    </div>

                    <p
                        style={
                            styles.reconciliationText
                        }
                    >
                        Extra + Advance - Total Bills -
                        Cash - HDFC
                    </p>

                    {Math.abs(reconciliation) <
                    0.01 ? (
                        <span
                            style={
                                styles.reconciledBadge
                            }
                        >
                            ✓ Reconciled
                        </span>
                    ) : (
                        <span
                            style={
                                styles.notReconciledBadge
                            }
                        >
                            Difference exists
                        </span>
                    )}
                </section>
            </main>
        </div>
    );
}

const styles = {
    app: {
        minHeight: "100vh",
        display: "flex",
        background: "#f5f7fb",
        fontFamily:
            "Inter, Arial, sans-serif",
    },

    sidebar: {
        width: "240px",
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "25px 18px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
    },

    logo: {
        margin: 0,
        fontSize: "21px",
    },

    logoSubtitle: {
        color: "#9ca3af",
        fontSize: "13px",
        marginTop: "5px",
    },

    nav: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        marginTop: "35px",
    },

    navButton: {
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        border: "none",
        borderRadius: "8px",
        background: "transparent",
        color: "#d1d5db",
        cursor: "pointer",
        fontSize: "14px",
    },

    activeNavButton: {
        background: "#2563eb",
        color: "white",
    },

    logoutButton: {
        marginTop: "auto",
        padding: "11px",
        border: "1px solid #374151",
        borderRadius: "8px",
        background: "transparent",
        color: "#d1d5db",
        cursor: "pointer",
    },

    main: {
        flex: 1,
        maxWidth: "1100px",
        padding: "35px",
        boxSizing: "border-box",
    },

    pageHeader: {
        marginBottom: "25px",
    },

    pageTitle: {
        margin: 0,
        fontSize: "30px",
    },

    pageSubtitle: {
        color: "#6b7280",
        marginTop: "7px",
    },

    card: {
        background: "white",
        borderRadius: "14px",
        padding: "25px",
        marginBottom: "18px",
        boxShadow:
            "0 2px 12px rgba(0,0,0,0.06)",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    sectionTitle: {
        margin: 0,
        fontSize: "18px",
    },

    editBalanceButton: {
        border: "1px solid #d1d5db",
        background: "white",
        padding: "8px 13px",
        borderRadius: "7px",
        cursor: "pointer",
    },

    largeAmount: {
        fontSize: "28px",
        fontWeight: "700",
        marginTop: "18px",
    },

    balanceForm: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "15px",
        marginTop: "20px",
        alignItems: "end",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "10px",
        marginTop: "6px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
    },

    saveButton: {
        padding: "10px 16px",
        border: "none",
        borderRadius: "7px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
    },

    summaryRow: {
        display: "grid",
        gridTemplateColumns:
            "repeat(3, 1fr)",
        gap: "20px",
        marginTop: "22px",
    },

    summaryLabel: {
        display: "block",
        color: "#6b7280",
        fontSize: "14px",
        marginBottom: "7px",
    },

    summaryValue: {
        fontSize: "20px",
    },

    totalColumn: {
        borderLeft: "1px solid #e5e7eb",
        paddingLeft: "20px",
    },

    totalValue: {
        fontSize: "22px",
    },

    typeHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
    },

    currentLabel: {
        color: "#6b7280",
        fontSize: "13px",
    },

    accountRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: "1px solid #f0f0f0",
    },

    totalAccountRow: {
        borderBottom: "none",
        paddingBottom: 0,
        fontWeight: "700",
    },

    smallText: {
        color: "#6b7280",
        fontSize: "13px",
        marginTop: "5px",
    },

    extraAmount: {
        fontSize: "22px",
    },

    reconciliationCard: {
        borderRadius: "16px",
        padding: "35px",
        textAlign: "center",
        marginTop: "25px",
        marginBottom: "30px",
    },

    reconciled: {
        background: "#ecfdf5",
        border: "1px solid #a7f3d0",
    },

    notReconciled: {
        background: "#fff7ed",
        border: "1px solid #fed7aa",
    },

    reconciliationTitle: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "600",
    },

    reconciliationAmount: {
        fontSize: "42px",
        fontWeight: "800",
        margin: "12px 0",
    },

    reconciliationText: {
        color: "#6b7280",
        fontSize: "13px",
    },

    reconciledBadge: {
        display: "inline-block",
        marginTop: "10px",
        padding: "6px 12px",
        borderRadius: "20px",
        background: "#d1fae5",
        fontSize: "13px",
    },

    notReconciledBadge: {
        display: "inline-block",
        marginTop: "10px",
        padding: "6px 12px",
        borderRadius: "20px",
        background: "#ffedd5",
        fontSize: "13px",
    },

    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "18px",
    },

    loading: {
        padding: "50px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
    },
};

export default Dashboard;