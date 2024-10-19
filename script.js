const methodButtons = document.querySelectorAll('.method-btn');
const paymentForms = document.querySelectorAll('.payment-form');
const amountInput = document.getElementById('amount');

// Alternar entre métodos de pagamento
methodButtons.forEach(button => {
    button.addEventListener('click', () => {
        const method = button.dataset.method;

        // Atualiza botões
        methodButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Exibe o formulário correto
        paymentForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${method}-form`) {
                form.classList.add('active');
            }
        });
    });
});

// Validação de valor de pagamento
document.querySelector('#card-payment-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const amount = amountInput.value;
    if (!amount || amount <= 0) {
        alert('Por favor, insira um valor válido.');
    } else {
        alert(`Pagamento de R$${amount} realizado com sucesso via Cartão!`);
    }
});

// Implementar comportamento do PIX e outras funcionalidades aqui
