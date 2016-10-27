angular.module('starter')
  .factory('signaling', function (socketFactory) {
    var socket = io.connect('http://localhost:4000/');
    //var socket = io.connect('http://infinite-sands-4434.herokuapp.com')
    var socketFactory = socketFactory({
      ioSocket: socket
    });

    return socketFactory;
  });