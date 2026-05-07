// Initialize state from localStorage
let budget = parseFloat(localStorage.getItem('tripBudget')) || 0;
let expenses = JSON.parse(localStorage.getItem('tripExpenses')) || [];
let currency = localStorage.getItem('tripCurrency') || 'Rs.';
let destination = localStorage.getItem('tripDestination') || '';

// DOM Elements
const budgetInput = document.getElementById('budget-input');
const setBudgetBtn = document.getElementById('set-budget-btn');
const tripDestinationInput = document.getElementById('trip-destination');
const currencySelect = document.getElementById('currency-select');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategoryInput = document.getElementById('expense-category');
const addExpenseBtn = document.getElementById('add-expense-btn');

const totalBudgetValue = document.getElementById('total-budget-value');
const totalExpensesValue = document.getElementById('total-expenses-value');
const remainingBalanceValue = document.getElementById('remaining-balance-value');
const expenseList = document.getElementById('expense-list');
const downloadInvoiceBtn = document.getElementById('download-invoice-btn');
const dashBudget = document.getElementById('dash-budget');
const dashSpent = document.getElementById('dash-spent');
const dashRemaining = document.getElementById('dash-remaining');
const dashRecentList = document.getElementById('dash-recent-list');
const dashWelcomeText = document.getElementById('dash-welcome-text');
const tripInfoDisplay = document.getElementById('trip-info-display');
const displayDestination = document.getElementById('display-destination');

// Budget & Destination Handling
if (setBudgetBtn) {
    setBudgetBtn.addEventListener('click', () => {
        const val = parseFloat(budgetInput.value);
        const dest = tripDestinationInput.value.trim();
        
        if (!isNaN(val) && val > 0) {
            budget = val;
            destination = dest;
            updateUI();
            budgetInput.value = '';
            tripDestinationInput.value = '';
        } else {
            alert('Please enter a valid budget amount');
        }
    });
}

// Currency Handling
if (currencySelect) {
    currencySelect.value = currency;
    currencySelect.addEventListener('change', (e) => {
        currency = e.target.value;
        localStorage.setItem('tripCurrency', currency);
        updateUI();
    });
}

// Expense Handling
if (addExpenseBtn) {
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
}

function clearExpenseForm() {
    if (expenseNameInput) expenseNameInput.value = '';
    if (expenseAmountInput) expenseAmountInput.value = '';
    if (expenseCategoryInput) expenseCategoryInput.selectedIndex = 0;
}

function updateUI() {
    // Save to localStorage
    localStorage.setItem('tripBudget', budget);
    localStorage.setItem('tripExpenses', JSON.stringify(expenses));
    localStorage.setItem('tripDestination', destination);

    // Update Stats
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = budget - totalExpenses;

    // Update Destination Display
    if (tripInfoDisplay && displayDestination) {
        if (destination) {
            tripInfoDisplay.style.display = 'block';
            displayDestination.innerText = `Trip to ${destination}`;
        } else {
            tripInfoDisplay.style.display = 'none';
        }
    }

    if (totalBudgetValue) totalBudgetValue.innerText = `${currency} ${budget.toLocaleString()}`;
    if (totalExpensesValue) totalExpensesValue.innerText = `${currency} ${totalExpenses.toLocaleString()}`;
    if (remainingBalanceValue) remainingBalanceValue.innerText = `${currency} ${remaining.toLocaleString()}`;

    // Sync Dashboard Stats
    if (dashBudget) dashBudget.innerText = `${currency} ${budget.toLocaleString()}`;
    if (dashSpent) dashSpent.innerText = `${currency} ${totalExpenses.toLocaleString()}`;
    if (dashRemaining) {
        dashRemaining.innerText = `${currency} ${remaining.toLocaleString()}`;
        dashRemaining.style.color = remaining < 0 ? '#ef4444' : 'var(--accent)';
    }

    if (dashWelcomeText && destination) {
        dashWelcomeText.innerText = `Currently exploring ${destination}. You have 2 active trips.`;
    }

    // Color feedback for balance
    if (remainingBalanceValue) {
        const balanceCard = remainingBalanceValue.parentElement;
        if (remaining < 0) {
            balanceCard.classList.add('negative');
            balanceCard.classList.remove('positive');
        } else if (remaining > 0) {
            balanceCard.classList.add('positive');
            balanceCard.classList.remove('negative');
        }
    }

    // Show/Hide Buttons
    if (downloadInvoiceBtn) {
        downloadInvoiceBtn.style.display = expenses.length > 0 ? 'flex' : 'none';
    }

    // Update List
    renderExpenses();
}

