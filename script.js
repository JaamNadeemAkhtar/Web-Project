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


