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
  var languageButtons = document.querySelectorAll("[data-language-button]");
  var languagePanels = document.querySelectorAll("[data-language-panel]");

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

  function showRecruitmentLanguage(language) {
    if (!languageButtons.length || !languagePanels.length) {
      return;
    }

    languageButtons.forEach(function (button) {
      var isSelected = button.getAttribute("data-language-button") === language;
      button.setAttribute("aria-pressed", String(isSelected));
    });

    languagePanels.forEach(function (panel) {
      var isSelected = panel.getAttribute("data-language-panel") === language;
      panel.hidden = !isSelected;
    });
  }

  languageButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var language = button.getAttribute("data-language-button");
      showRecruitmentLanguage(language);
      if (history.replaceState) {
        history.replaceState(null, "", "#recruitment-" + language);
      }
    });
  });

  if (window.location.hash && window.location.hash.indexOf("#recruitment-") === 0) {
    showRecruitmentLanguage(window.location.hash.replace("#recruitment-", ""));
  }

  if (availabilityForm) {
    var availabilityRoute = availabilityForm.querySelector("[data-availability-route]");
    var availabilityDate = availabilityForm.querySelector("[data-availability-date]");
    var availabilityDuration = availabilityForm.querySelector("[data-availability-duration]");
    var slotOptions = availabilityForm.querySelector("[data-slot-options]");
    var slotHelper = availabilityForm.querySelector("[data-slot-helper]");
    var slotDuration = availabilityForm.querySelector("[data-slot-duration]");
    var selectedSlotsSummary = availabilityForm.querySelector("[data-selected-slots-summary]");
    var slotSets = {
      "Participant interview": {
        duration: "60 min",
        helper: "Interview is around 45 min, up to 60 min. Select one or more 60-minute slots.",
        slots: ["09:00-10:00", "11:00-12:00", "14:00-15:00", "16:30-17:30", "20:00-21:00"]
      },
      "Expert interview": {
        duration: "90 min",
        helper: "Interview is around 60 min, up to 90 min. Select one or more 90-minute slots.",
        slots: ["09:00-10:30", "11:30-13:00", "14:30-16:00", "17:00-18:30", "20:00-21:30"]
      },
      "Project collaboration / coffee chat": {
        duration: "20 min",
        helper: "A short project conversation. Select one or more 20-minute slots.",
        slots: ["09:00-09:20", "10:40-11:00", "13:00-13:20", "15:30-15:50", "19:40-20:00"]
      }
    };

    function formatSelectedDate(value) {
      if (!value) {
        return "";
      }
      var date = new Date(value + "T12:00:00");
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });
    }

    function renderAvailabilitySlots() {
      if (!availabilityRoute || !availabilityDate || !slotOptions) {
        return;
      }

      var selectedRoute = availabilityRoute.value;
      var selectedDate = availabilityDate.value;
      var slotSet = slotSets[selectedRoute];
      slotOptions.innerHTML = "";

      if (availabilityDuration) {
        availabilityDuration.value = slotSet ? slotSet.duration : "";
      }
      if (slotDuration) {
        slotDuration.textContent = slotSet ? "(" + slotSet.duration + " slots, UK time)" : "";
      }

      if (!slotSet || !selectedDate) {
        if (slotHelper) {
          slotHelper.textContent = "Choose a conversation type and date. You may select more than one.";
        }
        return;
      }

      if (slotHelper) {
        slotHelper.textContent = slotSet.helper + " " + formatSelectedDate(selectedDate) + ", UK time.";
      }

      slotSet.slots.forEach(function (slot) {
        var label = document.createElement("label");
        var input = document.createElement("input");
        var main = document.createElement("span");
        var meta = document.createElement("small");

        label.className = "slot-option";
        input.type = "checkbox";
        input.name = "preferred_time_slots";
        input.value = slot;
        main.textContent = slot;
        meta.textContent = slotSet.duration + " · UK time";

        label.appendChild(input);
        label.appendChild(main);
        label.appendChild(meta);
        slotOptions.appendChild(label);
      });
    }

    if (availabilityRoute) {
      availabilityRoute.addEventListener("change", renderAvailabilitySlots);
    }
    if (availabilityDate) {
      availabilityDate.min = new Date().toISOString().slice(0, 10);
      availabilityDate.addEventListener("change", renderAvailabilitySlots);
    }
    renderAvailabilitySlots();

    availabilityForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = availabilityForm.querySelector("[name='name']").value.trim();
      var email = availabilityForm.querySelector("[name='email']").value.trim();
      var route = availabilityForm.querySelector("[name='route']").value;
      var meetingMode = availabilityForm.querySelector("[name='meeting_mode']").value;
      var notes = availabilityForm.querySelector("[name='notes']").value.trim();
      var preferredDate = availabilityDate ? availabilityDate.value : "";
      var selectedSlots = Array.prototype.slice.call(availabilityForm.querySelectorAll("[name='preferred_time_slots']:checked"))
        .map(function (input) {
          return input.value;
        });

      if (!name || !email || !route || !meetingMode || !preferredDate || !selectedSlots.length) {
        if (availabilityStatus) {
          availabilityStatus.textContent = "Please add your name, email, conversation type, meeting format, date, and at least one time slot.";
        }
        return;
      }

      var action = availabilityForm.getAttribute("action") || "";
      var hasFormspreePlaceholder = action.indexOf("YOUR_AVAILABILITY_FORM_ID") !== -1;
      var duration = availabilityDuration ? availabilityDuration.value : "";
      if (selectedSlotsSummary) {
        selectedSlotsSummary.value = selectedSlots.join(", ") + " UK time";
      }

      if (!hasFormspreePlaceholder) {
        if (availabilityStatus) {
          availabilityStatus.textContent = "Sending...";
        }
        availabilityForm.classList.remove("is-sent");

        fetch(action, {
          method: "POST",
          body: new FormData(availabilityForm),
          headers: { "Accept": "application/json" }
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Availability submission failed");
            }
            availabilityForm.reset();
            renderAvailabilitySlots();
            availabilityForm.classList.add("is-sent");
            window.setTimeout(function () {
              availabilityForm.classList.remove("is-sent");
            }, 1200);
            if (availabilityStatus) {
              availabilityStatus.textContent = "Thanks - your preferred time slots have been sent.";
            }
          })
          .catch(function () {
            if (availabilityStatus) {
              availabilityStatus.textContent = "Something went wrong. Please email yxiao3@ic.ac.uk directly.";
            }
          });
        return;
      }

      var bodyLines = [
        "Dear Yao,",
        "",
        "I am interested in: " + route,
        "Name: " + name,
        "Email: " + email,
        "Meeting format: " + meetingMode,
        "Preferred date: " + preferredDate,
        "Preferred time slots: " + selectedSlots.join(", ") + " UK time",
        "Duration: " + (duration || "Not specified"),
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
        availabilityStatus.textContent = "Opening an email draft. Add a Formspree ID to send directly from the website.";
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
