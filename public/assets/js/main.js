$(window).on('load', function() {
  aos_init();
});

  function aos_init() {
    AOS.init({
      duration: 800,
      once: true
    });
  }