
window.onload = function () {
  aos_init();
}

// Init AOS
function aos_init() {
  AOS.init({
    duration: 1000,
    easing: "ease-in-out",
    once: true,
    mirror: false
  });
}

document.querySelector('#btnRegistration').addEventListener('click', registrationVehicle);
function registrationVehicle() {

  var ele = document.querySelector("#inputRegistration");
  if (!ele.value) {
    alert("Please Enter Registration Number.")
  }

  else if (ele.value.length < 6) {
    alert("Please Enter Valid Registration Number.")
  }
  else {
    window.location.href = "./appointment.html?regNo=" + ele.value ;
  } 
}