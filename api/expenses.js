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
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

// Main serverless function handler
export default async function handler(req, res) {
  // Use a try/catch block to handle unexpected errors gracefully
  try {
    switch (req.method) {
      case 'GET':
        // Handle GET request: Return all expenses
        handleGET(req, res);
        break;

      case 'POST':
        // Handle POST request: Add a new expense
        await handlePOST(req, res);
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
function handleGET(req, res) {
  sendResponse(res, 200, { data: expenses, total: expenses.length });
}

/**
 * Handles POST requests to add a new expense.
 * Expects { amount, description, category, date } in the request body.
 */
async function handlePOST(req, res) {
  // Vercel/Next.js automatically parses JSON bodies into req.body for you.
  const newExpense = req.body;

  // 1. Basic Validation for required fields
  const requiredFields = ['amount', 'description', 'category', 'date'];
  const missingFields = requiredFields.filter(field => !(field in newExpense));

  if (missingFields.length > 0) {
    return sendResponse(res, 400, {
      error: 'Missing required fields',
      missing: missingFields
    });
  }

  // 2. Data Formatting and Validation (More robust validation would be needed for a production app)
  const amount = parseFloat(newExpense.amount);
  const { description, category, date } = newExpense;

  if (isNaN(amount) || amount <= 0) {
    return sendResponse(res, 400, { error: 'Invalid amount. Must be a positive number.' });
  }

  // 3. Create the expense object
  const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;

  const expenseRecord = {
    id: newId,
    amount, // Use the parsed float value
    description,
    category,
    date
  };

  // 4. Add to the in-memory array
  expenses.push(expenseRecord);

  // 5. Send success response (201 Created)
  sendResponse(res, 201, {
    message: 'Expense added successfully',
    expense: expenseRecord
  });
}
