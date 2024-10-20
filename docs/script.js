```javascript
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

// Scheduling
function schedulePost(post) {
  // Schedule the post based on the provided date/time
  setTimeout(() => {
    // Post the content to the selected social media accounts
    postToSocialMedia(post);
  }, post.scheduleTimestamp - Date.now());
}

function postToSocialMedia(post) {
  // Implement the logic to post the content to the selected social media accounts
  // (e.g., make API calls to x.com, update the post status in Firestore)
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
    // Post the content to the selected social media accounts
    postToSocialMedia(post);
  }

  // Clear the form
  document.getElementById('post-form').reset();
});

document.getElementById('schedule-btn').addEventListener('click', () => {
  document.getElementById('schedule-date').classList.toggle('visible');
});
```
