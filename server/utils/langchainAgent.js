// server/utils/langchainAgent.js
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { z } = require('zod');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');

// Initialize the LLM
const chatModel = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-pro", // --- CORRECTED: Changed from modelName to model ---
    temperature: 0.7,
});

// Define the schema for the output we expect from the LLM
const nudgeOutputSchema = z.object({
    nudgeMessage: z.string().describe("The personalized and empathetic financial nudge message for the user."),
    nudgeType: z.enum([
        'ImpulseWarning',
        'BudgetThreshold',
        'StressSpendingInsight',
        'PatternInsight',
        'SavingsMotivation',
        'GeneralInsight',
        'FinancialEducation'
    ]).describe("The type of financial nudge generated."),
    categoryImpacted: z.enum([
        'Dining', 'Groceries', 'Transport', 'Entertainment', 'Impulse', 'Utilities', 'Rent',
        'Shopping', 'Salary', 'Investment', 'Healthcare', 'Education', 'Travel', 'Other', 'General', 'NoSpecificCategory'
    ]).describe("The primary spending category this nudge is related to, or 'General' if not category-specific."),
    reasoning: z.string().optional().describe("Brief explanation for why this nudge was chosen.")
});

const outputParser = StructuredOutputParser.fromZodSchema(nudgeOutputSchema);

const getBehavioralNudge = async (user, transactions) => {
    const userData = {
        username: user.username,
        budgets: user.budgets.map(b => ({
            category: b.category,
            amount: b.amount,
            startDate: b.startDate.toISOString().split('T')[0],
            endDate: b.endDate.toISOString().split('T')[0]
        })),
        baselineSpending: user.baselineSpending,
    };

    const transactionData = transactions.map(t => ({
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date.toISOString().split('T')[0],
        moodTag: t.moodTag,
        contextTag: t.contextTag,
        isImpulse: t.isImpulse,
        description: t.description
    }));

    const formatInstructions = outputParser.getFormatInstructions();

    const promptMessages = [
        new SystemMessage(
            `You are an empathetic and insightful personal finance AI assistant named Fin-Nudge.
            Your goal is to provide personalized behavioral nudges and insights to help users improve their financial habits.
            Analyze the provided user's financial profile, budgets, and recent transaction history.
            Generate ONE concise, actionable, and empathetic nudge message.
            Strictly follow the output format instructions.
            ` + formatInstructions
        ),
        new HumanMessage(
            `Here is the user's profile:
            ${JSON.stringify(userData, null, 2)}

            Here are their recent transactions (last 30 days):
            ${JSON.stringify(transactionData, null, 2)}

            Given this information, provide ONE behavioral financial nudge.
            `
        ),
    ];

    try {
        const result = await chatModel.invoke(promptMessages);
        const parsedOutput = await outputParser.parse(result.content);
        return parsedOutput;
    } catch (error) {
        console.error("Error generating nudge with LLM:", error.message);
        return {
            nudgeMessage: "It looks like you're taking steps to manage your money! Keep tracking your spending to uncover more insights.",
            nudgeType: "GeneralInsight",
            categoryImpacted: "General",
        };
    }
};

module.exports = { getBehavioralNudge };