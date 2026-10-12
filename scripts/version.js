/* Shared display metadata; saved-game schema versions remain independent. */
(() => {
  const scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) return;

  const manifestUrl = new URL("../version.json", scriptUrl);
  const semver =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

  async function displayVersion() {
    try {
      const response = await fetch(manifestUrl, { cache: "no-cache" });
      if (!response.ok) return;
      const metadata = await response.json();
      if (
        typeof metadata.version !== "string" ||
        !semver.test(metadata.version)
      )
        return;
      const prerelease = metadata.version
        .split("+")[0]
        .split("-")
        .slice(1)
        .join("-");
      if (prerelease.split(".").some((part) => /^0\d+$/.test(part))) return;

      const preview = metadata.status === "unreleased" ? " · Preview" : "";
      document.querySelectorAll("[data-app-version]").forEach((element) => {
        element.textContent = `v${metadata.version}${preview}`;
      });
      document.documentElement.dataset.appVersion = metadata.version;
    } catch {
      // Preserve the readable HTML fallback when the manifest is unavailable.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", displayVersion, {
      once: true,
    });
  } else {
    displayVersion();
  }
})();
