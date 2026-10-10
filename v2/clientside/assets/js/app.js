(function () {
  "use strict";
  const module = angular.module("driftline");
  module.factory("Weather", [
    "$http",
    "$q",
    function ($http, $q) {
      const names = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Freezing fog",
        51: "Light drizzle",
        53: "Drizzle",
        55: "Heavy drizzle",
        56: "Freezing drizzle",
        57: "Heavy freezing drizzle",
        61: "Light rain",
        63: "Rain",
        65: "Heavy rain",
        66: "Freezing rain",
        67: "Heavy freezing rain",
        71: "Light snow",
        73: "Snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Light showers",
        81: "Showers",
        82: "Heavy showers",
        85: "Snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail",
      };
      return {
        forEvent(event) {
          const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Australia/Sydney",
          }).format(new Date());
          const daysAway =
            (Date.parse(event.date + "T12:00:00Z") -
              Date.parse(today + "T12:00:00Z")) /
            86400000;
          if (daysAway < 0 || daysAway > 15)
            return $q.resolve({
              message:
                "The forecast will be available within 16 days of this event.",
            });
          return $http
            .get("https://api.open-meteo.com/v1/forecast", {
              params: {
                latitude: event.latitude,
                longitude: event.longitude,
                daily: "weather_code,temperature_2m_max,temperature_2m_min",
                timezone: "Australia/Sydney",
                forecast_days: 16,
              },
              timeout: 8000,
            })
            .then(
              (response) => {
                const daily = response.data.daily;
                const index = daily.time.indexOf(event.date);
                if (index === -1)
                  return {
                    message:
                      "The forecast is not available for this event date yet.",
                  };
                return {
                  description:
                    names[daily.weather_code[index]] ||
                    "Conditions unavailable",
                  low: Math.round(daily.temperature_2m_min[index]),
                  high: Math.round(daily.temperature_2m_max[index]),
                  date: event.date,
                };
              },
              () => ({
                message:
                  "Weather could not be loaded. Check the forecast before heading out.",
              }),
            );
        },
      };
    },
  ]);

  module.controller("HomeController", [
    "EventApi",
    "Display",
    "$scope",
    function (api, display, $scope) {
      const vm = this;
      $scope.view = display;
      vm.loading = true;
      vm.load = function () {
        vm.loading = true;
        vm.error = "";
        return api
          .get("events")
          .then(
            (events) => {
              vm.next = events[0];
              vm.events = events.slice(1);
            },
            (error) => {
              vm.error = error.message;
            },
          )
          .finally(() => {
            vm.loading = false;
          });
      };
      vm.load();
    },
  ]);

  module.controller("SearchController", [
    "EventApi",
    "Display",
    "$scope",
    function (api, display, $scope) {
      const vm = this;
      $scope.view = display;
      const params = new URLSearchParams(window.location.search);
      const rawDate = params.get("date") || "";
      vm.filters = {
        date: rawDate ? display.dateInput(rawDate) : null,
        location: params.get("location") || "",
        category: params.get("category") || "",
      };
      let requestNumber = 0;
      vm.search = function (form) {
        vm.error = "";
        if (form && form.$invalid) {
          vm.error = "Check the date and location, then apply your filters.";
          return;
        }
        const query = {};
        if (vm.filters.date) query.date = display.dateValue(vm.filters.date);
        if ((vm.filters.location || "").trim())
          query.location = vm.filters.location.trim();
        if (vm.filters.category) query.category = vm.filters.category;
        const suffix = new URLSearchParams(query).toString();
        history.replaceState(
          null,
          "",
          window.location.pathname + (suffix ? "?" + suffix : ""),
        );
        const current = ++requestNumber;
        vm.loading = true;
        return api
          .get("events", query)
          .then(
            (events) => {
              if (current === requestNumber) vm.events = events;
            },
            (error) => {
              if (current === requestNumber) {
                vm.error = error.message;
                vm.events = [];
              }
            },
          )
          .finally(() => {
            if (current === requestNumber) vm.loading = false;
          });
      };
      vm.clear = function (form) {
        vm.filters = { date: null, location: "", category: "" };
        form.$setPristine();
        form.$setUntouched();
        vm.search();
      };
      api.get("categories").then(
        (categories) => {
          vm.categories = categories;
        },
        (error) => {
          vm.categoryError = error.message;
        },
      );
      if (
        rawDate &&
        (Number.isNaN(vm.filters.date.getTime()) ||
          display.dateValue(vm.filters.date) !== rawDate)
      ) {
        vm.error = "Enter a valid date in YYYY-MM-DD format.";
        vm.filters.date = null;
      } else vm.search();
    },
  ]);

  module.controller("EventController", [
    "EventApi",
    "Display",
    "Weather",
    "$scope",
    function (api, display, weather, $scope) {
      const vm = this;
      $scope.view = display;
      const id = new URLSearchParams(window.location.search).get("id");
      vm.load = function () {
        vm.loading = true;
        vm.error = "";
        return api
          .get("events/" + encodeURIComponent(id || "0"))
          .then(
            (event) => {
              vm.event = event;
              document.title = event.name + " | Driftline";
              vm.weatherLoading = true;
              weather
                .forEvent(event)
                .then((result) => {
                  vm.weather = result;
                })
                .finally(() => {
                  vm.weatherLoading = false;
                });
            },
            (error) => {
              vm.error = error.message;
            },
          )
          .finally(() => {
            vm.loading = false;
          });
      };
      vm.load();
    },
  ]);

  module.controller("RegistrationController", [
    "EventApi",
    "Display",
    "$scope",
    "$timeout",
    function (api, display, $scope, $timeout) {
      const vm = this;
      $scope.view = display;
      vm.details = { fullName: "", email: "", phone: "", tickets: 1 };
      vm.fields = {};
      const id = new URLSearchParams(window.location.search).get("id");
      vm.loading = true;
      api
        .get("events/" + encodeURIComponent(id || "0"))
        .then(
          (event) => {
            vm.event = event;
          },
          (error) => {
            vm.loadError = error.message;
          },
        )
        .finally(() => {
          vm.loading = false;
        });
      vm.total = () =>
        vm.event
          ? Number(vm.event.ticketPrice) * Number(vm.details.tickets || 0)
          : 0;
      vm.submit = function (form) {
        vm.error = "";
        vm.fields = {};
        if (
          form.$invalid ||
          !(vm.details.fullName || "").trim() ||
          (vm.details.phone || "").replace(/\D/g, "").length < 6
        ) {
          vm.error =
            "Check your name, email, contact number and ticket quantity.";
          $timeout(() => {
            document.querySelector("#registration-error")?.focus();
          }, 0);
          return;
        }
        if (vm.saving || !vm.event) return;
        vm.saving = true;
        return api
          .post("events/" + vm.event.id + "/registrations", vm.details)
          .then(
            (record) => {
              vm.confirmation = record;
              $timeout(() => {
                document.querySelector("#booking-confirmation")?.focus();
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
    },
  ]);
})();
