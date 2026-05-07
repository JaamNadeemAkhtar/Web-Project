// Initialize state
let budget = 0;
let expenses = [];

// DOM Elements
const budgetInput = document.getElementById('budget-input');
const setBudgetBtn = document.getElementById('set-budget-btn');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategoryInput = document.getElementById('expense-category');
const addExpenseBtn = document.getElementById('add-expense-btn');

const totalBudgetValue = document.getElementById('total-budget-value');
const totalExpensesValue = document.getElementById('total-expenses-value');
const remainingBalanceValue = document.getElementById('remaining-balance-value');
const expenseList = document.getElementById('expense-list');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

// Budget Handling
setBudgetBtn.addEventListener('click', () => {
    const val = parseFloat(budgetInput.value);
    if (!isNaN(val) && val > 0) {
        budget = val;
        updateUI();
        budgetInput.value = '';
    } else {
        alert('Please enter a valid budget amount');
    }
});

// Expense Handling
addExpenseBtn.addEventListener('click', () => {
    const name = expenseNameInput.value;
    const amount = parseFloat(expenseAmountInput.value);
    const category = expenseCategoryInput.value;

    if (name && !isNaN(amount) && amount > 0) {
        const expense = {
            id: Date.now(),
            name,
            amount,
            category,
            date: new Date().toLocaleDateString()
        };
        expenses.push(expense);
        updateUI();
        clearExpenseForm();
    } else {
        alert('Please fill in all expense details correctly');
    }
});

function clearExpenseForm() {
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
    expenseCategoryInput.selectedIndex = 0;
}

function updateUI() {
    // Update Stats
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = budget - totalExpenses;

    totalBudgetValue.innerText = `Rs. ${budget.toLocaleString()}`;
    totalExpensesValue.innerText = `Rs. ${totalExpenses.toLocaleString()}`;
    remainingBalanceValue.innerText = `Rs. ${remaining.toLocaleString()}`;

    // Color feedback for balance
    const balanceCard = remainingBalanceValue.parentElement;
    if (remaining < 0) {
        balanceCard.classList.add('negative');
        balanceCard.classList.remove('positive');
    } else if (remaining > 0) {
        balanceCard.classList.add('positive');
        balanceCard.classList.remove('negative');
    }

    // Show/Hide Download Button
    if (downloadPdfBtn) {
        downloadPdfBtn.style.display = expenses.length > 0 ? 'flex' : 'none';
    }

    // Update List
    renderExpenses();
}

function renderExpenses() {
    expenseList.innerHTML = '';
    
    if (expenses.length === 0) {
        expenseList.innerHTML = '<div class="expense-item" style="justify-content: center; color: var(--muted)">No expenses added yet</div>';
        return;
    }

    expenses.slice().reverse().forEach(expense => {
        const card = document.createElement('div');
        card.className = 'expense-card';
        card.innerHTML = `
            <div class="expense-info">
                <h5>${expense.name}</h5>
                <span>${expense.category} • ${expense.date}</span>
            </div>
            <div class="expense-amount">-Rs. ${expense.amount.toLocaleString()}</div>
        `;
        expenseList.appendChild(card);
    });
}

// PDF Download Functionality
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(124, 58, 237); // Primary Violet
        doc.text("TripWallet", 14, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Smart Tour Planner & Expense Tracker", 14, 27);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 27);

        doc.setDrawColor(124, 58, 237);
        doc.setLineWidth(0.5);
        doc.line(14, 32, 196, 32);

        // Summary Stats
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        const balance = budget - totalSpent;

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Expense Summary", 14, 45);

        doc.setFontSize(11);
        doc.text(`Total Budget:`, 14, 55);
        doc.text(`Rs. ${budget.toLocaleString()}`, 60, 55);
        
        doc.text(`Total Spent:`, 14, 62);
        doc.text(`Rs. ${totalSpent.toLocaleString()}`, 60, 62);
        
        doc.text(`Remaining Balance:`, 14, 69);
        doc.setTextColor(balance < 0 ? [239, 68, 68] : [16, 185, 129]); // Red or Green
        doc.text(`Rs. ${balance.toLocaleString()}`, 60, 69);

        // Expense Table
        const tableData = expenses.map((exp, index) => [
            index + 1,
            exp.name,
            exp.category,
            exp.date,
            `Rs. ${exp.amount.toLocaleString()}`
        ]);

        doc.autoTable({
            startY: 80,
            head: [['#', 'Expense Title', 'Category', 'Date', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { top: 80 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text("Plan smartly. Travel further. © 2026 TripWallet", 105, 290, { align: 'center' });
        }

        // Robust download for both Desktop and Mobile
        try {
            const fileName = `TripWallet_Report_${Date.now()}.pdf`;
            
            // Standard jspdf save
            doc.save(fileName);
            
            // Mobile specific fallback logic
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank'; // Helpful for some mobile browsers
            
            // For iOS/Safari, sometimes opening in a new tab is the only way
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                window.open(url, '_blank');
            } else {
                link.click();
            }
            
            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 10000);
            
        } catch (err) {
            console.error("PDF download failed:", err);
            doc.output('dataurlnewwindow');
        }
    });
}

// Scroll Reveal Logic
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const revealTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveals[i].classList.add('active');
        }
    }
}

window.addEventListener('scroll', reveal);

// Trigger reveal once on load
reveal();

// Navigation Shadow on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '0.75rem 0';
        nav.style.boxShadow = 'var(--shadow-md)';
    } else {
        nav.style.padding = '1rem 0';
        nav.style.boxShadow = 'none';
    }
});

// Mobile Menu Toggle
const menuToggle = document.createElement('button');
menuToggle.className = 'menu-toggle';
menuToggle.innerHTML = '<i data-lucide="menu"></i>';
document.querySelector('nav .container').appendChild(menuToggle);
lucide.createIcons();

const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.setAttribute('data-lucide', 'x');
    } else {
        icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
});

// Close menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.querySelector('i').setAttribute('data-lucide', 'menu');
        lucide.createIcons();
    });
});

// Dashboard Sidebar Toggle
const dashMenuToggle = document.getElementById('dashboard-menu-toggle');
const aside = document.querySelector('aside');

if (dashMenuToggle && aside) {
    dashMenuToggle.addEventListener('click', () => {
        aside.classList.toggle('active');
        const icon = dashMenuToggle.querySelector('i');
        if (aside.classList.contains('active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });
}


// Hero Slider Logic
const slides = document.querySelectorAll('.hero-slide');
if (slides.length > 0) {
    let currentSlide = 0;
    const slideInterval = 7000; // 7 seconds

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, slideInterval);
}
