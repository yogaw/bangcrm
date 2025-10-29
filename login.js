document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Only accept "elvira" as both email and password
    if (email === 'elvira' && password === 'elvira') {
      // Store the login state if remember is checked
      if (remember) {
        localStorage.setItem('bangCRM_loggedIn', 'true');
        localStorage.setItem('bangCRM_email', email);
      } else {
        sessionStorage.setItem('bangCRM_loggedIn', 'true');
        sessionStorage.setItem('bangCRM_email', email);
      }
      
      // Redirect to dashboard
      window.location.href = 'index.html';
    } else {
      // Show error for invalid credentials
      alert('Invalid email or password');
    }
  });
  
  // Check if user is already logged in
  const isLoggedIn = localStorage.getItem('bangCRM_loggedIn') || sessionStorage.getItem('bangCRM_loggedIn');
  if (isLoggedIn === 'true') {
    // Redirect to dashboard if already logged in
    window.location.href = 'index.html';
  }
});