import { lazy, Suspense } from "react";
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Expenses = lazy(() => import("./pages/Expenses"));
const AddExpense = lazy(() => import("./pages/AddExpense"));
const EditExpense = lazy(() => import("./pages/EditExpense"));
const ClearedExpenses = lazy(() => import("./pages/ClearedExpenses"));
const Extras = lazy(() => import("./pages/Extras"));

function App() {
    return (
        <BrowserRouter>
            <Suspense
                fallback={
                    <div
                        className="route-loading"
                        role="status"
                        aria-live="polite"
                    >
                        Loading page...
                    </div>
                }
            >
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/expenses/add" element={<AddExpense />} />
                    <Route path="/expenses/edit/:id" element={<EditExpense />} />
                    <Route
                        path="/cleared-expenses"
                        element={<ClearedExpenses />}
                    />
                    <Route path="/extras" element={<Extras />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
