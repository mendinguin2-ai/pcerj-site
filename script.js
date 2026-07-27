window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

menuButton.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const applicationForm = document.getElementById("applicationForm");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");

if (applicationForm) {
  applicationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    formStatus.className = "form-status";
    formStatus.textContent = "Enviando inscrição...";
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    const formData = new FormData(applicationForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/.netlify/functions/inscricao", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível enviar a inscrição.");
      }

      formStatus.className = "form-status success";
      formStatus.textContent = "✅ Inscrição enviada! Aguarde o contato da PCERJ pelo Discord.";
      applicationForm.reset();
    } catch (error) {
      formStatus.className = "form-status error";
      formStatus.textContent = "❌ " + error.message;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar inscrição";
    }
  });
}
