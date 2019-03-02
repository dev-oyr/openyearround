$('body').ready(function () {
  $('.ui.dropdown#dropdown_board').dropdown({
    action: 'select',
    onChange: function (value, text, $selectedItem) {
      if (value == '공지사항')
        $(location).attr('href', '/notice');
      else {
        if ($('#header_menu_login').text().trim() == '로그인')
          $('.tiny.modal').modal('show');
        else{
          console.log(value);
          if (value == '과제')
            $(location).attr('href', '/assignment');
          
          // $(location).attr('href', '/notice');
          console.log('location change');
        }
      }
    }
  });

  $('.ui.dropdown#dropdown_my').dropdown({
    action: 'select',
    onChange: function (value, text, $selectedItem) {
      switch(value){
        case '로그아웃' :
        $.ajax({
          method: "POST",
          url: "/logout",
        }).done(function (value) {
          location.reload();
        });
        break;
        case '마이페이지':
        location.href = '/mypage';
        break;
        default:
        console.log(value);
        break;
      }
    }
  });

  $(".menuList").click(function () {
  });

  $('.ui.sticky')
    .sticky({
      context: '#main'
    });

  $('#login_password').keypress((event) => {
    if(event.keyCode == 13){
      $('#buttonLogin').click();
    }
  });

  $('#buttonLogin').click(function () {
    name = $('#login_name').val();
    password = $('#login_password').val();

    $.ajax({
      method: "POST",
      url: "/login",
      data: { name: name, password: password }
    }).done(function (value) {
      console.log(value);
      if(value.result == 'fail')
        toastr.error('로그인에 실패하였습니다.', 'OpenYearRound');
      else
        location.reload();
      // $('#header_menu_login').text(value.name);
      // $('#header_menu_login').attr("data-content","로그인 되었습니다");
      // $('.needLogin').removeAttr("data-tooltip");
      // $('.needLogin').removeAttr("data-position");
    });
  });

  $('#header_menu_login').click(function () {

  });

  if ($('#header_menu_login').text().trim() == '로그인') {
    var needLogins = $('.needLogin');
    $('.needLogin').attr("data-tooltip", "로그인이 필요합니다");
    $('.needLogin').attr("data-position", "left center");

    $('#header_menu_login').click(function () {
      $('.tiny.modal').modal('show');
    });
    // if($('#header_menu_login').text().trim() == '로그인')
  }

  var sameWidth = $(".sameHeightWithWidth");
  for (var i in sameWidth) {
    if (isElement(sameWidth[i])) {
      $(sameWidth[i]).height($(sameWidth[i]).width());
    }
  }

  // var main = $('#main');
  // var documentHeight = $(document).height();
  // if(documentHeight - 128 > main.height())
  //   main.height(documentHeight - 128);

  toastr.options.positionClass =  "toast-bottom-right";
  toastr.options.timeOut = "1000";

  $(window).resize(function () {
    var sameWidth = $(".sameHeightWithWidth");
    for (var i in sameWidth) {
      if (isElement(sameWidth[i])) {
        $(sameWidth[i]).height($(sameWidth[i]).width());
      }
    }

    // var main = $('#main');
    // var documentHeight = $(document).height();
    // if(documentHeight - 128 < main.height())
    //   console.log(main.height());
    // main.height(documentHeight - 128);
  });
});

function checkAuthorityRequest(action, writer, callback){
  var name = $('#header_menu_login').text().trim();
  var board = $('#breadcrumb_text').text().trim();

  if(name != '로그인'){
      $.ajax({
          method: "POST",
          url: "/boardAuthorityCheck",
          data: {
              name : name,
              board : board,
              action : action,
              writer : writer
          }
        }).done(function (value) {
          if(value.result){
            callback();            
          }
          else
            toastr.warning('권한이 없습니다.', 'OpenYearRound');
      });
  }
  else
    toastr.warning('권한이 없습니다.', 'OpenYearRound');
}

function isElement(obj) {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrome)
    return obj instanceof HTMLElement;
  }
  catch (e) {
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have (works on IE7)
    return (typeof obj === "object") &&
      (obj.nodeType === 1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument === "object");
  }
}