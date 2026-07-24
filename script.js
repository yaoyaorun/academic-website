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

  if (followForm) {
    followForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var nameInput = followForm.querySelector("input[name='name']");
      var emailInput = followForm.querySelector("input[type='email']");
      var name = nameInput ? nameInput.value.trim() : "";
      var email = emailInput ? emailInput.value.trim() : "";
      var action = followForm.getAttribute("action") || "";

      if (!name || !email) {
        if (followStatus) {
          followStatus.textContent = "Please add your name and email address.";
        }
        return;
      }

      if (!action || action.indexOf("YOUR_FORM_ID") !== -1) {
        followForm.reset();
        if (followStatus) {
          followStatus.textContent = "Thank you - this follow form will send once the Formspree ID is added.";
        }
        return;
      }

      if (followStatus) {
        followStatus.textContent = "Sending...";
      }

      fetch(action, {
        method: "POST",
        body: new FormData(followForm),
        headers: { "Accept": "application/json" }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Follow submission failed");
          }
          followForm.reset();
          if (followStatus) {
            followStatus.textContent = "Thank you - you are now on the project follower list.";
          }
        })
        .catch(function () {
          if (followStatus) {
            followStatus.textContent = "Something went wrong. Please try again or email directly.";
          }
        });
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
    var addDateButton = availabilityForm.querySelector("[data-add-date]");
    var selectedDatesNode = availabilityForm.querySelector("[data-selected-dates]");
    var quickDateGrid = availabilityForm.querySelector("[data-quick-date-grid]");
    var rangeMode = availabilityForm.querySelector("[data-range-mode]");
    var availabilityDuration = availabilityForm.querySelector("[data-availability-duration]");
    var slotOptions = availabilityForm.querySelector("[data-slot-options]");
    var slotHelper = availabilityForm.querySelector("[data-slot-helper]");
    var slotDuration = availabilityForm.querySelector("[data-slot-duration]");
    var selectedDatesSummary = availabilityForm.querySelector("[data-selected-dates-summary]");
    var selectedSlotsSummary = availabilityForm.querySelector("[data-selected-slots-summary]");
    var selectedDates = [];
    var lastRangeAnchor = "";
    var slotSets = {
      "Participant interview": {
        duration: "60 min",
        helper: "Interview is around 45 min, up to 60 min. Select one or more 60-minute slots.",
        slots: {
          "weekday-morning": ["10:00-11:00", "11:00-12:00"],
          "weekday-afternoon": ["12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00"],
          "weekday-evening": ["18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"],
          "weekend": ["10:00-11:00", "11:00-12:00", "14:00-15:00", "15:00-16:00", "19:00-20:00"]
        }
      },
      "Expert interview": {
        duration: "90 min",
        helper: "Interview is around 60 min, up to 90 min. Select one or more 90-minute slots.",
        slots: {
          "weekday-morning": ["09:00-10:30", "10:30-12:00"],
          "weekday-afternoon": ["12:00-13:30", "13:30-15:00", "15:00-16:30"],
          "weekday-evening": ["18:00-19:30", "19:30-21:00"],
          "weekend": ["10:00-11:30", "11:30-13:00", "14:00-15:30", "15:30-17:00"]
        }
      },
      "Project collaboration / coffee chat": {
        duration: "20 min",
        helper: "A short project conversation. Select one or more 20-minute slots.",
        slots: {
          "weekday-morning": ["10:00-10:20", "10:20-10:40", "10:40-11:00", "11:00-11:20"],
          "weekday-afternoon": ["12:00-12:20", "12:20-12:40", "14:00-14:20", "14:20-14:40", "15:00-15:20"],
          "weekday-evening": ["18:00-18:20", "18:20-18:40", "19:00-19:20", "19:20-19:40", "20:00-20:20"],
          "weekend": ["10:00-10:20", "10:20-10:40", "11:00-11:20", "14:00-14:20", "14:20-14:40", "16:00-16:20"]
        }
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

    function dateToValue(date) {
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, "0");
      var day = String(date.getDate()).padStart(2, "0");
      return year + "-" + month + "-" + day;
    }

    function isWeekend(value) {
      var date = new Date(value + "T12:00:00");
      var day = date.getDay();
      return day === 0 || day === 6;
    }

    function selectedAvailabilityWindows() {
      return Array.prototype.slice.call(availabilityForm.querySelectorAll("[data-availability-window]:checked"))
        .map(function (input) {
          return input.getAttribute("data-availability-window");
        });
    }

    function syncDateSummary() {
      if (selectedDatesSummary) {
        selectedDatesSummary.value = selectedDates.map(formatSelectedDate).join(", ");
      }
    }

    function sortSelectedDates() {
      selectedDates = selectedDates.filter(function (value, index, array) {
        return array.indexOf(value) === index;
      }).sort();
    }

    function datesBetween(startValue, endValue) {
      var start = new Date(startValue + "T12:00:00");
      var end = new Date(endValue + "T12:00:00");
      var dates = [];

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return dates;
      }

      if (start > end) {
        var temp = start;
        start = end;
        end = temp;
      }

      while (start <= end) {
        dates.push(dateToValue(start));
        start.setDate(start.getDate() + 1);
      }

      return dates;
    }

    function addDateValue(dateValue) {
      if (!dateValue) {
        return;
      }

      if (selectedDates.indexOf(dateValue) === -1) {
        selectedDates.push(dateValue);
      }
      sortSelectedDates();
    }

    function toggleDateValue(dateValue) {
      if (!dateValue) {
        return;
      }

      if (rangeMode && rangeMode.checked && (lastRangeAnchor || selectedDates.length)) {
        var anchor = lastRangeAnchor || selectedDates[selectedDates.length - 1];
        datesBetween(anchor, dateValue).forEach(addDateValue);
      } else if (selectedDates.indexOf(dateValue) === -1) {
        selectedDates.push(dateValue);
        sortSelectedDates();
      } else {
        selectedDates = selectedDates.filter(function (value) {
          return value !== dateValue;
        });
      }

      lastRangeAnchor = dateValue;
      renderSelectedDates();
      renderQuickDates();
      renderAvailabilitySlots();
    }

    function renderQuickDates() {
      if (!quickDateGrid) {
        return;
      }

      var today = new Date();
      today.setHours(12, 0, 0, 0);
      quickDateGrid.innerHTML = "";

      for (var index = 0; index < 14; index += 1) {
        var date = new Date(today);
        var button = document.createElement("button");
        var dayName = document.createElement("span");
        var dateLabel = document.createElement("small");
        var value;

        date.setDate(today.getDate() + index);
        value = dateToValue(date);

        button.type = "button";
        button.className = "quick-date";
        button.setAttribute("aria-pressed", selectedDates.indexOf(value) !== -1 ? "true" : "false");
        button.setAttribute("data-date", value);
        dayName.textContent = date.toLocaleDateString("en-GB", { weekday: "short" });
        dateLabel.textContent = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        button.appendChild(dayName);
        button.appendChild(dateLabel);
        button.addEventListener("click", function () {
          toggleDateValue(this.getAttribute("data-date"));
        });
        quickDateGrid.appendChild(button);
      }
    }

    function renderSelectedDates() {
      if (!selectedDatesNode) {
        return;
      }

      selectedDatesNode.innerHTML = "";
      selectedDates.forEach(function (dateValue) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "date-chip";
        chip.setAttribute("data-date", dateValue);
        chip.textContent = formatSelectedDate(dateValue) + " ×";
        chip.addEventListener("click", function () {
          selectedDates = selectedDates.filter(function (value) {
            return value !== dateValue;
          });
          if (lastRangeAnchor === dateValue) {
            lastRangeAnchor = selectedDates[selectedDates.length - 1] || "";
          }
          renderSelectedDates();
          renderQuickDates();
          renderAvailabilitySlots();
        });
        selectedDatesNode.appendChild(chip);
      });
      syncDateSummary();
    }

    function addSelectedDate() {
      if (!availabilityDate || !availabilityDate.value) {
        return;
      }

      addDateValue(availabilityDate.value);
      lastRangeAnchor = availabilityDate.value;
      availabilityDate.value = "";
      renderSelectedDates();
      renderQuickDates();
      renderAvailabilitySlots();
    }

    function slotsForDate(slotSet, dateValue, windows) {
      var weekendDate = isWeekend(dateValue);
      var activeWindows = windows.length
        ? windows
        : (weekendDate ? ["weekend"] : ["weekday-morning", "weekday-afternoon", "weekday-evening"]);
      var usableWindows = activeWindows.filter(function (windowName) {
        return weekendDate ? windowName === "weekend" : windowName !== "weekend";
      });

      return usableWindows.reduce(function (slots, windowName) {
        return slots.concat(slotSet.slots[windowName] || []);
      }, []);
    }

    function renderAvailabilitySlots() {
      if (!availabilityRoute || !availabilityDate || !slotOptions) {
        return;
      }

      var selectedRoute = availabilityRoute.value;
      var windows = selectedAvailabilityWindows();
      var slotSet = slotSets[selectedRoute];
      slotOptions.innerHTML = "";

      if (availabilityDuration) {
        availabilityDuration.value = slotSet ? slotSet.duration : "";
      }
      if (slotDuration) {
        slotDuration.textContent = slotSet ? "(" + slotSet.duration + " slots, UK time)" : "";
      }

      if (!slotSet || !selectedDates.length) {
        if (slotHelper) {
          slotHelper.textContent = "Choose a conversation type and one or more dates. General availability can narrow the slots.";
        }
        return;
      }

      if (slotHelper) {
        slotHelper.textContent = slotSet.helper + (windows.length
          ? " Filtered by your general availability. All times are UK time."
          : " Showing reasonable UK-time slots for your selected dates.");
      }

      selectedDates.forEach(function (dateValue) {
        var slots = slotsForDate(slotSet, dateValue, windows);
        var dayGroup = document.createElement("div");
        var heading = document.createElement("h4");

        dayGroup.className = "slot-day";
        heading.textContent = formatSelectedDate(dateValue);
        dayGroup.appendChild(heading);

        if (!slots.length) {
          var empty = document.createElement("p");
          empty.className = "slot-empty";
          empty.textContent = isWeekend(dateValue)
            ? "Select Weekends to see slots for this date."
            : "Select a weekday morning, afternoon, or evening to see slots for this date.";
          dayGroup.appendChild(empty);
        }

        slots.forEach(function (slot) {
          var label = document.createElement("label");
          var input = document.createElement("input");
          var main = document.createElement("span");
          var meta = document.createElement("small");

          label.className = "slot-option";
          input.type = "checkbox";
          input.name = "preferred_time_slots";
          input.value = formatSelectedDate(dateValue) + ": " + slot;
          main.textContent = slot;
          meta.textContent = slotSet.duration + " · UK time";

          label.appendChild(input);
          label.appendChild(main);
          label.appendChild(meta);
          dayGroup.appendChild(label);
        });

        slotOptions.appendChild(dayGroup);
      });
    }

    if (availabilityRoute) {
      availabilityRoute.addEventListener("change", renderAvailabilitySlots);
    }
    if (availabilityDate) {
      availabilityDate.min = new Date().toISOString().slice(0, 10);
      availabilityDate.addEventListener("change", addSelectedDate);
    }
    if (addDateButton) {
      addDateButton.addEventListener("click", addSelectedDate);
    }
    availabilityForm.querySelectorAll("[data-availability-window]").forEach(function (input) {
      input.addEventListener("change", renderAvailabilitySlots);
    });
    renderSelectedDates();
    renderQuickDates();
    renderAvailabilitySlots();

    availabilityForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = availabilityForm.querySelector("[name='name']").value.trim();
      var email = availabilityForm.querySelector("[name='email']").value.trim();
      var route = availabilityForm.querySelector("[name='route']").value;
      var meetingMode = availabilityForm.querySelector("[name='meeting_mode']").value;
      var notes = availabilityForm.querySelector("[name='notes']").value.trim();
      var generalAvailability = Array.prototype.slice.call(availabilityForm.querySelectorAll("[name='general_availability']:checked"))
        .map(function (input) {
          return input.value;
        });
      var selectedSlots = Array.prototype.slice.call(availabilityForm.querySelectorAll("[name='preferred_time_slots']:checked"))
        .map(function (input) {
          return input.value;
        });

      if (!name || !email || !route || !meetingMode) {
        if (availabilityStatus) {
          availabilityStatus.textContent = "Please add your name, email, conversation type, and meeting format.";
        }
        return;
      }

      if (!selectedSlots.length && !notes) {
        if (availabilityStatus) {
          availabilityStatus.textContent = "Please select at least one slot, or add a note if your timing is uncertain.";
        }
        return;
      }

      var action = availabilityForm.getAttribute("action") || "";
      var hasFormspreePlaceholder = action.indexOf("YOUR_AVAILABILITY_FORM_ID") !== -1;
      var duration = availabilityDuration ? availabilityDuration.value : "";
      syncDateSummary();
      if (selectedSlotsSummary) {
        selectedSlotsSummary.value = selectedSlots.length ? selectedSlots.join("; ") + " UK time" : "No slot selected";
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
            selectedDates = [];
            lastRangeAnchor = "";
            renderSelectedDates();
            renderQuickDates();
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
        "General availability: " + (generalAvailability.length ? generalAvailability.join(", ") : "Not specified"),
        "Preferred dates: " + (selectedDates.length ? selectedDates.map(formatSelectedDate).join(", ") : "Not specified"),
        "Preferred time slots: " + (selectedSlots.length ? selectedSlots.join("; ") + " UK time" : "No slot selected"),
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
