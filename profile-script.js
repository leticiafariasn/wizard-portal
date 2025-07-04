let currentUser = null
let currentSection = "frequencia"
let selectedClass = null
let selectedStudent = null
let classesData = []

// Initialize supabase - use the same instance as other files
const supabase = window.supabase

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  checkAuthAndLoadUser()
  loadClassesFromDatabase()
  // Force load frequency section after a small delay to ensure DOM is ready
  setTimeout(() => {
    showSection("frequencia")
  }, 500)
})

async function loadClassesFromDatabase() {
  try {
    console.log("Loading classes from database...")

    // First, let's try a simple query to test connection
    const { data: testData, error: testError } = await supabase.from("classes").select("*").limit(1)

    if (testError) {
      console.error("Test query error:", testError)
      throw testError
    }

    console.log("Test query successful:", testData)

    // Now fetch classes with their students
    const { data: classes, error: classError } = await supabase
      .from("classes")
      .select(`
        id,
        name,
        students (
          id,
          name
        )
      `)
      .order("name")

    if (classError) {
      console.error("Error fetching classes:", classError)
      // Fallback: try to get classes without students first
      const { data: classesOnly, error: classOnlyError } = await supabase
        .from("classes")
        .select("id, name")
        .order("name")

      if (classOnlyError) {
        throw classOnlyError
      }

      // Then get students separately
      const { data: students, error: studentsError } = await supabase.from("students").select("id, name, class_id")

      if (studentsError) {
        throw studentsError
      }

      // Combine the data manually
      classesData = classesOnly.map((classItem) => ({
        id: classItem.id,
        name: classItem.name,
        students: students
          .filter((student) => student.class_id === classItem.id)
          .map((student) => ({
            id: student.id,
            name: student.name,
            attendance: {},
          })),
      }))
    } else {
      // Transform data to match our existing structure
      classesData = classes.map((classItem) => ({
        id: classItem.id,
        name: classItem.name,
        students: (classItem.students || []).map((student) => ({
          id: student.id,
          name: student.name,
          attendance: {},
        })),
      }))
    }

    console.log("Classes loaded successfully:", classesData)

    // Refresh the content if we're on the frequency section
    if (currentSection === "frequencia") {
      loadSectionContent("frequencia")
    }
  } catch (error) {
    console.error("Error loading classes:", error)

    // Show error message to user
    const contentBody = document.getElementById("contentBody")
    if (contentBody) {
      contentBody.innerHTML = `
        <div class="section-content">
          <h3 class="section-title">
            <i class="ph ph-warning"></i>
            Erro ao Carregar Dados
          </h3>
          <div style="text-align: center; padding: 40px;">
            <i class="ph ph-warning-circle" style="font-size: 48px; color: #ef4444; margin-bottom: 20px;"></i>
            <p style="color: #ef4444; margin-bottom: 10px;">Não foi possível carregar os dados das turmas.</p>
            <p style="color: #cccccc; font-size: 14px;">Erro: ${error.message || "Erro desconhecido"}</p>
            <button class="btn-action" onclick="loadClassesFromDatabase()" style="margin-top: 20px;">
              <i class="ph ph-arrow-clockwise"></i>
              Tentar Novamente
            </button>
          </div>
        </div>
      `
    }
  }
}

// Atualizar a função checkAuthAndLoadUser() para usar Supabase Auth:

async function checkAuthAndLoadUser() {
  try {
    // Add a small delay to ensure DOM is fully loaded
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Verificar se há usuário logado no Supabase Auth
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (!user || error) {
      console.log("No user found, redirecting to login")
      redirectToLogin()
      return
    }

    // User is authenticated, load their data
    currentUser = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.full_name || user.email || "Usuário",
      role: user.user_metadata?.role || "Professor",
    }

    console.log("User authenticated:", currentUser.username)
    document.getElementById("userName").textContent = currentUser.username
    document.getElementById("userRole").textContent = currentUser.role
  } catch (error) {
    console.error("Error checking authentication:", error)
    redirectToLogin()
  }
}

function redirectToLogin() {
  console.log("Redirecting to login...")
  window.location.href = "login.html"
}

