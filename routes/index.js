var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var multer = require('multer');
var path = require('path');
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + "_" + file.originalname);
    }
  }),
});

const Sequelize = require('sequelize');
const sequelize = new Sequelize('openyearround', 'postgres', '2013', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const User = sequelize.define('user', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING, allowNull: false },
  password: { type: Sequelize.STRING },
  salt: { type: Sequelize.STRING },
  phone: { type: Sequelize.STRING },
  year: { type: Sequelize.INTEGER },
  major: { type: Sequelize.STRING },
  authorities: { type: Sequelize.STRING }
});

const Authority = sequelize.define('authority', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING, allowNull: false }
});

const Notice = sequelize.define('notice',{
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: Sequelize.STRING, allowNull: false },
  content: { type: Sequelize.TEXT, allowNull: true },
  writer : { type: Sequelize.STRING, allowNull: false},
  file : { type : Sequelize.TEXT, allowNull : true}
});

const Assignment = sequelize.define('assignment',{
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: Sequelize.STRING, allowNull: false },
  content: { type: Sequelize.TEXT, allowNull: true },
  writer : { type: Sequelize.STRING, allowNull: false},
  file : { type : Sequelize.TEXT, allowNull : true}
});

router.post('/upload', upload.array('userfile'), function(req, res){
  // res.send('Uploaded! : '+req.file); // object를 리턴함
  // console.log(req);
  console.log(req.files); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.

  var updateId = req.body.updateId;
  var board = req.body.board;
  var boardModel;
  switch(board){
    case 'notice' : 
      boardModel = Notice;
      break;
    case 'assignment' : 
      boardModel = Assignment;
      break;
      default:
      break;
  }

  boardModel.update(
    {file : JSON.stringify(req.files)},
    {returning: true, where: {id: updateId} }
  ).then(function([ rowsUpdate, [updatedBook] ]) {
    res.redirect('/' + board);
  })
  // boardModel.findOne({where: {id : updateId}}).then(content => {
  //   content.updateAttributes({
  //     file : req.files
  //   }).then(function(){
  //     res.redirect('/' + board);
  //   });
  // });
});

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.session);
  var loginText = req.session.name ? req.session.name : '로그인';
  res.render('index', { title: 'Express', loginText: loginText });
});

router.get('/introduce', function (req, res, next) {
  var loginText = req.session.name ? req.session.name : '로그인';
  res.render('intro', { breadcrumb: '동아리소개', loginText: loginText });
});

router.get('/activity', function (req, res, next) {
  var loginText = req.session.name ? req.session.name : '로그인';
  res.render('activity', { breadcrumb: '주요활동', loginText: loginText });
});

router.get('/mypage', function(req, res, next) {
  var loginText = req.session.name ? req.session.name : '로그인';
  CheckLoginOrRedirectToHome(loginText,res);
  User.findOne({ where: { name: req.session.name } }).then(result => {
    res.render('mypage', { breadcrumb: '마이페이지', loginText: loginText , info : result});  
  });
});

router.get('/notice', function (req, res, next) {
  var loginText = req.session.name ? req.session.name : '로그인';
  res.render('board', { breadcrumb: '공지사항', loginText: loginText });
});

router.get('/notice/write', function(req, res){
  var loginText = req.session.name ? req.session.name : '로그인';
  CheckAuthority(req.session.name,'운영진').then( result  => {
    if(!result)
      res.redirect('/');
    
    res.render('write', { breadcrumb: '공지사항', loginText: loginText });  
  }); 
});

router.get('/notice/:id', function(req, res, next){
  var loginText = req.session.name ? req.session.name : '로그인';

  CheckAuthorityAndRedirectToHome(loginText,'공지사항-읽기',res);

  Notice.findOne({where: {id : req.params.id},raw:true}).then(content => {
    var title = content.title;
    title = title.replace(/\n/g, "");
    res.render('detail',{ breadcrumb: '공지사항',
      loginText: loginText,
      id : content.id,
      title : title,
      writer : content.writer,
      content : content.content,
      createdAt : content.createdAt,
      file : content.file
    });
  });
});

router.get('/assignment', function (req, res, next) {
  var loginText = req.session.name ? req.session.name : '로그인';
  CheckAuthorityAndRedirectToHome(loginText,'과제-읽기',res);
  res.render('board', { breadcrumb: '과제', loginText: loginText });
});

router.get('/assignment/write', function(req, res){
  var loginText = req.session.name ? req.session.name : '로그인';
  CheckAuthority(req.session.name,'과제-글쓰기').then( result  => {
    if(!result)
      res.redirect('/');
    
    res.render('write', { breadcrumb: '과제', loginText: loginText });  
  }); 
});

