


const firebaseConfig = {
    apiKey: "AIzaSyDKJCJB8rViikfupfBS6nO0XnsZ_1FAeXc",
    authDomain: "computationaldesignworkflows.firebaseapp.com",
    databaseURL: "https://computationaldesignworkflows-default-rtdb.firebaseio.com",
    projectId: "computationaldesignworkflows",
    storageBucket: "computationaldesignworkflows.appspot.com",
    messagingSenderId: "894449322629",
    appId: "1:894449322629:web:dfa44317e913e599d1b7ec",
    measurementId: "G-287V7VXB6B"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const pollRef = db.ref('poll');

const options = ['a', 'b', 'c'];

options.forEach(option => {
    db.ref(`poll/${option}`).on('value', snapshot => {
        document.getElementById(`${option}-count`).textContent = snapshot.val() || 0;
        updateTotalVotes();
    });
});

function vote(option) {
    const ref = db.ref(`poll/${option}`);
    ref.once('value').then(snapshot => {
        const count = snapshot.val() || 0;
        ref.set(count + 1);
    });
}

function updateTotalVotes() {
    Promise.all(options.map(option =>
        db.ref(`poll/${option}`).once('value').then(s => s.val() || 0)
    )).then(counts => {
        const total = counts.reduce((a, b) => a + b, 0);
        document.getElementById('total-votes').textContent = total;
    });
}

const statusDiv = document.getElementById('connection-status');

function renderStatus(status) {
    let color, text, animate = true, textColor;

    if (status === 'connected') { //connected
        color = '5, 150, 105'; // green
        text = 'CONNECTED';
        textColor = '5, 150, 105';
    } else if (status === 'connecting') { //connecting
        color = '234, 179, 8'; // yellow
        text = 'CONNECTING...';
        textColor = '234, 179, 8';
    } else {
        color = '185, 28, 28'; // red
        text = 'DISCONNECTED';
        textColor = '185, 28, 28';
        animate = false;
    }

    statusDiv.innerHTML = `
    <div class="status__icon${animate === false ? ' no-pulse' : ''}" style="--background: ${color}"></div>
    <span style="color: rgb(${textColor})">FIREBASE: ${text}</span>
  `;

}


// Set initial state
renderStatus('connecting');

// Then monitor connection
db.ref('.info/connected').on('value', snapshot => {
    const isConnected = snapshot.val();
    renderStatus(isConnected ? 'connected' : 'disconnected');
});


pollRef.once('value').then(snapshot => {
    if (!snapshot.exists()) {
        const init = {};
        options.forEach(opt => init[opt] = 0);
        return pollRef.set(init);
    }
});