function showSection(section, event) {
  currentSection = section
  selectedClass = null
  selectedStudent = null

  // Update active navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Find the clicked nav item and make it active
  if (event) {
    const clickedItem = event.target.closest(".nav-item")
    if (clickedItem) {
      clickedItem.classList.add("active")
    }
  } else {
    // If no event, find the nav item by section name
    const navItems = document.querySelectorAll(".nav-item")
    navItems.forEach((item) => {
      const navText = item.querySelector(".nav-text")
      if (navText && navText.textContent.toLowerCase().includes(section.toLowerCase())) {
        item.classList.add("active")
      }
    })
  }

  // Update title and content
  const titles = {
    frequencia: "Frequência",
    boletim: "Boletim",
    reposicoes: "Reposições",
    "banco-horas": "Banco de Horas",
    documentos: "Documentos",
  }

  document.getElementById("sectionTitle").textContent = titles[section]
  loadSectionContent(section)
}

function loadSectionContent(section) {
  const contentBody = document.getElementById("contentBody")

  switch (section) {
    case "frequencia":
      contentBody.innerHTML = getFrequenciaContent()
      break
    case "boletim":
      contentBody.innerHTML = getBoletimContent()
      break
    case "reposicoes":
      contentBody.innerHTML = getReposicoesContent()
      break
    case "banco-horas":
      contentBody.innerHTML = getBancoHorasContent()
      break
    case "documentos":
      contentBody.innerHTML = getDocumentosContent()
      break
  }
}

function getFrequenciaContent() {
  if (selectedStudent) {
    return getStudentDashboard()
  } else if (selectedClass) {
    return getClassAttendanceContent()
  } else {
    return getClassSelectionContent()
  }
}

