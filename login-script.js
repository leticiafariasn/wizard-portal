const supabase = supabase.createClient(
  'https://evyjhdpzseecbeqxvuqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eWpoZHB6c2VlY2JlcXh2dXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTA3NTQsImV4cCI6MjA2NjM4Njc1NH0.xhcKqch-fwtJ2QcpPM9kil9CYtkuhvaAtJJXuWt4iMo'
);

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