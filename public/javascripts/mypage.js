$('body').ready(()=>{
    $('#saveButton').click((e)=>{
        $.ajax({
            method: "POST",
            url: "/mypage",
            data: {
              password : $('#form_password').val()
            }
          }).done(function (value) {
            toastr.success('내 정보가 수정되었습니다.', 'OpenYearRound');
          }); 
    });
});