// Initialize Firebase
const firebaseConfig = {
  // Your Firebase configuration goes here
};

firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// User Authentication
async function signIn(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    // User is signed in
  } catch (error) {
    console.error('Error signing in:', error);
  }
}

async function signOut() {
  try {
    await auth.signOut();
    // User is signed out
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

// X.com OAuth Login
async function loginWithX() {
  const provider = new firebase.auth.TwitterAuthProvider();
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    console.log('X.com login successful:', user);

    // Store the access token and secret for later use
    const credential = result.credential;
    const token = credential.accessToken;
    const secret = credential.secret;
    
    // Save tokens to Firestore for posting later
    await db.collection('users').doc(user.uid).set({ token, secret });
    
  } catch (error) {
    console.error('Error during X.com login:', error);
  }
}

// Firestore Operations
async function savePost(post) {
  try {
    await db.collection('posts').add(post);
    // Post saved successfully
  } catch (error) {
    console.error('Error saving post:', error);
  }
}

async function getScheduledPosts() {
  try {
    const snapshot = await db.collection('posts').where('scheduled', '==', true).get();
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Error getting scheduled posts:', error);
    return [];
  }
}

// Schedule a post
function schedulePost(post) {
  // Schedule the post for future date/time
  setTimeout(() => {
    postToSocialMedia(post);
  }, post.scheduleTimestamp - Date.now());
}

// Post to X.com
function postToX(token, secret, caption) {
  // Call your backend server or Firebase Function to post to X.com
  fetch('https://your-cloud-function-url/post-to-x', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      secret,
      caption
    })
  }).then(response => response.json())
    .then(data => console.log('Posted to X:', data))
    .catch(error => console.error('Error posting to X:', error));
}

// Post to social media
async function postToSocialMedia(post) {
  const user = firebase.auth().currentUser;
  const doc = await db.collection('users').doc(user.uid).get();
  const { token, secret } = doc.data();

  // For now, only posting to X.com
  if (post.selectedAccounts.includes('x')) {
    postToX(token, secret, post.caption);
  }
}

// Event Listeners
document.getElementById('post-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const caption = document.getElementById('caption').value;
  const selectedAccounts = Array.from(document.querySelectorAll('#social-accounts input[type="checkbox"]:checked'))
    .map((checkbox) => checkbox.id.replace('account-', ''));
  const scheduleDate = document.getElementById('schedule-date').value;

  const post = {
    caption,
    selectedAccounts,
    scheduled: scheduleDate !== '',
    scheduleTimestamp: scheduleDate ? new Date(scheduleDate).getTime() : null,
  };

  await savePost(post);

  if (scheduleDate) {
    schedulePost(post);
  } else {
    postToSocialMedia(post);
  }

  // Clear the form
  document.getElementById('post-form').reset();
});

document.getElementById('schedule-btn').addEventListener('click', () => {
  document.getElementById('schedule-date').classList.toggle('visible');
});

// X.com login event listener
document.getElementById('login-x-btn').addEventListener('click', loginWithX);
