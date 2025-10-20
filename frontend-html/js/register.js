// Register page logic
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  const isAuth0Logged = await Auth.isAuth0Authenticated();
  if (isAuth0Logged || Auth.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('registerForm');
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');
  const auth0SignupBtn = document.getElementById('auth0SignupBtn');
  const passwordInput = document.getElementById('password');
  const passwordStrengthBar = document.getElementById('passwordStrengthBar');
  const passwordHint = document.getElementById('passwordHint');

  // Password strength checker
  function checkPasswordStrength(password) {
    let strength = 0;
    let hints = [];

    if (password.length >= 8) strength += 25;
    else hints.push('at least 8 characters');

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    else hints.push('uppercase and lowercase letters');

    if (/\d/.test(password)) strength += 25;
    else hints.push('numbers');

    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    else hints.push('special characters');

    return { strength, hints };
  }

  // Update password strength indicator
  passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const { strength, hints } = checkPasswordStrength(password);

    passwordStrengthBar.style.width = `${strength}%`;

    if (strength <= 25) {
      passwordStrengthBar.style.background = '#ef4444'; // red
      passwordHint.textContent = `Weak password. Add: ${hints.join(', ')}`;
      passwordHint.style.color = '#ef4444';
    } else if (strength <= 50) {
      passwordStrengthBar.style.background = '#f59e0b'; // orange
      passwordHint.textContent = `Fair password. Add: ${hints.join(', ')}`;
      passwordHint.style.color = '#f59e0b';
    } else if (strength <= 75) {
      passwordStrengthBar.style.background = '#3b82f6'; // blue
      passwordHint.textContent = 'Good password!';
      passwordHint.style.color = '#3b82f6';
    } else {
      passwordStrengthBar.style.background = '#10b981'; // green
      passwordHint.textContent = 'Strong password!';
      passwordHint.style.color = '#10b981';
    }
  });

  // Auth0 Signup Button
  auth0SignupBtn.addEventListener('click', async () => {
    try {
      Utils.showLoading(auth0SignupBtn);
      await Auth.auth0Signup();
    } catch (error) {
      Utils.hideLoading(auth0SignupBtn);
      Utils.showError(messageDiv, 'Auth0 signup failed. Please try again.');
      console.error('Auth0 signup error:', error);
    }
  });

  // Traditional Email/Password Registration
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    Utils.clearMessages(messageDiv);

    const formData = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };

    // Add optional fields only if they have values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const entity = document.getElementById('entity').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();

    if (firstName) formData.firstName = firstName;
    if (lastName) formData.lastName = lastName;
    if (phoneNumber) formData.phoneNumber = phoneNumber;
    if (entity) formData.entity = entity;
    if (jobTitle) formData.jobTitle = jobTitle;

    // Validate password strength
    const { strength } = checkPasswordStrength(formData.password);
    if (strength < 50) {
      Utils.showError(messageDiv, 'Please use a stronger password.');
      return;
    }

    Utils.showLoading(submitBtn);

    try {
      const response = await API.post(ENDPOINTS.REGISTER, formData);

      // Store token and user data
      Auth.setToken(response.access_token);
      Auth.setUser(response.user);

      Utils.showSuccess(messageDiv, 'Account created successfully! Redirecting...');

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    } catch (error) {
      Utils.hideLoading(submitBtn);
      Utils.showError(messageDiv, error.message || 'Registration failed. Please try again.');
    }
  });
});
