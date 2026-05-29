export { getSetting, setSetting, deleteSetting, getAllSettings } from './settings'

export {
  getAllCategories,
  getCategoriesByType,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories'

export {
  getAllTransactions,
  getTransactionsByMonth,
  getTransactionById,
  getMonthSummary,
  getSpendingByCategory,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCategory,
  getTransactionsByType,
} from './transactions'
export type { MonthSummary, CategorySpending } from './transactions'

export {
  getBudgetsByMonth,
  getBudgetByCategory,
  getBudgetById,
  getBudgetsWithSpending,
  createBudget,
  updateBudget,
  deleteBudget,
} from './budgets'
export type { BudgetWithSpending } from './budgets'

export {
  getAllSavingsGoals,
  getSavingsGoalById,
  getActiveSavingsGoal,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
} from './savings-goals'

export {
  getContributionsByGoal,
  getContributionById,
  createContribution,
  deleteContribution,
  getTotalContributions,
} from './contributions'

export {
  getAllLoans,
  getLoansByType,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  getLoanPayments,
  getLoanPaymentById,
  createLoanPayment,
  updateLoanPayment,
  deleteLoanPayment,
  getAllLoansWithSummary,
  getLoanPaymentsWithStatus,
  markOverduePayments,
} from './loans'
export type { LoanWithSummary } from './loans'

export {
  getAllRecurringExpenses,
  getActiveRecurringExpenses,
  getRecurringExpenseById,
  getUpcomingPayments,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getRecurringExpensesWithCategory,
} from './recurring-expenses'
export type { UpcomingPayment } from './recurring-expenses'
