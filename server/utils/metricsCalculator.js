// server/utils/metricsCalculator.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Helper function to get start of week/month etc. (customize as needed)
const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // Sunday is 0, Saturday is 6
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(d.setDate(diff));
};

const getStartOfMonth = (date) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Recalculates and updates user's baseline spending averages in the User document.
 */
const calculateBaselineSpending = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error("calculateBaselineSpending: User not found.");
            return;
        }

        const tenWeeksAgo = new Date();
        tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70); // 10 weeks for a more stable baseline

        const relevantTransactions = await Transaction.find({
            userId,
            type: 'expense',
            date: { $gte: tenWeeksAgo }
        });
        
        console.log(`calculateBaselineSpending: Fetched ${relevantTransactions.length} transactions for baseline calculation.`);

        const categoriesToTrack = [
            'Impulse', 'Dining', 'Entertainment', 'Groceries',
            'Transport', 'Utilities', 'Shopping', 'Other'
        ];
        const weeklySpending = {};
        categoriesToTrack.forEach(cat => weeklySpending[cat] = 0);

        relevantTransactions.forEach(t => {
            if (categoriesToTrack.includes(t.category)) {
                weeklySpending[t.category] += t.amount;
            }
        });

        const numWeeks = relevantTransactions.length > 0 ? Math.ceil((new Date() - tenWeeksAgo) / (1000 * 60 * 60 * 24 * 7)) : 1;
        categoriesToTrack.forEach(cat => {
            user.baselineSpending[`${cat.toLowerCase()}AverageWeekly`] = (weeklySpending[cat] / numWeeks) || 0;
        });

        user.baselineSpending.lastCalculated = new Date();
        await user.save();
        console.log(`calculateBaselineSpending: Baselines updated for user ${userId}`);
    } catch (error) {
        console.error("Error inside calculateBaselineSpending:", error);
    }
};

/**
 * Calculates spending change in relevant categories compared to baseline.
 */
const calculateSpendingChange = async (userId, user) => {
    console.log("Starting calculateSpendingChange for user:", userId);
    try {
        const categoriesToCheck = ['Impulse', 'Dining', 'Entertainment', 'Groceries', 'Transport', 'Shopping'];
        const insights = {};

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const recentTransactions = await Transaction.find({
            userId,
            type: 'expense',
            date: { $gte: last7Days }
        });

        console.log("calculateSpendingChange: Fetched recent transactions:", recentTransactions.length);

        const currentWeeklySpending = {};
        categoriesToCheck.forEach(cat => currentWeeklySpending[cat] = 0);

        recentTransactions.forEach(t => {
            if (categoriesToCheck.includes(t.category)) {
                currentWeeklySpending[t.category] += t.amount;
            }
        });

        categoriesToCheck.forEach(cat => {
            const baseline = user.baselineSpending[`${cat.toLowerCase()}AverageWeekly`];
            const current = currentWeeklySpending[cat];

            if (baseline > 0) {
                const change = ((current - baseline) / baseline) * 100;
                insights[cat.toLowerCase() + 'Change'] = parseFloat(change.toFixed(2));
            } else if (current > 0) {
                insights[cat.toLowerCase() + 'Change'] = 'New Spending';
            } else {
                insights[cat.toLowerCase() + 'Change'] = 0;
            }
        });

        console.log("calculateSpendingChange: Final insights:", insights);
        return insights;
    } catch (error) {
        console.error("Error inside calculateSpendingChange:", error);
        return {};
    }
};

/**
 * Calculates user's budget adherence percentage.
 */
const calculateBudgetAdherence = async (userId, budgets, allTransactions) => {
    console.log("Starting calculateBudgetAdherence for user:", userId);
    try {
        const adherence = {
            overall: 0,
            categories: {}
        };

        let totalBudgeted = 0;
        let totalSpent = 0;

        for (const budget of budgets) {
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);

            const spentInCategory = allTransactions.reduce((sum, t) => {
                if (t.category === budget.category && t.date >= startDate && t.date <= endDate) {
                    return sum + t.amount;
                }
                return sum;
            }, 0);

            if (budget.amount > 0) {
                adherence.categories[budget.category] = parseFloat(((spentInCategory / budget.amount) * 100).toFixed(2));
            } else {
                 adherence.categories[budget.category] = 0;
            }
            totalBudgeted += budget.amount;
            totalSpent += spentInCategory;
        }

        if (totalBudgeted > 0) {
            adherence.overall = parseFloat(((totalSpent / totalBudgeted) * 100).toFixed(2));
        }

        console.log("calculateBudgetAdherence: Final adherence:", adherence);
        return adherence;
    } catch (error) {
        console.error("Error inside calculateBudgetAdherence:", error);
        return {};
    }
};

/**
 * Estimates potential savings based on reduced impulse or overspending.
 */
const estimateSavings = async (userId, allTransactions, baselineSpending) => {
    console.log("Starting estimateSavings for user:", userId);
    try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const recentImpulseSpending = allTransactions.reduce((sum, t) => {
            if (t.isImpulse && t.date >= last7Days) {
                return sum + t.amount;
            }
            return sum;
        }, 0);

        const baselineImpulse = baselineSpending.impulseAverageWeekly || 0;

        let estimatedSavingsAmount = 0;
        let savingsType = 'No significant savings yet';

        if (recentImpulseSpending < baselineImpulse) {
            estimatedSavingsAmount = parseFloat((baselineImpulse - recentImpulseSpending).toFixed(2));
            savingsType = 'Reduced Impulse Spending';
        } else if (baselineImpulse === 0 && recentImpulseSpending === 0) {
            savingsType = 'Consistently Avoiding Impulse Buys';
        }

        const result = { amount: estimatedSavingsAmount, type: savingsType };
        console.log("estimateSavings: Final result:", result);
        return result;
    } catch (error) {
        console.error("Error inside estimateSavings:", error);
        return {};
    }
};

module.exports = {
    getStartOfWeek,
    getStartOfMonth,
    calculateBaselineSpending,
    calculateSpendingChange,
    calculateBudgetAdherence,
    estimateSavings
};