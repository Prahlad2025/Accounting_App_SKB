const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "") || "";

function apiUrl(path) {
    if (!API_BASE_URL) {
        throw new Error(
            "API URL is not configured. Set VITE_API_BASE_URL for this deployment."
        );
    }

    return `${API_BASE_URL}${path}`;
}

export async function login(email, password) {
    const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : "Login failed"
        );
    }

    return data;
}

export async function register(name, email, password) {
    const response = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : "Registration failed"
        );
    }

    return data;
}

export async function getExpenses() {
    const token = localStorage.getItem("token");

    const response = await fetch(apiUrl("/expenses"), {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to load expenses");
    }

    return await response.json();
}

export async function createExpense(expense) {
    const token = localStorage.getItem("token");

    const response = await fetch(apiUrl("/expenses"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(expense)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : "Failed to create expense"
        );
    }

    return data;
}

export async function updateExpense(id, expense) {
    const token = localStorage.getItem("token");

    const response = await fetch(apiUrl(`/expenses/${id}`), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            id: Number(id),
            ...expense
        })
    });

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            typeof data === "string"
                ? data
                : "Failed to update expense"
        );
    }
}


export async function deleteExpense(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(apiUrl(`/expenses/${id}`), {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to delete expense");
    }
}

export async function getExtras() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        apiUrl("/ExtraTransactions"),
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch extras.");
    }

    return response.json();
}

export async function createExtra(extra) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        apiUrl("/ExtraTransactions"),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(extra),
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to create extra.");
    }

    return response.json();
}

export async function updateExtra(id, extra) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        apiUrl(`/ExtraTransactions/${id}`),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                ...extra,
                id: Number(id),
            }),
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update extra.");
    }
}

export async function deleteExtra(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        apiUrl(`/ExtraTransactions/${id}`),
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete extra.");
    }
}

export async function getAccountBalance() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        apiUrl("/account-balance"),
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch account balance.");
    }

    return response.json();
}

export async function updateAccountBalance(balance) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        apiUrl("/account-balance"),
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                advance: Number(balance.advance),
                cash: Number(balance.cash),
                hdfc: Number(balance.hdfc)
            })
        }
    );

    if (!response.ok) {
        const message = await response.text();

        throw new Error(
            message || "Failed to update account balance."
        );
    }

    return await response.json();
}
