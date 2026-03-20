export const BASE_URL = "http://localhost:8000" || import.meta.env.VITE_API_URL;

export const API_PATHS = {
    AUTH: {
        LOGIN: "/api/v1/auth/login",
        REGISTER: "/api/v1/auth/register",
        GET_USER_INFO: "/api/v1/auth/getUser",
    },
    DASHBOARD: {
        GET_DATA: "/api/v1/dashboard",
    },
    INCOME: {
        ADD_INCOME: "/api/v1/income/add",
        GET_ALL_INCOME: "/api/v1/income/get",
        DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
        DOWNLOAD_INCOME: "/api/v1/income/downloadexcel",
    },
    EXPENSE: {
        ADD_EXPENSE: "/api/v1/expense/add",
        GET_ALL_EXPENSE: "/api/v1/expense/get",
        DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
        DOWNLOAD_EXPENSE: "/api/v1/expense/downloadexcel",
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/v1/auth/upload-image",
    },
    // Combined and corrected the Admin Stats path
    STATS: {
        SUMMARY: "/api/v1/admin/stats",      // Used by AdminDashboard
        COMPARE_MONTHS: "/api/v1/stats/compare-months", // Used by FinancialStats
    },
    ADMIN: {
        GET_USERS: "/api/v1/admin/users",
        DELETE_USER: (userId) => `/api/v1/admin/users/${userId}`,
        EXPORT_CSV: "/api/v1/admin/export-csv",
    }
}