router.get('/assignment/:id', function(req, res, next){
  var loginText = req.session.name ? req.session.name : '로그인';

  CheckAuthority(req.session.name,'과제-읽기').then( result => {
    Assignment.findOne({where: {id : req.params.id},raw:true}).then(content => {
      var canRead = false;
      if(result){
        canRead = true;
      }
      else{
        if(req.session.name == content.writer)
          canRead = true;
      }
      if(!canRead)
        res.redirect('/');
      else{
        var title = content.title;
        title = title.replace(/\n/g, "");
        res.render('detail',{ breadcrumb: '과제',
          loginText: loginText,
          id : content.id,
          title : title,
          writer : content.writer,
          content : content.content,
          createdAt : content.createdAt,
          file : content.file
        });
      }
    });
  });

  // CheckAuthority(req.session.name,'과제-읽기').then( result => {
  //   console.log('result = ' + result);
  //   if(!result)
  //     res.redirect('/');
  //   else{
  //     Assignment.findOne({where: {id : req.params.id},raw:true}).then(content => {
  //       console.log(req.session.name,content.writer);
  //       if(req.session.name != content.writer)
  //         res.redirect('/');
  //       else{
  //         var title = content.title;
  //         title = title.replace(/\n/g, "");
  //         res.render('detail',{ breadcrumb: '과제',
  //           loginText: loginText,
  //           id : content.id,
  //           title : title,
  //           writer : content.writer,
  //           content : content.content,
  //           createdAt : content.createdAt,
  //           file : content.file
  //         });
  //       }
  //     });
  //   }
  // });
  // CheckAuthorityAndRedirectToHome(loginText,'과제-읽기',res);

});

router.get('/admin', function (req, res, next) {
  var loginText = req.session.name ? req.session.name : '로그인';
  User.findAll().then(users => {
    Authority.findAll().then(authorities => {
      res.render('admin', { breadcrumb: '관리자 페이지', loginText: loginText, users : users, authorities : authorities });
    })
  })
});

router.get('/member/:name', function(req, res){
  if(req.session.name){
    User.findOne({ where: { name: req.session.name } }).then(user => {
      if(user.dataValues.authorities == '')
        res.send("권한이 없습니다");      
      var authorities = JSON.parse(user.dataValues.authorities);
      var flag = false;
      for(var i=0; i<authorities.length; i++){
        if(authorities[i] == '운영진' || req.params.name == req.session.name){
          flag = true;
          User.findOne({ where: { name: req.params.name } }).then(final => {
            res.send(final);
          });
        }
      }
      if(!flag)
        res.send("권한이 없습니다");
    });
  }
  else{
    res.send("권한이 없습니다");
  }
});

router.get('/setting', function (req, res, next) {
  Authority.sync({ force: true }).then(() => {
    Authority.create({ name: "운영진" });
    Authority.create({ name: "회원" });
    
    Authority.create({ name: "공지사항-글쓰기" });
    Authority.create({ name: "공지사항-읽기" });
    Authority.create({ name: "공지사항-댓글달기" });
    
    Authority.create({ name: "회비내역-수정" });
    Authority.create({ name: "회비내역-읽기" });

    Authority.create({ name: "스터디자료-글쓰기" });
    Authority.create({ name: "스터디자료-읽기" });
    Authority.create({ name: "스터디자료-댓글달기" });

    Authority.create({ name: "과제-글쓰기" });
    Authority.create({ name: "과제-읽기" });
    Authority.create({ name: "과제-댓글달기" });
  });
});

router.get('/signup', function (req, res, next) {
  User.sync({ force: true }).then(() => {
    signUp(User, "진여준", "wlsduwns", "010-9927-3320", 13, "컴퓨터공학과", "");
    signUp(User, "가재희", "rkwogml", "010-5039-7920", 14, "컴퓨터공학과", "");
    signUp(User, "김시훈", "rlatlgns", "010-3212-4481", 13, "컴퓨터공학과", "");
    signUp(User, "김영서", "rladudtj", "010-3613-3397", 16, "정보보호학과", "");
    signUp(User, "김지은", "rlawldms", "010-9315-7122", 15, "환경에너지공간융합학과", "");
    signUp(User, "박정환", "qkrwjdghks", "010-2456-9959", 13, "컴퓨터공학과", "");
    signUp(User, "배다현", "qoekgus", "010-7763-0972", 15, "컴퓨터공학과", "");
    signUp(User, "복지호", "qhrwlgh", "010-5599-3010", 16, "정보보호학과", "");
    signUp(User, "신동민", "tlsehdals", "010-4163-2836", 17, "컴퓨터공학과", "");
    signUp(User, "신유정", "tlsdbwjd", "010-8931-1483", 18, "전자정보통신공학과", "");
    signUp(User, "이채원", "dlcodnjs", "010-8668-3577", 17, "지능기전공학부 스마트기기", "");
    signUp(User, "정선아", "wjdtjsdk", "010-3323-2110", 17, "데이터사이언스학과", "");
    signUp(User, "정지연", "wjdwldus", "010-2017-1784", 13, "컴퓨터공학과", "");
    signUp(User, "최세인", "chltpdls", "010-9662-0037", 14, "컴퓨터공학과", "");
    signUp(User, "한성진", "gkstjdwls", "010-6369-8694", 13, "컴퓨터공학과", "");
    signUp(User, "한진우", "gkswlsdn", "010-2045-3526", 13, "컴퓨터공학과", "");
  });
});

