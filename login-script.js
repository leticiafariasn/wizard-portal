// Import Supabase client
const { createClient } = require("@supabase/supabase-js")
const supabaseUrl = "https://lvnrcpgxthclijsbgzgx.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bnJjcGd4dGhjbGlqc2Jnemd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4ODQ3MDksImV4cCI6MjA2NjQ2MDcwOX0.c0NHaK5m27x9OsjKzUyfdY5NSK-wt4UEXai_mwrE2hg"
const supabase = createClient(supabaseUrl, supabaseKey)

function togglePassword() {
  const passwordInput = document.getElementById("password")
  const eyeIcon = document.getElementById("eye-icon")

  const isHidden = passwordInput.type === "password"
  passwordInput.type = isHidden ? "text" : "password"

  eyeIcon.className = isHidden ? "ph ph-eye-slash" : "ph ph-eye"
}

// Substituir a função loginUser() com autenticação customizada usando nossa tabela auth_users

async function loginUser() {
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()
  const errorDisplay = document.getElementById("login-error")

  // Hide any previous error
  errorDisplay.classList.remove("show")
  errorDisplay.textContent = ""

  if (!email || !password) {
    errorDisplay.textContent = "Por favor, preencha todos os campos."
    errorDisplay.classList.add("show")
    return
  }

  try {
    // Usar Supabase Auth nativo
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      console.error("Login error:", error)
      errorDisplay.textContent = "Email ou senha inválidos."
      errorDisplay.classList.add("show")
      return
    }

    if (data.user) {
      console.log("Login successful:", data.user.email)
      // Redirecionar para a página principal
      window.location.href = "index.html"
    }
  } catch (error) {
    console.error("Login error:", error)
    errorDisplay.textContent = "Erro inesperado. Tente novamente."
    errorDisplay.classList.add("show")
  }
}
