// Configuração do Firebase
const firebaseConfig = {
    // Suas configurações do Firebase aqui
};

// Inicialização do Firebase
firebase.initializeApp(firebaseConfig);
const functions = firebase.functions();

// Elementos do DOM
const methodButtons = document.querySelectorAll('.method-btn');
const paymentForms = document.querySelectorAll('.payment-form');
const paymentForm = document.getElementById('payment-form');
const copyPixButton = document.getElementById('copy-pix');
const loadingOverlay = document.getElementById('loading-overlay');
const messageBox = document.getElementById('message-box');

// Validadores
const validators = {
    cardNumber: (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.length === 16;
    },
    cardName: (value) => {
        return value.trim().split(' ').length >= 2;
    },
    cardExpiry: (value) => {
        const [month, year] = value.split('/');
        if (!month || !year) return false;
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        return expiry > new Date();
    },
    cardCvv: (value) => {
        return /^\d{3}$/.test(value);
    }
};

// Formatadores
const formatters = {
    cardNumber: (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{4})/g, '$1 ').trim();
    },
    cardExpiry: (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length >= 2) {
            return `${numbers.slice(0,2)}/${numbers.slice(2,4)}`;
        }
        return numbers;
    }
};

// Event Listeners
methodButtons.forEach(button => {
    button.addEventListener('click', () => {
        const method = button.dataset.method;
        
        // Atualiza botões
        methodButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Atualiza formulários
        paymentForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${method}-form`) {
                form.classList.add('active');
            }
        });
    });
});

// Formata inputs do cartão
document.getElementById('card-number').addEventListener('input', (e) => {
    e.target.value = formatters.cardNumber(e.target.value);
});

document.getElementById('card-expiry').addEventListener('input', (e) => {
    e.target.value = formatters.cardExpiry(e.target.value);
});

document.getElementById('card-cvv').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Processa pagamento com cartão
paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        cardNumber: document.getElementById('card-number').value,
        cardName: document.getElementById('card-name').value,
        cardExpiry: document.getElementById('card-expiry').value,
        cardCvv: document.getElementById('card-cvv').value,
        installments: document.getElementById('installments').value
    };

    // Validação
    let isValid = true;
    Object.keys(validators).forEach(field => {
        const value = formData[field];
        if (!validators[field](value)) {
            isValid = false;
            showMessage(`${field} inválido`, 'error');
        }
    });

    if (!isValid) return;

    try {
        showLoading(true);
        
        // Chama função do Firebase
        const processPayment = functions.httpsCallable('processPayment');
        const result = await processPayment({
            method: 'card',
            ...formData
        });

        if (result.data.success) {
            showMessage('Pagamento realizado com sucesso!', 'success');
            paymentForm.reset();
        } else {
            throw new Error(result.data.message);
        }
    } catch (error) {
        showMessage(error.message || 'Erro ao processar pagamento', 'error');
    } finally {
        showLoading(false);
    