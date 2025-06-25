function togglePassword() {
  const passwordInput = document.getElementById("password")
  const eyeIcon = document.getElementById("eye-icon")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    eyeIcon.textContent = "🙈"
  } else {
    passwordInput.type = "password"
    eyeIcon.textContent = "👁️"
  }
}

// 3. Nova função de login real com Supabase
async function loginUser() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDisplay = document.getElementById('login-error');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorDisplay.textContent = 'Email ou senha inválidos.';
  } else {
    window.location.href = 'index.html';
  }
}