function getClassSelectionContent() {
  if (classesData.length === 0) {
    return `
      <div class="section-content">
        <h3 class="section-title">
          <i class="ph ph-chart-bar"></i>
          Carregando Turmas...
        </h3>
        <div style="text-align: center; padding: 40px;">
          <i class="ph ph-spinner" style="font-size: 48px; color: #cf1c29; animation: spin 1s linear infinite;"></i>
          <p style="margin-top: 20px; color: #cccccc;">Carregando dados das turmas...</p>
        </div>
      </div>
    `
  }

  return `
    <div class="section-content">
      <h3 class="section-title">
        <i class="ph ph-chart-bar"></i>
        Selecionar Turma
      </h3>
      <div class="class-grid">
        ${classesData
          .map(
            (classItem) => `
          <div class="class-card" onclick="selectClass(${classItem.id})">
            <div class="class-header">
              <i class="ph ph-users"></i>
              <h4>${classItem.name}</h4>
            </div>
            <div class="class-info">
              <span class="student-count">${classItem.students.length} alunos</span>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `
}

function getClassAttendanceContent() {
  const classData = classesData.find((c) => c.id === selectedClass)
  if (!classData) return getClassSelectionContent()

  const today = new Date().toISOString().split("T")[0]

  return `
    <div class="section-content">
      <div class="attendance-header">
        <button class="btn-back" onclick="backToClassSelection()">
          <i class="ph ph-arrow-left"></i>
          Voltar às Turmas
        </button>
        <h3 class="section-title">
          <i class="ph ph-chart-bar"></i>
          ${classData.name}
        </h3>
        <button class="btn-action" onclick="showAddStudentModal()">
          <i class="ph ph-plus"></i>
          Adicionar Aluno
        </button>
      </div>
      
      <div class="attendance-controls">
        <div class="date-selector">
          <label for="attendanceDate">Data:</label>
          <input type="date" id="attendanceDate" value="${today}" onchange="updateAttendanceDate()">
        </div>
        <button class="btn-save-attendance" onclick="saveAttendance()">
          <i class="ph ph-floppy-disk"></i>
          Salvar Frequência
        </button>
      </div>

      <div class="students-list">
        ${classData.students
          .map(
            (student, index) => `
          <div class="student-item">
            <div class="student-info" onclick="selectStudent(${student.id})">
              <div class="student-avatar">
                <i class="ph ph-user-circle"></i>
              </div>
              <div class="student-details">
                <h4>${student.name}</h4>
                <span class="student-id">ID: ${String(student.id).padStart(4, "0")}</span>
              </div>
            </div>
            <div class="attendance-selector">
              <div class="custom-dropdown" id="dropdown-${student.id}">
                <div class="dropdown-selected" onclick="toggleDropdown(${student.id})">
                  <span id="selected-${student.id}">-</span>
                  <i class="ph ph-caret-down"></i>
                </div>
                <div class="dropdown-options" id="options-${student.id}">
                  <div class="dropdown-option" data-value="" onclick="selectAttendance(${student.id}, '', '-')">
                    <span class="option-code">-</span>
                    <span class="option-label">Não marcado</span>
                  </div>
                  <div class="dropdown-option present" data-value="P" onclick="selectAttendance(${student.id}, 'P', 'P')">
                    <span class="option-code">P</span>
                    <span class="option-label">Presente</span>
                  </div>
                  <div class="dropdown-option absent" data-value="F" onclick="selectAttendance(${student.id}, 'F', 'F')">
                    <span class="option-code">F</span>
                    <span class="option-label">Falta</span>
                  </div>
                  <div class="dropdown-option justified" data-value="R" onclick="selectAttendance(${student.id}, 'R', 'R')">
                    <span class="option-code">R</span>
                    <span class="option-label">Reposição</span>
                  </div>
                  <div class="dropdown-option excused" data-value="E" onclick="selectAttendance(${student.id}, 'E', 'E')">
                    <span class="option-code">E</span>
                    <span class="option-label">Excusado</span>
                  </div>
                  <div class="dropdown-option authorized" data-value="A" onclick="selectAttendance(${student.id}, 'A', 'A')">
                    <span class="option-code">A</span>
                    <span class="option-label">Autorizado</span>
                  </div>
                  <div class="dropdown-option not-applicable" data-value="NA" onclick="selectAttendance(${student.id}, 'NA', 'NA')">
                    <span class="option-code">NA</span>
                    <span class="option-label">Não se aplica</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- Add Student Modal -->
    <div id="addStudentModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeAddStudentModal()">&times;</span>
        <h2>Adicionar Novo Aluno</h2>
        <div class="form-group">
          <label for="studentName">Nome do Aluno:</label>
          <input type="text" id="studentName" placeholder="Digite o nome completo">
        </div>
        <button class="btn" onclick="addNewStudent()">Adicionar Aluno</button>
      </div>
    </div>
  `
}

// Adicione estas novas funções para o dropdown customizado:

function toggleDropdown(studentId) {
  const dropdown = document.getElementById(`options-${studentId}`)
  const selectedElement = document.getElementById(`dropdown-${studentId}`)
  const allDropdowns = document.querySelectorAll(".dropdown-options")
  const allSelected = document.querySelectorAll(".dropdown-selected")

  // Fechar todos os outros dropdowns e remover classe open
  allDropdowns.forEach((d) => {
    if (d.id !== `options-${studentId}`) {
      d.style.display = "none"
    }
  })

  allSelected.forEach((s) => {
    if (s.parentElement.id !== `dropdown-${studentId}`) {
      s.classList.remove("open")
    }
  })

  // Toggle do dropdown atual
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none"
    selectedElement.querySelector(".dropdown-selected").classList.remove("open")
  } else {
    dropdown.style.display = "block"
    selectedElement.querySelector(".dropdown-selected").classList.add("open")
  }
}

function selectAttendance(studentId, value, display) {
  const selectedElement = document.getElementById(`selected-${studentId}`)
  const dropdown = document.getElementById(`options-${studentId}`)
  const dropdownContainer = document.getElementById(`dropdown-${studentId}`)
  const dropdownSelected = dropdownContainer.querySelector(".dropdown-selected")

  selectedElement.textContent = display
  dropdown.style.display = "none"
  dropdownSelected.classList.remove("open")

  // Aplicar classe CSS baseada no valor selecionado
  dropdownContainer.className = "custom-dropdown"
  if (value) {
    dropdownContainer.classList.add(`selected-${value.toLowerCase()}`)
  }

  // Salvar o valor para uso posterior
  dropdownContainer.setAttribute("data-value", value)

  updateStudentAttendance(studentId, value)
}

// Fechar dropdowns quando clicar fora
document.addEventListener("click", (event) => {
  if (!event.target.closest(".custom-dropdown")) {
    const allDropdowns = document.querySelectorAll(".dropdown-options")
    allDropdowns.forEach((dropdown) => {
      dropdown.style.display = "none"
    })
  }
})

function getStudentDashboard() {
  const classData = classesData.find((c) => c.students.some((s) => s.id === selectedStudent))
  const student = classData?.students.find((s) => s.id === selectedStudent)

  if (!student) return getClassSelectionContent()

  // Mock attendance data for the calendar
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  return `
    <div class="section-content">
      <div class="student-dashboard-header">
        <button class="btn-back" onclick="backToClassAttendance()">
          <i class="ph ph-arrow-left"></i>
          Voltar à Turma
        </button>
        <h3 class="section-title">
          <i class="ph ph-user"></i>
          Dashboard do Aluno
        </h3>
      </div>

      <div class="student-profile-card">
        <div class="student-avatar-large">
          <i class="ph ph-user-circle"></i>
        </div>
        <div class="student-profile-info">
          <h2>${student.name}</h2>
          <p>ID: ${String(student.id).padStart(4, "0")}</p>
          <p>Turma: ${classData.name}</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="calendar-widget">
          <div class="calendar-header">
            <button onclick="previousMonth()" class="nav-btn">
              <i class="ph ph-caret-left"></i>
            </button>
            <h3>${getMonthName(currentMonth)} ${currentYear}</h3>
            <button onclick="nextMonth()" class="nav-btn">
              <i class="ph ph-caret-right"></i>
            </button>
          </div>
          <div class="calendar-grid-small">
            ${generateStudentCalendar(currentYear, currentMonth)}
          </div>
          <div class="calendar-legend">
            <div class="legend-item">
              <div class="legend-dot present"></div>
              <span>Presente</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot absent"></div>
              <span>Falta</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot holiday"></div>
              <span>Feriado</span>
            </div>
          </div>
        </div>

        <div class="attendance-summary">
          <h3>Resumo de Frequência</h3>
          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-number">22</div>
              <div class="stat-label">Total de Aulas</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">20</div>
              <div class="stat-label">Presenças</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">2</div>
              <div class="stat-label">Faltas</div>
            </div>
          </div>
          <div class="attendance-percentage">
            <div class="percentage-circle">
              <span>91%</span>
            </div>
            <p>Taxa de Frequência</p>
          </div>
        </div>
      </div>
    </div>
  `
}

function selectClass(classId) {
  selectedClass = classId
  loadSectionContent("frequencia")
}

function selectStudent(studentId) {
  selectedStudent = studentId
  loadSectionContent("frequencia")
}

function backToClassSelection() {
  selectedClass = null
  loadSectionContent("frequencia")
}

function backToClassAttendance() {
  selectedStudent = null
  loadSectionContent("frequencia")
}

function showAddStudentModal() {
  document.getElementById("addStudentModal").style.display = "block"
}

function closeAddStudentModal() {
  document.getElementById("addStudentModal").style.display = "none"
  document.getElementById("studentName").value = ""
}

async function addNewStudent() {
  const studentName = document.getElementById("studentName").value.trim()
  if (!studentName) {
    alert("Por favor, digite o nome do aluno.")
    return
  }

  try {
    // Insert student into database
    const { data, error } = await supabase
      .from("students")
      .insert([{ name: studentName, class_id: selectedClass }])
      .select()

    if (error) {
      console.error("Error adding student:", error)
      alert("Erro ao adicionar aluno. Tente novamente.")
      return
    }

    // Update local data
    const classData = classesData.find((c) => c.id === selectedClass)
    if (classData && data[0]) {
      classData.students.push({
        id: data[0].id,
        name: data[0].name,
        attendance: {},
      })
    }

    closeAddStudentModal()
    loadSectionContent("frequencia")
    alert("Aluno adicionado com sucesso!")
  } catch (error) {
    console.error("Error adding student:", error)
    alert("Erro ao adicionar aluno. Tente novamente.")
  }
}

function updateStudentAttendance(studentId, status) {
  const date = document.getElementById("attendanceDate").value
  // Here you would save to your database
  console.log(`Student ${studentId} marked as ${status} for ${date}`)
}

function saveAttendance() {
  const date = document.getElementById("attendanceDate").value
  const classData = classesData.find((c) => c.id === selectedClass)

  if (!classData) return

  const attendanceData = {}
  classData.students.forEach((student) => {
    const dropdown = document.getElementById(`attendance-${student.id}`)
    if (dropdown && dropdown.value) {
      attendanceData[student.id] = dropdown.value
    }
  })

  // Here you would save to your database
  console.log("Saving attendance for", date, attendanceData)
  alert("Frequência salva com sucesso!")
}

function generateStudentCalendar(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  let calendar = ""

  // Day headers
  const dayHeaders = ["D", "S", "T", "Q", "Q", "S", "S"]
  dayHeaders.forEach((day) => {
    calendar += `<div class="calendar-day-header">${day}</div>`
  })

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendar += '<div class="calendar-day empty"></div>'
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
    const attendanceClass = Math.random() > 0.8 ? "absent" : Math.random() > 0.9 ? "holiday" : "present"

    calendar += `
      <div class="calendar-day ${isToday ? "today" : ""} ${attendanceClass}">
        ${day}
      </div>
    `
  }

  return calendar
}

