export const patterns = [
    {
        regex: /\bvar\b/g,
        type: 'warning',
        message: 'Use of "var" keyword is discouraged. Consider using "let" or "const" instead for better scoping.'
    },
    {
        regex: /function\s+\w+\s*\(/g,
        type: 'info',
        message: 'Traditional function declaration found. Consider using arrow functions where appropriate.'
    },
    {
        regex: /(?<!\!)(?<!=)==(?!=)/g,
        type: 'warning',
        message: 'Use of loose equality operator (==) detected. Consider using strict equality (===) instead.'
    },
    {
        regex: /(?<!=)!=(?!=)/g,
        type: 'warning',
        message: 'Use of loose inequality operator (!=) detected. Consider using strict inequality (!==) instead.'
    },
    {
        regex: /document\.write/g,
        type: 'error',
        message: 'Usage of document.write() is strongly discouraged as it can lead to XSS vulnerabilities.'
    },
    {
        regex: /eval\s*\(/g,
        type: 'error',
        message: 'Use of eval() is strongly discouraged as it can lead to security vulnerabilities and performance issues.'
    },
    {
        regex: /\balert\s*\(/g,
        type: 'warning',
        message: 'Use of alert() should be avoided in production code. Consider using a modal or notification system instead.'
    },
    {
        regex: /console\.(log|warn|error|info|debug)/g,
        type: 'info',
        message: 'Console statements should be removed from production code.'
    },
    {
        regex: /innerHTML\s*=/g,
        type: 'warning',
        message: 'Assignment to innerHTML can lead to XSS vulnerabilities. Consider using textContent or DOM methods.'
    },
    {
        regex: /setTimeout\s*\(\s*["']/g,
        type: 'warning',
        message: 'Passing strings to setTimeout/setInterval is discouraged. Use function references instead.'
    },
    {
        regex: /new\s+Array\(/g,
        type: 'info',
        message: 'Using the Array constructor is not recommended. Use array literals [] instead.'
    },
    {
        regex: /new\s+Object\(/g,
        type: 'info',
        message: 'Using the Object constructor is not recommended. Use object literals {} instead.'
    },
    {
        regex: /new\s+Object\(/g,
        type: 'info',
        message: 'Using the Object constructor is not recommended. Use object literals {} instead.'
    },
    {
        regex: /\bcontinue\b/g,
        type: 'warning',
        message: 'Use of "continue" can make loops harder to read. Consider restructuring the loop logic.'
    },
    {
        regex: /\bbreak\b/g,
        type: 'warning',
        message: 'Use of "break" can make loops harder to follow. Consider using proper loop conditions instead.'
    },
    {
        regex: /\.substr\(/g,
        type: 'warning',
        message: 'The use of ".substr()" is deprecated. Consider using ".slice()" or ".substring()" instead for better compatibility and performance.'
    }

];