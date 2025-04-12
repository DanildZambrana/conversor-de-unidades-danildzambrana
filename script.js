document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const swapBtn = document.getElementById('swap-btn');
    const convertBtn = document.getElementById('convert-btn');
    const convertedAmount = document.getElementById('converted-amount');
    const exchangeRate = document.getElementById('exchange-rate');

    initApp();

    function initApp() {
        if (!amountInput.value) {
            amountInput.value = "1";
        }

        convertCurrency();

        document.querySelectorAll('.animated-icon').forEach(icon => {
            icon.style.opacity = '1';
        });
    }

    // Función para obtener las tasas de cambio
    async function getExchangeRate(from, to) {
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.rates[to];
        } catch (error) {
            console.error('Error al obtener las tasas de cambio:', error);
            return null;
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            convertBtn.disabled = true;
            convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
            convertedAmount.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            exchangeRate.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Convertir';
        }
    }

    // Función para realizar la conversión
    async function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        const from = fromCurrency.value;
        const to = toCurrency.value;

        if (isNaN(amount) || amount <= 0) {
            showNotification('Por favor, ingrese una cantidad válida', 'error');
            return;
        }

        setLoading(true);

        try {
            const rate = await getExchangeRate(from, to);
            if (rate) {
                const result = (amount * rate).toFixed(2);

                convertedAmount.classList.remove('fadeIn');
                exchangeRate.classList.remove('fadeIn');

                void convertedAmount.offsetWidth;
                void exchangeRate.offsetWidth;

                convertedAmount.textContent = result;
                exchangeRate.textContent = rate.toFixed(4);

                convertedAmount.classList.add('fadeIn');
                exchangeRate.classList.add('fadeIn');

                showNotification('Conversión realizada con éxito', 'success');
            } else {
                showNotification('Error al obtener las tasas de cambio. Por favor, intente nuevamente.', 'error');
            }
        } catch (error) {
            showNotification('Error en la conversión: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    function showNotification(message, type) {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Función para intercambiar las monedas
    function swapCurrencies() {
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;

        fromCurrency.classList.add('highlight');
        toCurrency.classList.add('highlight');

        setTimeout(() => {
            fromCurrency.classList.remove('highlight');
            toCurrency.classList.remove('highlight');
        }, 1000);

        convertCurrency();
    }

    // Event Listeners
    convertBtn.addEventListener('click', convertCurrency);
    swapBtn.addEventListener('click', swapCurrencies);

    let debounceTimer;
    const debounce = (callback, time) => {
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(callback, time);
    };

    amountInput.addEventListener('input', () => {
        debounce(convertCurrency, 500);
    });

    fromCurrency.addEventListener('change', convertCurrency);
    toCurrency.addEventListener('change', convertCurrency);
});
