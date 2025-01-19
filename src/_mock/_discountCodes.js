export const types = [
    { id: 1, name: 'Fixed Amount (per item)' },
    { id: 2, name: 'Fixed Amount (per order)' },
    { id: 3, name: 'Percentage (%)' }
];

export const availabilities = [
    { id: 1, name: 'Early Bird - Startup (Entrepreneur Summit V)' },
    { id: 2, name: 'Early Bird - General - Investor (Entrepreneur Summit V)' },
    { id: 3, name: 'Early Bird - General - Government (Entrepreneur Summit V)' },
    { id: 4, name: 'Early Bird - General - Corporate (Entrepreneur Summit V)' },
    { id: 5, name: 'Early Bird - General - Entrepreneur (Entrepreneur Summit V)' },
    { id: 6, name: 'Early Bird - Speaker - (Entrepreneur Summit V)' },
    { id: 7, name: 'Early Bird - VIP - (Entrepreneur Summit V)' },
    { id: 8, name: 'Standard - Startup (Entrepreneur Summit V)' },
    { id: 9, name: 'Standard - General - Investor (Entrepreneur Summit V)' },
    { id: 10, name: 'Standard - General - Government (Entrepreneur Summit V)' },
    { id: 11, name: 'Standard - General - Corporate (Entrepreneur Summit V)' },
    { id: 12, name: 'Standard - General - Entrepreneur (Entrepreneur Summit V)' },
    { id: 13, name: 'Standard - Speaker - (Entrepreneur Summit V)' },
    { id: 14, name: 'Standard - VIP - (Entrepreneur Summit V)' }
];

// export const categories = [
//     { id: 1, name: 'general' },
//     { id: 2, name: 'vip' },
//     { id: 3, name: 'speaker' }
// ];

function generateUniqueCode() {
    return 'CODE-' + Math.random().toString(36).slice(2, 11).toUpperCase();
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to validate dates
const validateDates = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if startDate is in the past
    if (start < now) {
        return { valid: false, message: 'Start date cannot be in the past.' };
    }

    // Check if endDate is after startDate
    if (end <= start) {
        return { valid: false, message: 'End date must be after the start date.' };
    }

    return { valid: true };
};

// Function to generate discount codes
function generateDiscountCodes(num) {
    const types = [
        'Fixed Amount (per item)',
        'Fixed Amount (per order)',
        'Percentage (%)'
    ];

    const availabilities = [
        'Early Bird - Startup (Entrepreneur Summit V)',
        'Early Bird - General - Investor (Entrepreneur Summit V)',
        'Early Bird - General - Government (Entrepreneur Summit V)',
        'Early Bird - General - Corporate (Entrepreneur Summit V)',
        'Early Bird - General - Entrepreneur (Entrepreneur Summit V)',
        'Early Bird - Speaker - (Entrepreneur Summit V)',
        'Early Bird - VIP - (Entrepreneur Summit V)',
        'Standard - Startup (Entrepreneur Summit V)',
        'Standard - General - Investor (Entrepreneur Summit V)',
        'Standard - General - Government (Entrepreneur Summit V)',
        'Standard - General - Corporate (Entrepreneur Summit V)',
        'Standard - General - Entrepreneur (Entrepreneur Summit V)',
        'Standard - Speaker - (Entrepreneur Summit V)',
        'Standard - VIP - (Entrepreneur Summit V)'
    ];

    // const categories = [
    //     'general',
    //     'vip',
    //     'speaker'
    // ];

    const discountCodes = [];

    for (let i = 0; i < num; i++) {
        let startDate = new Date(Date.now() + Math.floor(Math.random() * 10000000000));
        let endDate = new Date(startDate.getTime() + Math.floor(Math.random() * 10000000000) + 86400000); // End date is 1 day after start date

        // Validate the start and end dates
        const { valid, message } = validateDates(startDate, endDate);
        if (!valid) {
            console.log(`Skipping invalid discount code generation due to: ${message}`);
            continue; // Skip the invalid discount code
        }

        // Determine if the code is expired
        const isExpired = endDate < new Date();

        const code = {
            id: i + 1,
            codeName: generateUniqueCode(),
            codeType: getRandomElement(types),
            codeValue: Math.floor(Math.random() * 100) + 1, // Random value between 1 and 100
            codeAvailability: [
                getRandomElement(availabilities),
                getRandomElement(availabilities),
                getRandomElement(availabilities),
                getRandomElement(availabilities)
            ],
            // codeCategory: getRandomElement(categories),
            codeLimit: Math.floor(Math.random() * 50) + 1, // Random quantity limit between 1 and 50
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: isExpired ? 'Active' : 'Expired', // Set status based on expiration
        };

        discountCodes.push(code);
    }

    return discountCodes;
}

// Generate 20 mock discount codes
const mockDiscountCodes = generateDiscountCodes(20);

// Export the mockDiscountCodes
export default mockDiscountCodes;

console.log(mockDiscountCodes);
