// Test slug generation logic

function generateSlug(name) {
    const words = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
        .split(/\s+/) // Split by spaces
        .filter(word => word.length > 0); // Remove empty strings

    // Create slug from first and last word (or just first if only one word)
    if (words.length === 1) {
        return words[0];
    } else if (words.length === 2) {
        return words.join('-');
    } else {
        // Use first and last word for names with 3+ words
        return `${words[0]}-${words[words.length - 1]}`;
    }
}

// Test cases
console.log('Test Cases:');
console.log('Olin Burgers =>', generateSlug('Olin Burgers')); // Should be: olin-burgers
console.log('Adriana da Silva Torres Ramos =>', generateSlug('Adriana da Silva Torres Ramos')); // Should be: adriana-ramos
console.log('Full Test Restaurant =>', generateSlug('Full Test Restaurant')); // Should be: full-restaurant
console.log('Pizza =>', generateSlug('Pizza')); // Should be: pizza
console.log('McDonald\'s =>', generateSlug("McDonald's")); // Should be: mcdonalds
console.log('Café & Cia =>', generateSlug('Café & Cia')); // Should be: caf-cia
