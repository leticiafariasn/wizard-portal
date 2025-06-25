let currentUser = null
let currentSection = "frequencia"
let selectedClass = null
let selectedStudent = null

// Mock data for classes and students
const mockClasses = [
  {
    id: 1,
    name: "T2A TQ 18",
    students: [
      { id: 1, name: "João Silva", attendance: {} },
      { id: 2, name: "Maria Santos", attendance: {} },
      { id: 3, name: "Pedro Costa", attendance: {} },
      { id: 4, name: "Ana Oliveira", attendance: {} },
      { id: 5, name: "Carlos Lima", attendance: {} },
    ],
  },
  {
    id: 2,
    name: "T3B AV 19",
    students: [
      { id: 6, name: "Fernanda Silva", attendance: {} },
      { id: 7, name: "Roberto Santos", attendance: {} },
      { id: 8, name: "Juliana Costa", attendance: {} },
    ],
  },
  {
    id: 3,
    name: "T1C IN 20",
    students: [
      { id: 9, name: "Lucas Pereira", attendance: {} },
      { id: 10, name: "Camila Rodrigues", attendance: {} },
      { id: 11, name: "Diego Almeida", attendance: {} },
      { id: 12, name: "Beatriz Ferreira", attendance: {} },
    ],
  },
]

// Initialize supabase - use the same instance as other files
const supabase = window.supabase

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  checkAuthAndLoadUser()
  showSection("frequencia")
})

async function checkAuthAndLoadUser() {
  try {
    // Add a small delay to ensure supabase is fully loaded
    await new Promise((resolve) => setTimeout(resolve, 100))

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth error:", error)
      redirectToLogin()
      return
    }

    if (!user) {
      console.log("No user found, redirecting to login")
      redirectToLogin()
      return
    }

    // User is authenticated, load their data
    currentUser = {
      id: user.id,
      email: user.email,
      username: user.user_metadata.full_name || user.email || "Usuário",
      role: user.user_metadata.role || "Professor",
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

function showSection(section) {
  currentSection = section
  selectedClass = null
  selectedStudent = null

  // Update active navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Find the clicked nav item and make it active
  const clickedItem = event?.target?.closest(".nav-item")
  if (clickedItem) {
    clickedItem.classList.add("active")
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
  return `
    <div class="section-content">
      <h3 class="section-title">
        <i class="ph ph-chart-bar"></i>
        Selecionar Turma
      </h3>
      <div class="class-grid">
        ${mockClasses
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
  const classData = mockClasses.find((c) => c.id === selectedClass)
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
              <select class="attendance-dropdown" id="attendance-${student.id}" onchange="updateStudentAttendance(${student.id}, this.value)">
                <option value="">-</option>
                <option value="P">P</option>
                <option value="F">F</option>
                <option value="R">R</option>
                <option value="E">E</option>
                <option value="A">A</option>
                <option value="NA">NA</option>
              </select>
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

function getStudentDashboard() {
  const classData = mockClasses.find((c) => c.students.some((s) => s.id === selectedStudent))
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

function addNewStudent() {
  const studentName = document.getElementById("studentName").value.trim()
  if (!studentName) {
    alert("Por favor, digite o nome do aluno.")
    return
  }

  const classData = mockClasses.find((c) => c.id === selectedClass)
  if (classData) {
    const newStudent = {
      id: Date.now(), // Simple ID generation
      name: studentName,
      attendance: {},
    }
    classData.students.push(newStudent)
    closeAddStudentModal()
    loadSectionContent("frequencia")
  }
}

function updateStudentAttendance(studentId, status) {
  const date = document.getElementById("attendanceDate").value
  // Here you would save to your database
  console.log(`Student ${studentId} marked as ${status} for ${date}`)
}

function saveAttendance() {
  const date = document.getElementById("attendanceDate").value
  const classData = mockClasses.find((c) => c.id === selectedClass)

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
