export const firebaseConfig = {
  apiKey: 'AIzaSyBn1X0mQKKKgUMJjLhoSS4cd1PQ1MQreI',
  authDomain: 'doodh-tracker-bb78a.firebaseapp.com',
  projectId: 'doodh-tracker-bb78a',
  storageBucket: 'doodh-tracker-bb78a.firebasestorage.app',
  messagingSenderId: '192825303582',
  appId: '1:192825303582:web:117b441e6d2ba045d6040f',
}

export const isFirebaseConfigured: boolean = !Object.values(firebaseConfig).some((v) =>
  String(v).includes('PASTE_'),
)
