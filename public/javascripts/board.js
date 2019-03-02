$('body').ready(function(){
    var board = window.location.pathname;
    board = board.split('/')[1];

    Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();
        return [this.getFullYear() - 2000,
                (mm>9 ? '' : '0') + mm,
                (dd>9 ? '' : '0') + dd
               ].join('-');
      };

    $.ajax({
        method: "POST",
        url: "/board",
        data: {
          board : board
        }
      }).done(function (value) {
        var container = $('#board');

        for(var i=value.length-1; i>=0; i--){

            var date = new Date(value[i].createdAt);
            container.append('<div class="item">');
            $('.item').last().append('<div class="content">');
            $('.content').last().append('<div class="ui grid">');

            $('.content').last().find('.ui.grid').last().append('<div class="two wide column">');
            $('.two.wide.column').last().append('<p>'+ value[i].id +'</p>');
            $('.content').last().find('.ui.grid').last().append('</div>');

            $('.content').last().find('.ui.grid').last().append('<div class="ten wide column">');
            $('.ten.wide.column').last().append('<p><a class="board_data" data-href=/'+ board + '/' + value[i].id +' data-writer=' + value[i].writer + '>'+ value[i].title +'</a></p>');
            $('.content').last().find('.ui.grid').last().append('</div>');

            $('.content').last().find('.ui.grid').last().append('<div class="two wide column">');
            $('.two.wide.column').last().append('<p>'+ date.yyyymmdd() +'</p>');
            $('.content').last().find('.ui.grid').last().append('</div>');

            $('.content').last().find('.ui.grid').last().append('<div class="two wide column">');
            $('.two.wide.column').last().append('<p>'+ value[i].writer +'</p>');
            $('.content').last().find('.ui.grid').last().append('</div>');

            $('.content').last().append('</div>');
            $('.item').last().append('</div>');
            container.append('</div>');


            // var item = container.append('<div class="item">');
            // var content = $(item).append('<div class="content">');
            // var ui = $(content).append('<div class="ui grid">');

            // var idColumn = $(ui).append('<div class="two wide column">');
            // $(idColumn).append('<p>'+ value[i].id +'</p>');
            // $(ui).append('</div>');

            // var titleColumn = $(ui).append('<div class="two wide column">');
            // $(titleColumn).append('<p>'+ value[i].title +'</p>');
            // $(ui).append('</div>');

            // var createdAtColumn = $(ui).append('<div class="two wide column">');
            // $(createdAtColumn).append('<p>'+ value[i].createdAt +'</p>');
            // $(ui).append('</div>');

            // var writerColumn = $(ui).append('<div class="two wide column">');
            // $(writerColumn).append('<p>'+ value[i].writer +'</p>');
            // $(ui).append('</div>');

            // $(content).append('</div>');
            // $(item).append('</div>');
        }
        $('.board_data').click((e)=>{
            var redirectLink = $(e.target).data('href');
            var writer = $(e.target).data('writer');
            console.log(writer);
            checkAuthorityRequest('읽기',writer,()=>{
                location.href = redirectLink;
            });
            // var name = $('#header_menu_login').text().trim();
            // var board = $('#breadcrumb_text').text().trim();

            // if(name != '로그인'){
            //     var redirectLink = $(e.target).data('href');
            //     $.ajax({
            //         method: "POST",
            //         url: "/boardAuthorityCheck",
            //         data: {
            //             name : name,
            //             board : board,
            //             action : '읽기'
            //         }
            //       }).done(function (value) {
            //         if(value.result){
            //             location.href = '/' + board + '/write';                        
            //         }
            //         else
            //             toastr.warning('권한이 없습니다.', 'OpenYearRound');
            //     });
            // }
            // else
            //     toastr.warning('권한이 없습니다.', 'OpenYearRound');
        });

      }); 

    $('#writeButton').click(()=>{
        location.href = '/' + board + '/write';
    });
});