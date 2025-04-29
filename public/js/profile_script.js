
document.addEventListener('DOMContentLoaded', () => {
    const group = document.getElementById('mostImportantPreferences');
    if (!group) return;
  
    group.addEventListener('change', function (e) {
      const checkedBoxes = group.querySelectorAll('input[type="checkbox"]:checked');
      if (checkedBoxes.length > 2) {
        e.target.checked = false;
        alert("You can only select up to 2 options.");
      }
    });
  });