function getMonthName(month) {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]
  return months[month]
}

function getBoletimContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-clipboard-text"></i>
                Notas dos Alunos
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Aluno</th>
                        <th>Turma</th>
                        <th>Prova 1</th>
                        <th>Prova 2</th>
                        <th>Trabalho</th>
                        <th>Média</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>João Silva</td>
                        <td>Intermediário A</td>
                        <td>8.5</td>
                        <td>9.0</td>
                        <td>8.8</td>
                        <td>8.8</td>
                    </tr>
                    <tr>
                        <td>Maria Santos</td>
                        <td>Intermediário A</td>
                        <td>7.5</td>
                        <td>8.2</td>
                        <td>9.0</td>
                        <td>8.2</td>
                    </tr>
                    <tr>
                        <td>Pedro Costa</td>
                        <td>Avançado B</td>
                        <td>9.2</td>
                        <td>8.8</td>
                        <td>9.5</td>
                        <td>9.2</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

function getReposicoesContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-arrow-clockwise"></i>
                Aulas de Reposição
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data Agendada</th>
                        <th>Aluno</th>
                        <th>Turma</th>
                        <th>Motivo</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>26/06/2025</td>
                        <td>Maria Santos</td>
                        <td>Intermediário A</td>
                        <td>Falta justificada</td>
                        <td><span class="status-badge status-pendente">Agendada</span></td>
                    </tr>
                    <tr>
                        <td>25/06/2025</td>
                        <td>Carlos Lima</td>
                        <td>Básico C</td>
                        <td>Atestado médico</td>
                        <td><span class="status-badge status-presente">Realizada</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

function getBancoHorasContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-clock"></i>
                Controle de Horas
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Funcionário</th>
                        <th>Horas Extras</th>
                        <th>Horas Compensadas</th>
                        <th>Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>24/06/2025</td>
                        <td>Prof. Ana Silva</td>
                        <td>+2h</td>
                        <td>0h</td>
                        <td>+2h</td>
                    </tr>
                    <tr>
                        <td>23/06/2025</td>
                        <td>Prof. João Santos</td>
                        <td>+1h</td>
                        <td>-1h</td>
                        <td>0h</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

function getDocumentosContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-folder"></i>
                Documentos e Atestados
            </h3>
            <div style="margin-bottom: 20px;">
                <input type="file" id="fileUpload" accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                <button class="btn-action" onclick="document.getElementById('fileUpload').click();">
                    <i class="ph ph-paperclip"></i>
                    Enviar Documento
                </button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Documento</th>
                        <th>Tipo</th>
                        <th>Enviado por</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>24/06/2025</td>
                        <td>atestado_medico.pdf</td>
                        <td>Atestado</td>
                        <td>Prof. Maria</td>
                        <td>
                            <button class="btn-action" style="padding: 8px 12px; font-size: 12px;">
                                <i class="ph ph-eye"></i>
                                Visualizar
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>23/06/2025</td>
                        <td>certificado_curso.pdf</td>
                        <td>Certificado</td>
                        <td>Prof. João</td>
                        <td>
                            <button class="btn-action" style="padding: 8px 12px; font-size: 12px;">
                                <i class="ph ph-eye"></i>
                                Visualizar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

// Atualizar a função logout() para usar Supabase Auth:

async function logout() {
  if (confirm("Tem certeza que deseja sair?")) {
    try {
      await supabase.auth.signOut()
      window.location.href = "index.html"
    } catch (error) {
      console.error("Error signing out:", error)
      // Even if there's an error, redirect to home
      window.location.href = "index.html"
    }
  }
}
