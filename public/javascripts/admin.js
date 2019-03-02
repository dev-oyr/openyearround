$('body').ready(function () {
  $('.tabular.menu .item').tab();

  var findName;
  $('.ui.image.label').click(function(e){
    var name = $(this).text().trim();
    findName = name;
    $.ajax({
      method: "GET",
      url: "/member/"+name,
    }).done(function (value) {
      $('#form_name').val(value.name);
      $('#form_phone').val(value.phone);
      $('#form_year').val(value.year);
      $('#form_major').val(value.major);
      var authorities = value.authorities;
      var labels = $('.ui.checkbox label');
      var input = $('.ui.checkbox input');
      for(var j=0; j<input.length; j++){
        $(input[j]).prop("checked", false);
      }

      if(authorities != ''){
        console.log(authorities);
        authorities = JSON.parse(authorities);
        for(var i=0; i<authorities.length; i++){
          for(var j=0; j<labels.length; j++){
            if($(labels[j]).text() == authorities[i]){
              $($(labels[j]).prev()).prop("checked", true);
              break;
            }
          }
        }
      }
    });
  });

  $('#saveButton').click(function(){
    var find = findName;
    var name = $('#form_name').val();
    var phone = $('#form_phone').val();
    var year = $('#form_year').val();
    var major = $('#form_major').val();
    var checkboxes = $('input:checkbox');
    var checked = [];
    for(var i=0; i<checkboxes.length; i++){
      if($(checkboxes[i]).is(":checked") == true){
        var label = $(checkboxes[i]).next();
        checked.push($(label).text());
      }
    }
    $.ajax({
      method: "POST",
      url: "/admin/management",
      data: {
        find: find, 
        name: name,
        phone : phone,
        year : year,
        major : major,
        authorities : JSON.stringify(checked)
      }
    }).done(function (value) {
      
    });
  })
});