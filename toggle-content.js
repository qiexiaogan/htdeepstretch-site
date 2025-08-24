document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      // deactivate all buttons
      buttons.forEach(btn => btn.classList.remove("active"));
      // activate clicked button
      button.classList.add("active");

      // hide all contents
      contents.forEach(content => content.classList.remove("active"));
      // show selected content
      const targetId = button.getAttribute("data-target");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add("active");
      }
    });
  });

  // Service sub-buttons functionality
  const serviceSubButtons = document.querySelectorAll(".service-sub-btn");
  const serviceContents = document.querySelectorAll(".service-content");

  serviceSubButtons.forEach(button => {
    button.addEventListener("click", () => {
      // deactivate all service sub-buttons
      serviceSubButtons.forEach(btn => btn.classList.remove("active"));
      // activate clicked service sub-button
      button.classList.add("active");

      // hide all service contents
      serviceContents.forEach(content => content.classList.remove("active"));
      // show selected service content
      const serviceType = button.getAttribute("data-service");
      const targetServiceContent = document.getElementById(serviceType + "-service");
      if (targetServiceContent) {
        targetServiceContent.classList.add("active");
      }
    });
  });
});
