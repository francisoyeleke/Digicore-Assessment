
function detectTransactionLimitBreach(dailyTransactions) {
    const accountIds = [];
    for (const dailyTransaction of dailyTransactions) {
        if (!("totalAmount" in dailyTransaction)
            || !("currency" in dailyTransaction)
            || !("accountId" in dailyTransaction)
            || !("dailyLimit" in dailyTransaction)
            || !("accountType" in dailyTransaction)
            || dailyTransaction.currency !== "NGN"
            || (dailyTransaction.accountType != "Retail" && dailyTransaction.accountType != "Business")
            || !Number.isFinite(dailyTransaction.totalAmount)
            || !Number.isFinite(dailyTransaction.dailyLimit)
            || dailyTransaction.totalAmount < 0) {
            continue;
        }
        if ((dailyTransaction.accountType === "Retail" && (dailyTransaction.totalAmount - 10) > dailyTransaction.dailyLimit) || (dailyTransaction.accountType === "Business" && dailyTransaction.totalAmount > dailyTransaction.dailyLimit)) {
            accountIds.push(dailyTransaction.accountId);
            continue;
        }
    }
    return accountIds;
}

// test cases, normally test cases should be written with mocha or jest but due to time constrains
function defaultTest() {
    console.log("Test Case: defaultTest");
    const result = detectTransactionLimitBreach([
        { "accountId": "A001", "accountType": "Retail", "dailyLimit": 500, "totalAmount": 505, "currency": "NGN" },
        { "accountId": "A002", "accountType": "Retail", "dailyLimit": 500, "totalAmount": 520, "currency": "NGN" },
        { "accountId": "B001", "accountType": "Business", "dailyLimit": 1000, "totalAmount": 1000, "currency": "NGN" },
        { "accountId": "B002", "accountType": "Business", "dailyLimit": 1000, "totalAmount": 1001, "currency": "NGN" },
        { "accountId": "X999", "accountType": "Retail", "dailyLimit": 500, "totalAmount": -20, "currency": "NGN" },
    ]);
    console.assert(result.length === 2, "   Expected length of result to be 2, but got %s", result.length);
    console.assert(result[0] === "A002", "  Expected first entry to be A002, but got %s", result[0]);
    console.assert(result[1] === "B002", "  Expected second entry to be B002, but got %s", result[0]);
}

function positiveTests() {
    console.log("Test Case: positiveTests - no breach");
    const result = detectTransactionLimitBreach([
        { "accountId": "A001", "accountType": "Retail", "dailyLimit": 500, "totalAmount": 505, "currency": "NGN" },
        { "accountId": "A002", "accountType": "Retail", "dailyLimit": 600, "totalAmount": 520, "currency": "NGN" },
        { "accountId": "B001", "accountType": "Business", "dailyLimit": 1000, "totalAmount": 1000, "currency": "NGN" },
        { "accountId": "B002", "accountType": "Retail", "dailyLimit": 1000, "totalAmount": 1001, "currency": "NGN" },
        { "accountId": "X999", "accountType": "Retail", "dailyLimit": 500, "totalAmount": 20, "currency": "NGN" },
    ]);
    console.assert(result.length === 0, "   Expected length of result to be 0, but got %s", result.length);
}

function negativeTests() {
    console.log("Test Case: negativeTests - all breached");
    const result = detectTransactionLimitBreach([
        { "accountId": "A001", "accountType": "Retail", "dailyLimit": 200, "totalAmount": 505, "currency": "NGN" },
        { "accountId": "A002", "accountType": "Retail", "dailyLimit": 600, "totalAmount": 620, "currency": "NGN" },
        { "accountId": "B001", "accountType": "Business", "dailyLimit": 1000, "totalAmount": 10000, "currency": "NGN" },
        { "accountId": "B002", "accountType": "Retail", "dailyLimit": 100, "totalAmount": 10001, "currency": "NGN" },
        { "accountId": "X999", "accountType": "Retail", "dailyLimit": 1, "totalAmount": 20, "currency": "NGN" },
    ]);
    console.assert(result.length === 5, "   Expected length of result to be 5, but got %s", result.length);
}

function testCurrencies() {
    console.log("Test Case: testCurrencies");
    const result = detectTransactionLimitBreach([
        { "accountId": "A001", "accountType": "Retail", "dailyLimit": 500, "totalAmount": 505, "currency": "NGN" },
        { "accountId": "A002", "accountType": "Retail", "dailyLimit": 600, "totalAmount": 520, "currency": "GHS" },
        { "accountId": "B001", "accountType": "Business", "dailyLimit": 1000, "totalAmount": 1000, "currency": "NGN" },
        { "accountId": "B002", "accountType": "Retail", "dailyLimit": 1000, "totalAmount": 1001, "currency": "CAD" },
        { "accountId": "X999", "accountType": "Retail", "dailyLimit": 500, "totalAmount": 20, "currency": "USD" },
    ]);
    console.assert(result.length === 0, "   Expected length of result to be 0, but got %s", result.length);
}

function testMissingFields() {
    console.log("Test Case: testMissingFields");
    const result = detectTransactionLimitBreach([
        { "accountId": "A001", "dailyLimit": 500, "totalAmount": 505, "currency": "NGN" },
        { "accountType": "Retail", "totalAmount": 520, "currency": "GHS" },
        { "accountId": "B001", "accountType": "Business", "dailyLimit": 1000, "totalAmount": 1000, "currency": "NGN" },
        { "accountId": "B002", "accountType": "Retail", "dailyLimit": 1000, "currency": "CAD" },
        { "accountId": "X999", "accountType": "Retail", "dailyLimit": 500, "totalAmount": 20 },
    ]);
    console.assert(result.length === 0, "   Expected length of result to be 0, but got %s", result.length);
}

function testNonNumericLimits() {
    console.log("Test Case: testNonNumericLimits");
    const result = detectTransactionLimitBreach([
        { "accountId": "A001", "accountType": "Retail", "dailyLimit": "500", "totalAmount": 505, "currency": "NGN" },
        { "accountId": "A002", "accountType": "Retail", "dailyLimit": "error", "totalAmount": 520, "currency": "GHS" },
        { "accountId": "B001", "accountType": "Business", "dailyLimit": "nocrash", "totalAmount": 1000, "currency": "NGN" },
        { "accountId": "B002", "accountType": "Retail", "dailyLimit": [2], "totalAmount": 1001, "currency": "CAD" },
        { "accountId": "X999", "accountType": "Retail", "dailyLimit": {}, "totalAmount": 20, "currency": "USD" },
    ]);
    console.assert(result.length === 0, "   Expected length of result to be 0, but got %s", result.length);
}

function runTests() {
    defaultTest();
    positiveTests();
    negativeTests();
    testCurrencies();
    testMissingFields();
    testNonNumericLimits();
}

runTests();