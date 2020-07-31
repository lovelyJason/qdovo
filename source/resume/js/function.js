jQuery(function(a) {
  jQuery(".animate").appear();
  jQuery(document.body).on("appear", ".animate", function(g, f) {
      var i;
      var h;
      jQuery(this).each(function() {
          if (jQuery(this).data("delay")) {
              i = jQuery(this).data("delay");
              h = i
          } else {
              h = 0
          }
          jQuery(this).delay(h).queue(function() {
              jQuery(this).addClass("animated").clearQueue()
          })
      })
  });
  jQuery(".toggle-menu").jPushMenu();
  jQuery(document).on("click", function() {
      jQuery(".cbp-spmenu-left").removeClass("menu-open")
  });
  jQuery("#menu-toggle").on("click", function(f) {
      f.stopPropagation();
      jQuery(".cbp-spmenu-left").toggleClass("menu-open")
  });
  var c = 300
    , d = 1200
    , e = 700
    , b = a(".cd-top");
  a(window).scroll(function() {
      (a(this).scrollTop() > c) ? b.addClass("cd-is-visible") : b.removeClass("cd-is-visible cd-fade-out");
      if (a(this).scrollTop() > d) {
          b.addClass("cd-fade-out")
      }
  });
  b.on("click", function(f) {
      f.preventDefault();
      a("body,html").animate({
          scrollTop: 0,
      }, e)
  });
  if (screen.width < 720) {
      a("div, img, input, textarea, button, a").removeClass("animate")
  }
});
