
window.addEventListener("load", function(e) {
  var el = document.querySelector(".msg_area");
  el.scrollLeft = el.scrollWidth;
});
$(document).ready(function () {




  $('.close').click(function () {
    ('.ouser').remove();
  });

  $('#s').click(function () {
    $(".si").css('display','block');
    $("#welcome").css('display','none');
    $("#s").css('display','none');
    $("#l").css('display','none');
  });
  $('#l').click(function () {
    $(".li").css('display','block');
    $("#welcome").css('display','none');
    $("#s").css('display','none');
    $("#l").css('display','none');
  });



    var typing;
    var i = -1;
    var username;
    var lusr = $('#usrl').val();
    var socket = io();

    socket.on('usr',function (usr) {
      socket.emit("logusr", usr);
      var l = usr;
      return false;
    });

    $("#main").submit(function (event) {
      if ($('#msg').val() != '') {
        event.preventDefault();
        var mes = $('#msg').val();
        var unm1 = $('#uname').val();
        var salam = 'salam';
        socket.emit("msg", {mes, unm1, salam});
        $('#msg').val('');
        $('.type').remove();
        $('#pop').prop("volume", 0.2);
        $('#pop').get(0).play();
        return false;
      }
      else {
        event.preventDefault();
      }
    });
    $("#main2").submit(function (event) {
      if ($('#msg2').val() != '') {
        event.preventDefault();
        var pvmsg = $('#msg2').val();
        var unm1 = $('#uname').val();
        var salam = 'salam';
        socket.emit("pvmsg", {pvmsg, unm1, salam});
        $('#msg2').val('');
        $('#pop').prop("volume", 0.2);
        $('#pop').get(0).play();
        return false;
      }
      else {
        event.preventDefault();
      }
    });

    $(".sign_in").submit(function (e) {
      e.preventDefault();
      socket.emit("usr", $('#usr').val());
      socket.emit("pass", $('#pass').val());
      $(".chatbody").css('display','block');
      $(".group").css('display','block');
      $(".si").css('display','none');
      $("body").css('background-image', 'url("—Pngtree—hand drawn autumn hello park_921053.jpg")');
      return false;
    });

    $(".log_in").submit(function (e) {
      e.preventDefault();
      socket.emit("logusr", $('#usrl').val());
      socket.emit("logpass", $('#passl').val());
      $(".chatbody").css('display','block');
      $(".li").css('display','none');
      $(".group").css('display','block');
      $("body").css('background-image', 'url("—Pngtree—hand drawn autumn hello park_921053.jpg")');
      $('#uname').val($('#usrl').val());
      return false;
    });

    var x = 0;
    socket.on('msg2', function (msg2) {
        i++;
        var eq = msg2.unm1;
        $('#cha1').append("<div class='msg'>"+msg2.mes+"<div class='date' id='l_"+x+"_m'>"+msg2.h+":"+msg2.min+":"+msg2.sec+"</div></div>");
        $('#cha1').scrollTop($('.msg')[i].offsetTop);
        /*setInterval(function(){
          var d = new Date();
          var sec = d.getSeconds();
          var min = d.getMinutes();
          var h = d.getHours();
          //clac time diff
          if (sec > msg2.sec ,min == msg2.min && msg2.h == h) {
            $('#l_'+x+'_m').text("کمتر از یک دقیقه پیش");
            x++;
          }else if (min > msg2.min && msg2.h == h) {
            var mindiff = min - msg2.min;
            $('#l_'+x+'_m').text( mindiff+ 'دقیقه پیش');
            x++;
          }else if ( h > msg2.h) {
            var hdiff = h - msg2.h;
            $('#l_'+x+'_m').text('ساعت پیش'+ hdiff);
            x++;
          }else if ((h - msg2.h) > 24) {
            var daydiff = msg2.h / 24 ;
            $('#l_'+x+'_m').text('روز پیش'+ daydiff);
            x++;
          }
        }, 1000);*/
        if (eq == $('#uname').val()) {
          $('.msg:last-child').css({'background-color':'#ffa9a1','color':'white','left':'50%','border-bottom-right-radius':'0','border-bottom-left-radius':'30px'});
          $('.date').css('left', '35%')
        }
    });
    socket.on('pvmsg', function (pvmsg) {
        i++;
        $('.chatbox').css('display','none');
        $('#ch2').css('display','block');
        $('.msg').css('display','none');
        var eq2 = pvmsg.usrnm;
        var val = $('#uname').val();
        $('#cha2').append("<div class='msg2'>"+pvmsg.pv+"</div>");
        $('#cha2').scrollTop($('.msg2')[i].offsetTop);
        if (eq2 == val) {
          $('.msg2:last-child').css({'background-color':'#ffa9a1','color':'white','left':'50%','border-bottom-right-radius':'0','border-bottom-left-radius':'30px'});
        }
    });

    socket.on('logusr', function (logusr) {
      var username = logusr;
      $(".onlineu").append('<li class="ouser" id="'+username+'">!الان آنلاینه '+username+'<div class="close">&times</div></li>');
        $('.navclick').css({'background-color':'#FF6F61','animation':' pic .5s forwards'});
      });

    var height = 0;
    $('.nc_con').click(function (event) {
      if (height == 0) {
        $('.chatnav').height('700px');
        if ($('.navclick').css({'background-color':'#FF6F61'})) {
          $('.navclick').css({'background-color':'#0f4c81','animation':'none'});
        }
        height = 1;
      }else {
        $('.chatnav').height('0px');
        height = 0;
      }
    });
    $("#msg").focus(function () {
      if (event.which != 13) {
        var typing = "is typing..."
        socket.emit('typing', typing);
      }
    });
    $("#msg").focusout(function () {
      var untype = 'typeFinished';
      socket.emit('untype', untype);
      $('.type').remove()
    });
    /*socket.on('untype', function (untype) {
      $('.type').remove()
    });
    socket.on('typing', function (typing) {
      $('.chatbox').append('<div class="type">'+typing+'</div>');
    });*/

    socket.on('dis', function (logusr) {
      var a = '#'+logusr;
      $(a).remove();
      $("#onlineu").append('<li class="ouser" id="'+logusr+'">!آفلاین شد '+logusr+'<div class="close">&times</div></li>');
    });

    /*socket.on('his', function (his) {
      for (var i = 0; i < his.length; i++) {
        $('.msg_area').append("<div class='msg'>"+his[i]+"</div>");
        $('.msg:last-child').css({'background-color':'#ffa9a1','color':'white','left':'50%','border-bottom-right-radius':'0','border-bottom-left-radius':'30px'});
        $('.date').css('left', '35%')
      }
    });*/


    $('.addroom').click(function () {
      var reqpv = "salam"
      socket.emit('reqpv', reqpv);
      $('.chatbox').css('display','none');
      $('#ch2').css('display','block');
      $('.msg').css('display','none');
    });

    socket.on('hi', function (id) {
      alert('hi '+id);
    })
});
