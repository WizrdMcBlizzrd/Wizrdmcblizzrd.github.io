const SELLER_BTC_ADDRESS = 'your-testnet-btc-address'; // Update to Mainnet later
const API_URL = 'https://mempool.space/testnet/api'; // Update to https://mempool.space/api for Mainnet

const paymentQueue = [];
let isProcessing = false;

async function loadOrdinals() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';
    try {
        const response = await fetch('ordinals.json');
        const ordinals = await response.json();
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        ordinals.forEach(ordinal => {
            if (ordinal.sold) return;
            const div = document.createElement('div');
            div.className = 'ordinal';
            div.innerHTML = `
                <img src="${ordinal.image}" alt="${ordinal.name}">
                <h3>${ordinal.name}</h3>
                <p>${ordinal.description}</p>
                <p class="price">${ordinal.price} BTC</p>
                <button class="buy-btn" onclick="buyOrdinal('${ordinal.id}', '${ordinal.name}', ${ordinal.price}, '${ordinal.txid}', ${ordinal.vout})" ${ordinal.sold ? 'disabled' : ''}>Buy Now</button>
            `;
            gallery.appendChild(div);
        });
    } catch (err) {
        console.error('Error loading ordinals:', err);
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

document.getElementById('connectBtn').addEventListener('click', async () => {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';
    try {
        const result = await window.satsConnect.request('getAccounts', {
            purposes: ['ordinals', 'payment'],
            message: 'Connect to buy Ordinals by WizrdMcBlizzrd'
        });
        const address = result.accounts.find(acc => acc.purpose === 'ordinals').address;
        document.getElementById('userAddress').textContent = `Connected: ${address}`;
        document.getElementById('connectBtn').disabled = true;
        localStorage.setItem('userAddress', address);
    } catch (err) {
        alert('Wallet connect failed: ' + err.message + '. Install Xverse or Unisat.');
    } finally {
        loadingSpinner.style.display = 'none';
    }
});

async function buyOrdinal(id, name, price, txid, vout) {
    const userAddress = localStorage.getItem('userAddress');
    if (!userAddress) return alert('Connect wallet first!');
    
    let ordinals = JSON.parse(localStorage.getItem('ordinals') || JSON.stringify(await (await fetch('ordinals.json')).json()));
    const ordinal = ordinals.find(o => o.id === id);
    if (!ordinal || ordinal.sold) return alert('Ordinal unavailable');
    ordinal.locked = true;
    localStorage.setItem('ordinals', JSON.stringify(ordinals));
    
    document.getElementById('payAmount').textContent = price;
    document.getElementById('payOrdinal').textContent = name;
    document.getElementById('payAddress').textContent = SELLER_BTC_ADDRESS;
    localStorage.setItem('buyData', JSON.stringify({ id, name, price, txid, vout, userAddress }));
    document.getElementById('paymentModal').style.display = 'flex';
}

document.getElementById('sendPayment').addEventListener('click', async () => {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';
    const buyData = JSON.parse(localStorage.getItem('buyData'));
    if (!buyData) return alert('No purchase data');
    
    try {
        const amountSats = Math.floor(buyData.price * 100000000);
        await window.satsConnect.request('sendTransaction', {
            toAddress: SELLER_BTC_ADDRESS,
            amount: amountSats,
            purpose: 'payment'
        });
        alert('Payment sent! Paste the transaction ID.');
        document.getElementById('sendPayment').disabled = true;
    } catch (err) {
        alert('Payment failed: ' + err.message);
    } finally {
        loadingSpinner.style.display = 'none';
    }
});

document.getElementById('confirmPay').addEventListener('click', async () => {
    const txId = document.getElementById('txId').value.trim();
    const buyData = JSON.parse(localStorage.getItem('buyData'));
    if (!txId || !buyData) return alert('Missing tx ID or purchase data');
    
    paymentQueue.push({ txId, ...buyData });
    processQueue();
});

async function processQueue() {
    if (isProcessing || !paymentQueue.length) return;
    isProcessing = true;
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';
    
    const { txId, id, name, price, txid: ordinalTxid, vout, userAddress } = paymentQueue.shift();
    
    try {
        const res = await fetch(`${API_URL}/tx/${txId}`);
        if (!res.ok) throw new Error('Tx not found');
        const tx = await res.json();
        const amountSats = price * 100000000;
        const paid = tx.vout.some(v => v.scriptpubkey_address === SELLER_BTC_ADDRESS && v.value >= amountSats);
        if (!paid || !tx.status.confirmed) throw new Error('Payment invalid or unconfirmed');
        
        let ordinals = JSON.parse(localStorage.getItem('ordinals'));
        const ordinal = ordinals.find(o => o.id === id);
        ordinal.sold = true;
        ordinal.locked = false;
        localStorage.setItem('ordinals', JSON.stringify(ordinals));
        
        document.getElementById('transferOrdinal').textContent = name;
        document.getElementById('transferAddress').textContent = userAddress;
        document.getElementById('transferTxid').textContent = ordinalTxid;
        document.getElementById('transferVout').textContent = vout;
        document.getElementById('paymentModal').style.display = 'none';
        document.getElementById('transferModal').style.display = 'flex';
        
        loadOrdinals();
    } catch (err) {
        alert('Error: ' + err.message);
        let ordinals = JSON.parse(localStorage.getItem('ordinals'));
        const ordinal = ordinals.find(o => o.id === id);
        if (ordinal) ordinal.locked = false;
        localStorage.setItem('ordinals', JSON.stringify(ordinals));
    } finally {
        loadingSpinner.style.display = 'none';
        isProcessing = false;
        processQueue();
    }
}

document.getElementById('closeTransfer').addEventListener('click', () => {
    document.getElementById('transferModal').style.display = 'none';
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('sendPayment').disabled = false;
    const buyData = JSON.parse(localStorage.getItem('buyData'));
    if (buyData) {
        let ordinals = JSON.parse(localStorage.getItem('ordinals'));
        const ordinal = ordinals.find(o => o.id === buyData.id);
        if (ordinal) ordinal.locked = false;
        localStorage.setItem('ordinals', JSON.stringify(ordinals));
    }
});

loadOrdinals();