function renderExpenses() {
    if (!expenseList) return;
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
            <div class="expense-amount">-${currency} ${expense.amount.toLocaleString()}</div>
        `;
        expenseList.appendChild(card);
    });

    // Update Dashboard Recent Activity
    if (dashRecentList) {
        dashRecentList.innerHTML = '';
        if (expenses.length === 0) {
            dashRecentList.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">No recent transactions</p>';
        } else {
            expenses.slice(-5).reverse().forEach(expense => {
                const item = document.createElement('div');
                item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border);';
                item.innerHTML = `
                    <div>
                        <div style="font-weight: 600;">${expense.name}</div>
                        <div style="font-size: 0.8rem; color: var(--muted);">${expense.category} • ${expense.date}</div>
                    </div>
                    <div style="font-weight: 700; color: #ef4444;">-${currency} ${expense.amount.toLocaleString()}</div>
                `;
                dashRecentList.appendChild(item);
            });
        }
    }
}

// Official Invoice Functionality
if (downloadInvoiceBtn) {
    downloadInvoiceBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Formal Header
        doc.setFontSize(28);
        doc.setTextColor(30, 41, 59); // Dark Slate
        doc.text("INVOICE", 140, 30);
        
        doc.setFontSize(16);
        doc.setTextColor(124, 58, 237); // Primary Violet
        doc.text("TripWallet", 14, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Lda Avenue, Lahore", 14, 32);
        doc.text("Pakistan", 14, 37);
        doc.text("support@tripwallet.com", 14, 42);

        // Invoice Info
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Bill To:", 14, 60);
        doc.setFont("Helvetica", "bold");
        doc.text("Valued Traveler", 14, 66);
        doc.setFont("Helvetica", "normal");
        if (destination) {
            doc.text(`Destination: ${destination}`, 14, 72);
        }
        
        doc.text("Invoice #:", 140, 60);
        doc.text(`TW-${Date.now().toString().slice(-6)}`, 170, 60);
        doc.text("Date:", 140, 66);
        doc.text(new Date().toLocaleDateString(), 170, 66);

        // Table
        const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        const tableData = expenses.map(exp => [
            exp.name,
            exp.category,
            exp.date,
            `${currency} ${exp.amount.toLocaleString()}`
        ]);

        doc.autoTable({
            startY: 80,
            head: [['Description', 'Category', 'Date', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 5 },
            columnStyles: { 3: { halign: 'right' } }
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.text("Grand Total:", 140, finalY);
        doc.text(`${currency} ${totalSpent.toLocaleString()}`, 196, finalY, { align: 'right' });

        // Terms and Conditions
        const tcY = finalY + 30;
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text("Terms and Conditions", 14, tcY);
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont("Helvetica", "normal");
        const tcText = [
            "1. This document is a generated expense summary for personal record-keeping.",
            "2. TripWallet is not responsible for the accuracy of manually entered data.",
            "3. Currency conversions shown are based on the rates at the time of entry.",
            "4. This is an electronically generated document and does not require a signature.",
            "5. For support or disputes, please contact hello@tripwallet.com."
        ];
        doc.text(tcText, 14, tcY + 7);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(124, 58, 237);
        doc.text("Thank you for using TripWallet!", 105, 280, { align: 'center' });

        // Universal Download Fallback
        const fileName = `Invoice_TripWallet_${Date.now()}.pdf`;
        try {
            doc.save(fileName);
        } catch (e) {
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

// Initial UI trigger to load persisted data
document.addEventListener('DOMContentLoaded', updateUI);
