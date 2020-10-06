var express = require('express');
var app = express();
var http = require('http').createServer(app);
function app(req, res) {
  if (req.url == '/upload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldp = files.filetoupload.path;
      var newp = '/usr/nodejs/public' + files.filetoupload.name;
      fs.rename(oldp, newp, function err() {
        //console.log('file uploaded .');
        res.end();
      });
    });
  }
};
var io = require('socket.io')(http);
var mysql = require('mysql');
var fs = require('fs');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mo137777",
  database : "message"
});
var con2 = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mo137777",
  database : "msg"
});


// connecting to databases
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database1.");
});
con2.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database2.");
});


//getting route
app.use(express.static('public'));
app.use(express.static('src'));


var usercounter = 0;
var count = 0;
var people = [];
var roomArray = [];
var roomId = [];
//Socket connecting
io.on('connection',function (socket) {
  //user connection
  var sid = socket.id;
  console.log("user "+sid+" connected.");

  //check if usrname exists
  socket.on('usrcheck', function (usrcheck) {
    var usrcheck1 = 'select table_name from information_schema.tables where table_type = "BASE TABLE" and TABLE_SCHEMA = "message" and table_name LIKE "'+usrcheck+'%"  order by table_schema, table_name';
    con.query(usrcheck1, function (err, res) {
      if (err) {
        throw err;
      }
      if (res == usrcheck) {
        console.log('exists: '+res);
      }
      else {
        console.log('allowed '+res);
      }
    });
  });

  usercounter++ ;
  console.log(usercounter+ ' user(s) are online.');
  //getting new username
  socket.on('usr', function (usr) {
    //Creat table foe newuser
    var ntable = "CREATE TABLE "+usr+" (id INT AUTO_INCREMENT PRIMARY KEY, user VARCHAR(255),pass INT, text VARCHAR(255), time DATE)"
    con.query(ntable, function (err, res) {
      console.log(usr+' table created: '+res);
    });
    io.emit('usr', usr);
    console.log('user sends');
  });
    //getting exiting username
  socket.on('logusr', function (logusr) {
    console.log(logusr+ ' loged in.');
    //sending username to client
    socket.broadcast.emit('logusr', logusr);

    //get all socketId
    var u = logusr;
    var count = 0;
    people[u] = sid;
    //Showing previuse messages from database
    var sql1 = "SELECT * FROM "+logusr+"";
    con.query(sql1, function (err, res) {
      var his = res.map(usr=>usr.text);
      io.emit('his', his);
    });
    //getting new msg
    socket.on('msg',function (msg) {
      /*var ok = "INSERT INTO uId (uname, uid) VALUES ('"+logusr+"', '"+socket.id+"')";
      con.query(ok, function (err, res) {
        if (err) throw err;
        var socid = res.insertId
        console.log(msg.salam);
        var oh = "SELECT uid FROM uId WHERE uname = '"+msg.salam+"'";
        con.query(oh, function (err1, res1) {
          if (err1) throw err1;
          var j = msg.salam;
          var hik = res1.map(j=>j.uid);
          var ni = hik[hik.length-1];
          socket.join(ni);
          socket.to(ni).emit('msg2', mes);
        });
      });*/
      //getting date
      var d = new Date();
      var day = d.getDate();
      var m = d.getMonth();
      var y = d.getFullYear();
      var sec = d.getSeconds();
      var min = d.getMinutes();
      var h = d.getHours();
      if (day < 10) {
        var day1 = '0'+day;
      }
      else {
        var day1 = day;
      }
      if (m < 10) {
        var m1 = '0'+m;
      }
      else {
        var m1 = m;
      }
      if (y < 10) {
        var y1 = '0'+y;
      }
      else {
        var y1 = y;
      }
      if (sec < 10) {
        var sec1 = '0'+sec;
      }
      else {
        var sec1 = sec;
      }
      if (min < 10) {
        var min1 = '0'+min;
      }
      else {
        var min1 = min;
      }
      if (h < 10) {
        var h1 = '0'+h;
      }
      else {
        var h1 = h;
      }
      var okdate = y1+'-'+m1+'-'+day1;
      var oktime = y1+'-'+m1+'-'+day1+' '+h1+':'+min1+':'+sec1;

      //insert msg to database
      var sql = "INSERT INTO "+logusr+" (user, text, time) VALUES ('user', '"+msg.mes+"', '"+oktime+"')";
      con.query(sql, function (err, result) {
        if (err) throw err;
        });
        var unm1 = msg.unm1;
        var mes = msg.mes;
        var sec = d.getSeconds();
        var min = d.getMinutes();
        var h = d.getHours();
        //sending msg&date for client
        io.emit('msg2', {mes, sec, min, h , unm1});
    });

    // echo a user is typing to all
    socket.on('typing', function (typing) {
      typing = logusr+' is typing';
      io.emit('typing', typing);
    });

    //emit if user stoped typing
    socket.on('ontype', function (untype) {
      io.broadcast.emit('untype',untype);
    })

    //emit if user disconnected
    socket.on("disconnect", function (dis) {
      io.emit('dis', logusr);
    });





















    var num = 0;
    //recieve private msg
    socket.on('pvmsg',function (pvmsg) {
      var pv = pvmsg.pvmsg;
      var usrnm = pvmsg.unm1;
      /*var pvinsert = "INSERT INTO "+pvname+usrnm+" (name, msg) VALUES ('"+usrnm+"', '"+pv+"')";
      con.query(pvinsert, function (err, res) {
        if (err) {
          throw err;
        }
        console.log('inserted!');
      });*/
      var roomname = roomArray[usrnm];
      io.to(roomname).emit('pvmsg', {pv, usrnm, roomname});
      console.log('sending msg to '+roomArray[usrnm]+' room');
      // emit notification
      if (num == 0) {
        socket.to(roomId[usrnm]).emit('pvnotif', {usrnm, roomname});
        console.log('sending notif to '+roomId[usrnm]+' room');
        num++;
        console.log(num);
      }
      else {
        num++;
        socket.to(roomId[usrnm]).emit('num', num);
        console.log(num);
      }
    });

    socket.on('reqpv', function (reqpv) {
      num = 0;
      var pvname = reqpv.reqpv;
      var self = reqpv.selfname;
      var id = people[pvname];
      var room = pvname+self;
      roomArray[self] = room;
      roomId[self] = id;
      console.log(roomArray);
      console.log(roomId);
      if (id) {
        console.log('sending request for pv chat to '+id+'...');
        socket.join(room);
        io.to(id).emit('room', room);
        console.log('joinied to '+room);
      }
      else {
        console.log('Target user is offline.');
      }
      /*var pvchattable = 'CREATE TABLE IF NOT EXISTS '+pvname+logusr+' (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), msg VARCHAR(2555));'
      con.query(pvchattable, function (err, res) {
        if (err) {
          throw err;
        }
      });
      var history = 'SELECT * FROM '+pvname+logusr+'';
      con.query(history, function (err, res) {
        if (err) {
          throw err;
        }
      });*/
    });
  });
  //user disconnection
  socket.on("disconnect", function () {
    usercounter--;
    console.log('user '+socket.id+' disconnected. '+usercounter+' user(s) are online.');
  });


  socket.on('joinroom', function (joinroom) {
    var jr = joinroom.joinroom;
    var jn = joinroom.self;
    socket.join(jr);
    roomArray[jn] = jr;
    console.log(jn+' joined to '+jr);
    console.log(roomArray);
  });

  //deleteing a pvchat
  socket.on('deletechat', function (deln) {
    console.log('leaving '+deln+' room');
    socket.leave(deln);
  });


  //searchin in usernames
  socket.on('search', function (key) {
    var search = 'select table_name from information_schema.tables where table_type = "BASE TABLE" and TABLE_SCHEMA = "message" and table_name LIKE "%'+key+'%"  order by table_schema, table_name';
    con.query(search, function (err, res) {
      if (err) {
        console.log('erroe accured!');
      }
      if (res == '') {
        var no = 'no result found';
        socket.emit('no', no);
      }
      else {
        var name = 'INFORMATION_SCHEMA.TABLES';
        var tab1le = 'TABLE_NAME';
        var f = res.map(name=>name.TABLE_NAME);
        socket.emit('res', f);
      }
    });
  });

});



/*var d = 'DROP TABLE salam_mahdi,salam_salam, salamadel,salammahdi, salamsalam, uId, user';
con.query(d, function (err, res) {
  if (err) {
    throw err;
  }
  console.log(res);
});*/



//Server connection
http.listen(3000, function () {
  console.log("Server is Ready!");
});
