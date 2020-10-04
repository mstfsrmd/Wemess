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


// connecting to database
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Database!");
});

//getting route
app.use(express.static('public'));
app.use(express.static('src'));


var usercounter = 0;
var count = 0;
var people = [];
//Socket connecting
io.on('connection',function (socket) {
  //user connection
  console.log("user "+sid+" connected.");
  var sid = socket.id;

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
    global.logusr = logusr;
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






















    //recieve private msg
    socket.on('pvmsg',function (pvmsg) {
      console.log(id);
      var pv = pvmsg.pvmsg;
      var usrnm = pvmsg.unm1;
      console.log(usrnm+":"+pv);
      var pvinsert = "INSERT INTO "+pvname+usrnm+" (name, msg) VALUES ('"+usrnm+"', '"+pv+"')";
      con.query(pvinsert, function (err, res) {
        if (err) {
          throw err;
        }
        console.log('inserted!');
      });
      io.to(id).emit('pvmsg', {pv, usrnm});
    });
  });
  //user disconnection
  socket.on("disconnect", function () {
    usercounter--;
    console.log('user '+socket.id+' disconnected. '+usercounter+' user(s) are online.');
  });

  socket.on('reqpv', function (reqpv) {
    global.pvname = reqpv;
    global.id = people[reqpv];
    var pvchattable = 'CREATE TABLE IF NOT EXISTS '+pvname+logusr+' (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), msg VARCHAR(2555));'
    con.query(pvchattable, function (err, res) {
      if (err) {
        throw err;
      }
      console.log(res);
    });
    var history = 'SELECT * FROM '+pvname+logusr+'';
    con.query(history, function (err, res) {
      if (err) {
        throw err;
      }
      console.log(res);
    });
    if (id) {
      console.log('sending request for pv chat to '+id+'...');
      socket.join(id);
      //io.to(id).emit('hi', id);
    }
    else {
      console.log('user is offline.');
    }

  });

});







//Server connection
http.listen(3000, function () {
  console.log("Server is Ready!");
});
