function togglePassword() {
  const passwordInput = document.getElementById("password")
  const eyeIcon = document.getElementById("eye-icon")

  const isHidden = passwordInput.type === "password"
  passwordInput.type = isHidden ? "text" : "password"

  eyeIcon.className = isHidden ? "ph ph-eye-slash" : "ph ph-eye"
}

// 3. Nova função de login real com Supabase
async function loginUser() {
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()
  const errorDisplay = document.getElementById("login-error")

  // Hide any previous error
  errorDisplay.classList.remove("show")
  errorDisplay.textContent = ""

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    errorDisplay.textContent = "Email ou senha inválidos."
    errorDisplay.classList.add("show")
  } else {
    window.location.href = "index.html"
  }
}
