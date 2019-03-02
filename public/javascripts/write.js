$('body').ready(function () {
    var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],
      
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      
        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],
      
        ['clean'],                                         // remove formatting button
        ['image']
    ];

      
    var quillTitle = new Quill('#title', {
        theme: 'snow',
        placeholder : '제목을 입력해주세요',
        modules: {
            toolbar: false
          }
    });

    var quillContent = new Quill('#editor', {
        theme: 'snow',
        placeholder : '내용을 입력해주세요',
        modules:{
            toolbar : toolbarOptions,
            imageResize: {
                displaySize: true
              }
        }
    });

    $('#saveButton').click(()=>{
        var board = window.location.pathname;
        board = board.split('/')[1];

        $.ajax({
            method: "POST",
            url: "/write",
            data: {
              board : board,
              title : quillTitle.getText(),
              content : JSON.stringify(quillContent.getContents())
            }
          }).done(function (value) {
            $('#submitWithButton').append(addFormData('updateId',value.id));
            $('#submitWithButton').append(addFormData('board',board));
            $('#submitWithButton').submit();
            // location.href = '/' + board;
          }); 
    });
    window.a = quillContent;
});

function addFormData(name,value){
    return '<input type="hidden" name="'+ name +'" value="'+ value +'">';
}