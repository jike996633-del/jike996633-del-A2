(function () {
  "use strict";
  const module = angular.module("driftline");
  module.controller("StaffEventsController", [
    "EventApi",
    "Display",
    "$scope",
    function (api, display, $scope) {
      const vm = this;
      $scope.view = display;
      vm.filter = { status: "", text: "" };
      vm.load = function () {
        vm.loading = true;
        vm.error = "";
        return api
          .get("admin/events")
          .then(
            (events) => {
              vm.events = events;
            },
            (error) => {
              vm.error = error.message;
            },
          )
          .finally(() => {
            vm.loading = false;
          });
      };
      vm.visibleEvents = function () {
        const text = vm.filter.text.toLowerCase();
        return (vm.events || []).filter(
          (event) =>
            (!vm.filter.status || vm.filter.status === event.displayStatus) &&
            (event.name + " " + event.suburb + " " + event.category)
              .toLowerCase()
              .includes(text),
        );
      };
      vm.count = (status) =>
        (vm.events || []).filter(
          (event) => !status || event.displayStatus === status,
        ).length;
      vm.requestDelete = function (event) {
        vm.selected = event;
        vm.deleteError = "";
        document.querySelector("#delete-event-dialog").showModal();
      };
      vm.cancelDelete = function () {
        document.querySelector("#delete-event-dialog").close();
      };
      vm.deleteEvent = function () {
        if (vm.deleting) return;
        vm.deleting = true;
        api
          .remove("admin/events/" + vm.selected.id)
          .then(
            () => {
              vm.message = "Deleted " + vm.selected.name + ".";
              vm.cancelDelete();
              vm.load();
            },
            (error) => {
              vm.deleteError = error.message;
            },
          )
          .finally(() => {
            vm.deleting = false;
          });
      };
      vm.load();
    },
  ]);

  module.controller("EventEditorController", [
    "EventApi",
    "Display",
    "$scope",
    "$q",
    "$timeout",
    function (api, display, $scope, $q, $timeout) {
      const vm = this;
      $scope.view = display;
      vm.id = new URLSearchParams(window.location.search).get("id");
      vm.fields = {};
      vm.images = [
        { path: "assets/images/hero-coast.jpg", name: "Shoreline" },
        { path: "assets/images/hero-bondi.jpg", name: "Bondi from above" },
        { path: "assets/images/rockpool.jpg", name: "Rockpool" },
        { path: "assets/images/dune-grass.jpg", name: "Dune grass" },
        { path: "assets/images/cliffs.jpg", name: "Coastal cliffs" },
        { path: "assets/images/cleanup.jpg", name: "Beach clean-up" },
        { path: "assets/images/volunteers.jpg", name: "Volunteers" },
        { path: "assets/images/shore-texture.jpg", name: "Shore detail" },
      ];
      vm.loading = true;
      $q.all([
        api.get("categories"),
        api.get("organizations"),
        vm.id
          ? api.get("admin/events/" + encodeURIComponent(vm.id))
          : $q.resolve(null),
      ])
        .then(
          (results) => {
            vm.categories = results[0];
            vm.organizations = results[1];
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            nextWeek.setHours(12, 0, 0, 0);
            vm.event = results[2];
            vm.data = vm.event
              ? angular.copy(vm.event)
              : {
                  name: "",
                  summary: "",
                  description: "",
                  purpose: "",
                  locationName: "",
                  suburb: "",
                  meetingPoint: "",
                  categoryId: vm.categories[0]?.id,
                  organizationId: vm.organizations[0]?.id,
                  date: display.dateValue(nextWeek),
                  startTime: "09:00",
                  endTime: "12:00",
                  ticketPrice: 0,
                  fundingGoal: 1000,
                  donationRaised: 0,
                  imagePath: vm.images[0].path,
                  latitude: -33.8915,
                  longitude: 151.2767,
                  status: "active",
                };
            vm.data.dateInput = display.dateInput(vm.data.date);
            vm.data.startInput = display.timeInput(vm.data.startTime);
            vm.data.endInput = display.timeInput(vm.data.endTime);
            document.title =
              (vm.event ? "Edit " + vm.event.name : "New event") +
              " | Driftline staff";
          },
          (error) => {
            vm.loadError = error.message;
          },
        )
        .finally(() => {
          vm.loading = false;
        });
      vm.save = function (form) {
        vm.error = "";
        vm.message = "";
        vm.fields = {};
        if (form.$invalid) {
          vm.error = "Complete the required fields before saving.";
          return;
        }
        const data = angular.copy(vm.data);
        data.date = display.dateValue(data.dateInput);
        data.startTime = display.timeValue(data.startInput);
        data.endTime = display.timeValue(data.endInput);
        if (data.endTime <= data.startTime) {
          vm.fields.endTime = "Choose an end time after the start time.";
          vm.error = "Check the event times.";
          return;
        }
        if (vm.saving) return;
        vm.saving = true;
        const saving = vm.id
          ? api.put("admin/events/" + vm.id, data)
          : api.post("admin/events", data);
        saving
          .then(
            (event) => {
              vm.event = event;
              vm.id = event.id;
              history.replaceState(
                null,
                "",
                window.location.pathname + "?id=" + event.id,
              );
              vm.message = "Saved " + event.name + ".";
              form.$setPristine();
              form.$setUntouched();
              $timeout(() => {
                document.querySelector("#save-message")?.focus();
              }, 0);
            },
            (error) => {
              vm.error = error.message;
              vm.fields = error.fields;
            },
          )
          .finally(() => {
            vm.saving = false;
          });
      };
      // Leave warnings only apply to unsaved form edits, not to a successful save.
      const warnBeforeLeave = (event) => {
        if ($scope.eventForm && $scope.eventForm.$dirty && !vm.saving) {
          event.preventDefault();
          event.returnValue = "";
        }
      };
      window.addEventListener("beforeunload", warnBeforeLeave);
      $scope.$on("$destroy", () =>
        window.removeEventListener("beforeunload", warnBeforeLeave),
      );
    },
  ]);

  module.controller("CategoriesController", [
    "EventApi",
    function (api) {
      const vm = this;
      vm.data = { name: "", slug: "" };
      vm.fields = {};
      vm.load = function () {
        vm.loading = true;
        return api
          .get("categories")
          .then(
            (categories) => {
              vm.categories = categories;
            },
            (error) => {
              vm.error = error.message;
            },
          )
          .finally(() => {
            vm.loading = false;
          });
      };
      vm.edit = function (category) {
        vm.data = angular.copy(category);
        vm.fields = {};
        vm.error = "";
        vm.message = "";
      };
      vm.reset = function (form) {
        vm.data = { name: "", slug: "" };
        vm.fields = {};
        form.$setPristine();
        form.$setUntouched();
      };
      vm.save = function (form) {
        vm.error = "";
        vm.message = "";
        vm.fields = {};
        if (form.$invalid) {
          vm.error = "Enter a name and a lowercase slug.";
          return;
        }
        vm.saving = true;
        const saving = vm.data.id
          ? api.put("admin/categories/" + vm.data.id, vm.data)
          : api.post("admin/categories", vm.data);
        saving
          .then(
            (category) => {
              vm.message = "Saved " + category.name + ".";
              vm.reset(form);
              vm.load();
            },
            (error) => {
              vm.error = error.message;
              vm.fields = error.fields;
            },
          )
          .finally(() => {
            vm.saving = false;
          });
      };
      vm.requestDelete = function (category) {
        vm.selected = category;
        vm.deleteError = "";
        document.querySelector("#delete-category-dialog").showModal();
      };
      vm.cancelDelete = function () {
        document.querySelector("#delete-category-dialog").close();
      };
      vm.remove = function () {
        vm.deleting = true;
        api
          .remove("admin/categories/" + vm.selected.id)
          .then(
            () => {
              vm.message = "Deleted " + vm.selected.name + ".";
              vm.cancelDelete();
              vm.load();
            },
            (error) => {
              vm.deleteError = error.message;
            },
          )
          .finally(() => {
            vm.deleting = false;
          });
      };
      vm.load();
    },
  ]);
})();
