(function () {
  "use strict";
  angular
    .module("driftline", [])
    .factory("EventApi", [
      "$http",
      "$q",
      function ($http, $q) {
        const configured = (window.DRIFTLINE_CONFIG || {}).apiBase;
        const relative =
          document.body.dataset.site === "admin" ? "../api/" : "api/";
        const base = configured
          ? configured.replace(/\/$/, "") + "/"
          : new URL(relative, window.location.href).href;
        function request(method, resource, data, params) {
          return $http({
            method,
            url: base + resource,
            data,
            params,
            timeout: 12000,
          }).then(
            (response) => response.data,
            (response) =>
              $q.reject({
                message:
                  (response.data && response.data.error) ||
                  (response.status === -1
                    ? "The request timed out. Check your connection and try again."
                    : "The event service could not be reached. Try again shortly."),
                fields: (response.data && response.data.fields) || {},
                status: response.status,
              }),
          );
        }
        return {
          get: (resource, params) =>
            request("GET", resource, undefined, params),
          post: (resource, data) => request("POST", resource, data),
          put: (resource, data) => request("PUT", resource, data),
          remove: (resource) => request("DELETE", resource),
        };
      },
    ])
    .factory("Display", function () {
      const currency = new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
      });
      function localDate(value) {
        return new Date(value + "T12:00:00");
      }
      return {
        money: (value) => currency.format(Number(value || 0)),
        day: (value) =>
          value
            ? new Intl.DateTimeFormat("en-AU", { day: "2-digit" }).format(
                localDate(value),
              )
            : "",
        month: (value) =>
          value
            ? new Intl.DateTimeFormat("en-AU", { month: "short" }).format(
                localDate(value),
              )
            : "",
        date: (value) =>
          value
            ? new Intl.DateTimeFormat("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(localDate(value))
            : "",
        recorded: (value) =>
          value
            ? new Intl.DateTimeFormat("en-AU", {
                timeZone: "Australia/Sydney",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(value))
            : "",
        dateInput: (value) => (value ? localDate(value) : null),
        dateValue: (value) =>
          value instanceof Date && !Number.isNaN(value.getTime())
            ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
            : "",
        timeValue: (value) =>
          value instanceof Date
            ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
            : "",
        timeInput: (value) =>
          value ? new Date("2000-01-01T" + value + ":00") : null,
        progress: (event) =>
          event
            ? Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    (Number(event.fundingRaised) / Number(event.fundingGoal)) *
                      100,
                  ),
                ),
              )
            : 0,
      };
    })
    .controller("NavigationController", function () {
      this.open = false;
    });
})();
