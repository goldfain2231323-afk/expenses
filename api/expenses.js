// A simple in-memory array to simulate a database.
// Data stored here is NOT persistent across function invocations on Vercel.
let expenses = [
    {
        id: 1,
        amount: 50.00,
        description: "Groceries for the week",
        category: "Food",
        date: "2025-11-28"
    },
    {
        id: 2,
        amount: 15.75,
        description: "Monthly streaming subscription",
        category: "Entertainment",
        date: "2025-12-01"
    }
];

// Helper function to send a JSON response with a specific status code
const sendResponse = (res, statusCode, body) => {
    res.statusCode = statusCode;
    // Essential for Vercel/CORS/browser compatibility
    res.setHeader('Content-Type', 'application/json');
    // Allow the frontend to access the API (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.end(JSON.stringify(body));
};

// Vercel/Node.js helper to parse the body manually (since req.body isn't guaranteed)
async function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({}); // Return an empty object on parse failure
            }
        });
    });
}

// Main serverless function handler
export default async function handler(req, res) {
    // Set CORS headers for all methods
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests (CORS)
    if (req.method === 'OPTIONS') {
        return sendResponse(res, 204, null); // 204 No Content
    }

    // Use a try/catch block to handle unexpected errors gracefully
    try {
        switch (req.method) {
            case 'GET':
                // FIX: Await handler functions
                await handleGET(req, res);
                break;

            case 'POST':
                // FIX: Pass the parsed body to handlePOST
                const body = await parseBody(req);
                await handlePOST(req, res, body);
                break;

            default:
                // Handle any other HTTP method
                sendResponse(res, 405, { error: `Method ${req.method} Not Allowed` });
                break;
        }
    } catch (error) {
        // Log the error for debugging
        console.error('API Error:', error);
        // Send a generic 500 error response
        sendResponse(res, 500, { error: 'Internal Server Error' });
    }
}

// --- Handler Functions ---

/**
 * Handles GET requests to retrieve all expenses.
 */
async function handleGET(req, res) {
    // FIX: Reverse the array to show the newest expenses first, matching the frontend's DOM update
    const sortedExpenses = [...expenses].reverse();
    sendResponse(res, 200, { data: sortedExpenses, total: expenses.length });
}

/**
 * Handles POST requests to add a new expense.
 * Expects { amount, description } from the frontend form.
 */
async function handlePOST(req, res, body) {
    // Use body object parsed from the request stream
    const newExpense = body;
    
    // FIX: Adjust required fields to match the frontend (only description and amount)
    const requiredFields = ['amount', 'description'];
    const missingFields = requiredFields.filter(field => !(field in newExpense));

    if (missingFields.length > 0) {
        return sendResponse(res, 400, {
            error: 'Missing required fields',
            missing: missingFields
        });
    }

    // Default values for fields not provided by the simple form
    const category = newExpense.category || "Uncategorized";
    const date = newExpense.date || new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD

    // 2. Data Formatting and Validation
    const amount = parseFloat(newExpense.amount);
    const { description } = newExpense; // Destructure only provided fields

    if (isNaN(amount) || amount <= 0) {
        return sendResponse(res, 400, { error: 'Invalid amount. Must be a positive number.' });
    }

    // 3. Create the expense object
    const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;

    const expenseRecord = {
        id: newId,
        amount, // Use the parsed float value
        description,
        category, // Use default if not provided
        date      // Use default if not provided
    };

    // 4. Add to the in-memory array
    expenses.push(expenseRecord);

    // 5. Send success response (201 Created)
    sendResponse(res, 201, {
        message: 'Expense added successfully',
        expense: expenseRecord
    });
}
