(function(){
  function $(id){
    return document.getElementById(id);
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  window.BarberiaDom = { $, escapeHtml };
})();
