// Phone number formatting
function formatPhoneNumber(value) {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format the phone number
    if (phoneNumber.length >= 6) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length >= 3) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length > 0) {
        return `(${phoneNumber}`;
    }
    return phoneNumber;
}

// Add phone number formatting to the phone input
document.getElementById('phone').addEventListener('input', function(e) {
    const cursorPosition = e.target.selectionStart;
    const oldValue = e.target.value;
    const newValue = formatPhoneNumber(oldValue);
    
    e.target.value = newValue;
    
    // Adjust cursor position after formatting
    let newCursorPosition = cursorPosition;
    if (newValue.length > oldValue.length) {
        // If characters were added (formatting), move cursor forward
        newCursorPosition = cursorPosition + (newValue.length - oldValue.length);
    }
    
    // Set cursor position
    e.target.setSelectionRange(newCursorPosition, newCursorPosition);
});

// Prevent non-numeric input (except for backspace, delete, arrow keys, etc.)
document.getElementById('phone').addEventListener('keydown', function(e) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];
    const isNumber = /[0-9]/.test(e.key);
    const isAllowedKey = allowedKeys.includes(e.key);
    const isSelectAll = e.ctrlKey && e.key === 'a';
    const isCopy = e.ctrlKey && e.key === 'c';
    const isPaste = e.ctrlKey && e.key === 'v';
    
    if (!isNumber && !isAllowedKey && !isSelectAll && !isCopy && !isPaste) {
        e.preventDefault();
    }
});

// Handle paste events for phone number
document.getElementById('phone').addEventListener('paste', function(e) {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const formattedNumber = formatPhoneNumber(pastedText);
    e.target.value = formattedNumber;
});

// Initialize character count
updateCharacterCount();

