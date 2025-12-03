/**
 * Vercel Serverless Function: /api/expenses
 * * NOTE: In a real Vercel deployment, this endpoint would connect to a dedicated
 * database (e.g., MongoDB, PostgreSQL) to store data persistently.
 * This example uses a simple in-memory array for demonstration purposes,
 * which will reset on every function invocation/cold start.
 * * The client-side application (index.html) uses Firebase Firestore for actual persistence.
 */

// Simple in-memory storage (NON-PERSISTENT in a real serverless environment)
let expenses = [];

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        // Return the list of expenses
        res.status(200).json({
            message: "Data retrieved (In-memory, NOT persistent on Vercel).",
            data: expenses
        });

    } else if (req.method === 'POST') {
        // Add a new expense
        const { description, amount, date } = req.body;

        if (!description || !amount) {
            return res.status(400).json({ error: "Missing required fields: description and amount." });
        }

        const newExpense = {
            id: Date.now().toString(),
            description,
            amount: parseFloat(amount),
            date: date || new Date().toISOString().split('T')[0]
        };

        expenses.push(newExpense);

        res.status(201).json({ 
            message: "Expense added successfully (In-memory, NOT persistent on Vercel).", 
            expense: newExpense 
        });

    } else {
        res.status(405).send('Method Not Allowed');
    }
};