router.post('/login', function (req, res, next) {
  var name = req.body.name;
  var password = req.body.password;
  User.findOne({ where: { name: name } }).then(user => {
    myCryptSalt(password, user.salt, function (value) {
      if (value.password == user.password) {
        req.session.name = name;
        res.setHeader('Content-Type', 'application/json');
        res.send({result : 'success'});
      }
      else
        res.send({result: 'fail' });
    });
  })
});

router.post('/logout', function (req, res, next){
  req.session.name = "";
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ result: true }));
});

router.post('/board',function(req,res,next){
  var board = req.body.board;
  var boardModel;
  switch(board){
    case 'notice':
      boardModel = Notice;
    break;
    case 'assignment' : 
      boardModel = Assignment;
      break;
    break;
  }
  boardModel.findAll({raw: true}).then(contents => {
    res.send(contents);
  });
});


router.post('/boardAuthorityCheck', (req,res,next) => {
  var name = req.session.name;
  var board = req.body.board;
  var action = req.body.action;
  var autority = board + '-'+ action;
  var writer = req.body.writer;

  CheckAuthority(name,autority).then((result)=>{
    if(!result){
      console.log(action,req.session.name,writer);
      if(action == '읽기' && req.session.name == writer)
        res.send(200,{result : true});
      else
        res.send(200,{result : false});

    }
    else
      res.send(200,{result : true});
  });
});

router.post('/write', function (req,res,next){
  var board = req.body.board;
  var title = req.body.title;
  var content = req.body.content;
  var boardModel;

  switch(board){
    case 'notice' : 
      boardModel = Notice;
      break;
      case 'assignment' : 
      boardModel = Assignment;
      break;
      default:
      break;
  }

  // console.log("data = " + JSON.stringify(req.files));
  
  boardModel.sync().then(() => {
    boardModel.create({
      title: title,
      content : content,
      writer : req.session.name
    }).then(data =>{
      // console.log(data);
      res.send(200,{id : data.id});
    });
  });
});

router.post('/mypage' ,function(req, res, next){
  User.findOne({ where: { name: req.session.name } }).then(user => {
    if (user) {
      myCrypt(req.body.password, (value) =>{
        user.updateAttributes({password : value.password});
        user.updateAttributes({salt : value.salt});
        res.send(200);
      });
    }
  });
});

router.post('/admin/management',function (req, res, next) {
  // var name = req.body.name;
  var jsonObject = {
    'test' : 1
  };

  var find = req.body.find;
  var update = {
    name : req.body.name,
    phone : req.body.phone,
    year : req.body.year,
    major : req.body.major,
    authorities : req.body.authorities
  };

  User.findOne({ where: { name: find } }).then(user => {
    if (user) {
      user.updateAttributes({name : update.name});
      user.updateAttributes({phone : update.phone});
      user.updateAttributes({year : update.year});
      user.updateAttributes({major : update.major});
      user.updateAttributes({authorities : update.authorities});
    }
    res.send(200);
  });

});

var CheckAuthorityAndRedirectToHome = function(name, authority, res){
  if(name == '로그인')
    res.redirect('/');
  else{
    CheckAuthority(name,authority).then( result  => {
      if(!result)
        res.redirect('/');
    }); 
  }
}

var CheckLoginOrRedirectToHome = function(name, res){
  if(name == '로그인')
    res.redirect('/');
}

var CheckAuthority = function ( name, autority ){
  return new Promise(function(callback){
    if(name){
      User.findOne({ where: { name: name } }).then(user => {
        if(user.dataValues.authorities == '')
          callback(false);      
        var authorities = JSON.parse(user.dataValues.authorities);
  
        for(var i=0; i<authorities.length; i++){
          if(authorities[i] == autority){
            // console.log(autority,authorities[i]);
            callback(true);
          }
        }
        callback( false );
      });
    }
    else{
      callback( false );
    }
  });
};

var signUp = function (User, name, password, phone, year, major, authorities) {
  myCrypt(password, function (value) {
    User.create({
      name: name,
      password: value.password,
      salt: value.salt,
      phone: phone,
      year: year,
      major: major,
      authorities : authorities
    });
  });
};

var myCrypt = function (password, fn) {
  crypto.randomBytes(64, (err, buf) => {
    var mySalt = buf.toString('base64');
    crypto.pbkdf2(password, mySalt, 103927, 64, 'sha512', (err, key) => {
      var returnValue = {
        salt: mySalt,
        password: key.toString('base64')
      };
      fn(returnValue);
    });
  });
};

var myCryptSalt = function (password, salt, fn) {
  crypto.pbkdf2(password, salt, 103927, 64, 'sha512', (err, key) => {
    var returnValue = {
      password: key.toString('base64')
    };
    fn(returnValue);
  });
};

module.exports = router;
