(function () {
  var body = document.body;
  var page = body ? body.getAttribute("data-page") : "";
  var navLinks = document.querySelectorAll("[data-nav]");
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var yearNodes = document.querySelectorAll("[data-year]");
  var forms = document.querySelectorAll("[data-formspree-form]");
  var followForm = document.querySelector("[data-follow-form]");
  var followStatus = document.querySelector("[data-follow-status]");
  var careLinks = document.querySelectorAll(".nav-care-link");
  var availabilityForm = document.querySelector("[data-availability-form]");
  var availabilityStatus = document.querySelector("[data-availability-status]");

  navLinks.forEach(function (link) {
    if (link.getAttribute("data-nav") === page) {
      link.setAttribute("aria-current", "page");
    }
  });

  yearNodes.forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  careLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }

      event.preventDefault();
      link.classList.remove("is-blooming");
      link.offsetWidth;
      link.classList.add("is-blooming");

      window.setTimeout(function () {
        window.location.href = link.href;
      }, 220);
    });
  });

  function updateAmbient(event) {
    var point = event.touches ? event.touches[0] : event;
    if (!point || !document.documentElement) {
      return;
    }

    var x = Math.round((point.clientX / window.innerWidth) * 100);
    var y = Math.round((point.clientY / window.innerHeight) * 100);
    var driftX = ((x - 50) * 0.16).toFixed(1) + "px";
    var driftY = ((y - 50) * 0.12).toFixed(1) + "px";

    document.documentElement.style.setProperty("--mx", x + "%");
    document.documentElement.style.setProperty("--my", y + "%");
    document.documentElement.style.setProperty("--drift-x", driftX);
    document.documentElement.style.setProperty("--drift-y", driftY);
  }

  window.addEventListener("pointermove", updateAmbient, { passive: true });
  window.addEventListener("touchmove", updateAmbient, { passive: true });

  try {
    if (followStatus && localStorage.getItem("yao-project-followed")) {
      followStatus.textContent = "You are following this project on this browser.";
    }
  } catch (error) {
    // Browsers may block localStorage in private contexts.
  }

  if (followForm) {
    followForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var emailInput = followForm.querySelector("input[type='email']");
      var email = emailInput ? emailInput.value.trim() : "";

      if (!email) {
        if (followStatus) {
          followStatus.textContent = "Please enter an email address.";
        }
        return;
      }

      try {
        localStorage.setItem("yao-project-followed", "true");
      } catch (error) {
        // Browsers may block localStorage in private contexts.
      }

      followForm.reset();
      if (followStatus) {
        followStatus.textContent = "Thank you - this placeholder follow interaction is working.";
      }
    });
  }

  if (availabilityForm) {
    availabilityForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = availabilityForm.querySelector("[name='name']").value.trim();
      var email = availabilityForm.querySelector("[name='email']").value.trim();
      var route = availabilityForm.querySelector("[name='route']").value;
      var notes = availabilityForm.querySelector("[name='notes']").value.trim();
      var availability = Array.prototype.slice.call(availabilityForm.querySelectorAll("[name='availability']:checked"))
        .map(function (input) {
          return input.value;
        });

      if (!name || !email || !route) {
        if (availabilityStatus) {
          availabilityStatus.textContent = "Please add your name, email, and interview type.";
        }
        return;
      }

      var bodyLines = [
        "Dear Yao,",
        "",
        "I am interested in: " + route,
        "Name: " + name,
        "Email: " + email,
        "General availability: " + (availability.length ? availability.join(", ") : "Not specified"),
        "",
        "Notes:",
        notes || "None",
        "",
        "Best wishes,"
      ];

      var mailto = "mailto:yxiao3@ic.ac.uk"
        + "?subject=" + encodeURIComponent("Interview availability - Belonging Across Places")
        + "&body=" + encodeURIComponent(bodyLines.join("\n"));

      if (availabilityStatus) {
        availabilityStatus.textContent = "Opening an email draft...";
      }
      window.location.href = mailto;
    });
  }

  forms.forEach(function (form) {
    var status = form.querySelector("[data-form-status]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (status) {
        status.textContent = "Sending...";
      }

      var action = form.getAttribute("action") || "";
      var hasPlaceholderId = action.indexOf("YOUR_FORM_ID") !== -1;

      if (hasPlaceholderId) {
        form.reset();
        if (status) {
          status.textContent = "Thanks - your message is ready to send once the Formspree ID is added.";
        }
        return;
      }

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Form submission failed");
          }
          form.reset();
          if (status) {
            status.textContent = "Thanks - your message has been sent.";
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = "Something went wrong. Please try again or email directly.";
          }
        });
    });
  });
})();
