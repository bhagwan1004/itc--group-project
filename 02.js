// Function to generate matrix input fields
function generateMatrixInput() {
    const matrixRows = document.getElementById('rows').value;
    const matrixColumns = document.getElementById('columns').value;

    // Clear previous inputs if any
    const matrixInputs = document.getElementById('matrix-inputs');
    matrixInputs.innerHTML = '';

    if (!matrixRows || !matrixColumns || matrixRows < 2 || matrixColumns < 2) {
        alert("Please enter valid dimensions for rows and columns.");
        return;
    }
    // **Check if the matrix is square (rows === columns)**
    if (matrixRows !== matrixColumns) {
        alert("LDU factorization is only valid for square matrices.");
        return; // Exit the function if the matrix is not square
    }

    // Create the matrix input fields dynamically
    for (let i = 0; i < matrixRows; i++) {
        let row = document.createElement('div');
        row.classList.add('matrix-row');
        for (let j = 0; j < matrixColumns; j++) {
            let input = document.createElement('input');
            input.type = 'number';
            input.id = `cell-${i}-${j}`;
            input.placeholder = `A[${i + 1}][${j + 1}]`;
            row.appendChild(input);
        }
        matrixInputs.appendChild(row);
    }
}

// Function to calculate LDU decomposition
function calculateLDU() {
    const matrixRows = parseInt(document.getElementById('rows').value);
    const matrixColumns = parseInt(document.getElementById('columns').value);
    const matrix = [];

    // Retrieve matrix values from input
    for (let i = 0; i < matrixRows; i++) {
        let row = [];
        for (let j = 0; j < matrixColumns; j++) {
            const cellValue = document.getElementById(`cell-${i}-${j}`).value;
            row.push(parseFloat(cellValue));
        }
        matrix.push(row);
    }

    if (matrixRows !== matrixColumns) {
        alert("LDU factorization is only for square matrices.");
        return;
    }

    const { L, D, U, stepsL, stepsU } = LDUFactorization(matrix, matrixRows);
    displaySteps(stepsL, stepsU);
    displayMatrices(L, D, U);
}

// Function to convert a decimal to a fraction string
function decimalToFraction(decimal) {
    const tolerance = 1.0E-6;  // Tolerance for rounding errors
    let numerator = decimal;
    let denominator = 1;

    while (Math.abs(numerator - Math.round(numerator)) > tolerance) {
        numerator *= 10;
        denominator *= 10;
    }

    const gcd = (a, b) => {
        while (b) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    };

    const commonDivisor = gcd(numerator, denominator);
    numerator = Math.round(numerator / commonDivisor);
    denominator = denominator / commonDivisor;

    return denominator === 1 ? `${numerator}` : `${numerator}/${denominator}`;
}

// Function to perform LDU factorization
function LDUFactorization(A, n) {
    let L = Array.from({ length: n }, () => Array(n).fill(0));
    let D = Array.from({ length: n }, () => Array(n).fill(0));
    let U = JSON.parse(JSON.stringify(A)); // Copy of A
    let stepsL = [];  // Steps for L matrix
    let stepsU = [];  // Steps for U matrix

    for (let i = 0; i < n; i++) {
        L[i][i] = 1; // Set diagonal of L to 1

        // Calculate diagonal entries for D
        D[i][i] = U[i][i];
        stepsL.push(`Setting D[${i + 1}][${i + 1}] = ${decimalToFraction(U[i][i])}`);

        // Perform elimination for L and U
        for (let j = i + 1; j < n; j++) {
            // Factor for row elimination
            let factorNumerator = U[j][i];
            let factorDenominator = U[i][i];
            let factorFraction = decimalToFraction(factorNumerator / factorDenominator);
            L[j][i] = factorNumerator / factorDenominator;

            // Elimination for L matrix
            stepsL.push(`Elimination for L: R${j + 1} = R${j + 1} - (${factorFraction}) * R${i + 1}`);
            stepsL.push(`Updating L[${j + 1}][${i + 1}] = ${factorFraction}`);

            // Apply row operation to U
            for (let k = i; k < n; k++) {
                U[j][k] -= (factorNumerator / factorDenominator) * U[i][k];
            }
            stepsU.push(`Matrix U after applying row operation to R${j + 1}:\n` + formatMatrix(U));
        }

        // Record steps for U matrix after each row
        stepsU.push(`Matrix U after processing row ${i + 1}:\n` + formatMatrix(U));
        stepsL.push(`Matrix L after processing row ${i + 1}:\n` + formatMatrix(L));
    }

    return { L, D, U, stepsL, stepsU };
}

// Function to display calculation steps for L and U separately
function displaySteps(stepsL, stepsU) {
    const stepsOutput = document.getElementById('steps-output');
    stepsOutput.innerHTML = '<h3>Calculation Steps for L:</h3>';
    stepsL.forEach(step => {
        stepsOutput.innerHTML += `<p>${step}</p>`;
    });
    stepsOutput.innerHTML += '<h3>Calculation Steps for U:</h3>';
    stepsU.forEach(step => {
        stepsOutput.innerHTML += `<p>${step}</p>`;
    });
}

// Function to display matrices L, D, and U
function displayMatrices(L, D, U) {
    const output = document.getElementById('output');
    output.innerHTML = ''; // Clear previous output

    output.innerHTML += '<h3>Matrix L:</h3>' + formatMatrix(L);
    output.innerHTML += '<h3>Matrix D:</h3>' + formatMatrix(D);
    output.innerHTML += '<h3>Matrix U:</h3>' + formatMatrix(U);
}

// Function to format a matrix as HTML with fraction display
function formatMatrix(matrix) {
    let html = '<div class="matrix">';
    matrix.forEach(row => {
        html += '<div>';
        row.forEach(value => {
            html += `<span>${decimalToFraction(value)}</span> `;
        });
        html += '</div>';
    });
    html += '</div>';
    return html;
}
