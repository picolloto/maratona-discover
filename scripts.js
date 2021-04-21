const Modal = {
    open() {
        document.
                querySelector('.modal-overlay')
                .classList
                .add('active');
    },
    close() {
        document.
                querySelector('.modal-overlay')
                .classList
                .remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || [];
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions));
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },
    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },
    incomes() {

        let income = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        });

        return income;
    },
    expenses() {
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        });

        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover a Transação" /></td>
        `;

        return html;
    },
    updateBalance() {
        document.getElementById('income-display')
            .innerHTML = Utils.formatCurrency(Transaction.incomes());

        document.getElementById('expense-display')
            .innerHTML = Utils.formatCurrency(Transaction.expenses());

        document.getElementById('total-display')
            .innerHTML = Utils.formatCurrency(Transaction.total());
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", { 
            style: "currency",
            currency: "BRL",
        });

        return signal + value;
    },
    formatAmount(value) {
        value = Number(value) * 100;
        return value;
    },
    formatDate(date) {
        const splitedDate = date.split("-");
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor preencha todos os campos");
        }
    },
    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date,
        }
    },
    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },
    submit(event) {
        event.preventDefault();
        
        try {
            Form.validateFields();
            const transaction = Form.formatValues();

            Transaction.add(transaction);

            Form.clearFields();

            Modal.close();

        } catch (error) {
            console.log(error.message);
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }

}

App.init();