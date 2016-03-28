angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $rootScope.setPage = function(page) {
    $rootScope.page = page;
  }
  $rootScope.page = "home";

  $rootScope.player = {
    playing : "",
    name: "",
    audio : null,
    toggleStream : function(url, name) {
      if (name && name.length > 30) {
        name = name.substring(0,25) + "...";
      }
      if (!url) url = $rootScope.player.playing;
      if ($rootScope.player.audio == null ) {
        $rootScope.player.audio = new Audio(url);
        $rootScope.player.audio.play();
        $rootScope.player.name = name;
        $rootScope.player.playing = url
      } else if (url !== $rootScope.player.playing) {
        $rootScope.player.toggleStream($rootScope.player.playing);
        $rootScope.player.toggleStream(url, name);
      } else {
        $rootScope.player.playing = null
        $rootScope.player.audio.pause();
        $rootScope.player.audio.remove();
        $rootScope.player.audio.src = "";
        $rootScope.player.audio = null;
      }
    },
    playPauseStream : function () {
      if ($rootScope.player.audio) {
        if ($rootScope.player.audio.paused) {
          $rootScope.player.audio.play();
        } else {
          $rootScope.player.audio.pause();
        }
      }
    }
  };

})

.controller('HomeCtrl', function($scope, $rootScope) {
  //if $rootScope.player) $rootScope.player.playing : false;
  // Used to open new pages in the safari app as opposed to weird new windows
  $scope.goToPage = function(url) {
    window.open(url, "_system", "location=yes");
  }



  $scope.reload = function() {
    $.getJSON('http://whateverorigin.org/get?url=' +
      encodeURIComponent('http://wmbr.org/dynamic.xml') + '&callback=?',
      function (data) {
          var xmlDoc = data.contents.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')


          var nowOnTheAirLines = $(xmlDoc).find('wmbr_show').text().split('\n');
          var are_playing = nowOnTheAirLines[2].indexOf("Currently off the air") === -1;
          if (!are_playing) {
            $scope.nowPlaying = {showTitle:"Oh No!",
                                 currentDJ:"",
                           showDescription:"WMBR is off the air - see you tomorrow!"};
          } else {
            $scope.nowPlaying = {showTitle:nowOnTheAirLines[0],
                                 currentDJ:nowOnTheAirLines[2],
                           showDescription:nowOnTheAirLines[4]};
          }
          var recentlyPlayedLines = $(xmlDoc).find('wmbr_plays').text();

          $scope.haveHistory = recentlyPlayedLines.indexOf("no current playlist") === -1;

          recentlyPlayedLines = recentlyPlayedLines.split('\n');
          $scope.recentlyPlayed = [];

          for (var i = 0; i < recentlyPlayedLines.length-2; i++) {
            var dataLine = recentlyPlayedLines[i];
            var indexTimeEnd = Math.min(dataLine.indexOf('a'), dataLine.indexOf('p'));
            if (indexTimeEnd === -1) {
              indexTimeEnd = Math.max(dataLine.indexOf('a'), dataLine.indexOf('p'));
            }
            indexTimeEnd += 2;
            var songPlayData = {time:dataLine.slice(0,indexTimeEnd),
                              artist:dataLine.slice(indexTimeEnd, dataLine.indexOf(': ')),
                                name:dataLine.slice(dataLine.indexOf(': ')+2)};

            if (songPlayData.time.indexOf(':') !== -1)
              $scope.recentlyPlayed.push(songPlayData);

          }
          $scope.$broadcast('scroll.refreshComplete');
      });
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.reload();
  });

  setInterval($scope.reload, 45000);

})

.controller('InfoCtrl', function($scope, $rootScope, $stateParams) {

  $scope.reload = function() {
    $.getJSON('http://whateverorigin.org/get?url=' +
      encodeURIComponent('http://wmbr.org/dynamic.xml') + '&callback=?',
      function (data) {
          var xmlDoc = data.contents.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')

          var twitterHTML = $(xmlDoc).find('wmbr_twitter').html()
            .replace(/_blank/g,"_system")
            .replace(/href="/g,"onClick=\"window.open(\'")
            .replace(/" class="t/g, "', '_system', 'location=yes')\" class=\"t")
            .replace(/margin: 0px 4px 0px 4px; position:relative/g, "");

          $("#twitter-box").html(twitterHTML);

      });
      $scope.upcomingEvents = [{time:"", title:"loading events..."}];
      $.getJSON('http://whateverorigin.org/get?url=' +
        encodeURIComponent('http://wmbr.org/') + '&callback=?',
        function (data) {
          $scope.upcomingEvents = [];
          $(data.contents).find('.events_date').each( function(index) {
            $scope.upcomingEvents.push({title:"", time:$(this).text()});
          });
          $(data.contents).find('.events_title').each( function(index) {
            $scope.upcomingEvents[index].title = $(this).text();
          });
        });
        $scope.$broadcast('scroll.refreshComplete');

  };

  $scope.reload();

  $scope.$on('$ionicView.enter', function(e) {
    $scope.reload();
  });
})

.controller('PlaylistsCtrl', function($scope, $rootScope, $stateParams) {
  $scope.$on('$ionicView.enter', function(e) {
    //$scope.reload();
  });
})

.controller('ScheduleCtrl', function($scope, $rootScope, $stateParams) {
  $scope.$on('$ionicView.enter', function(e) {
    //$scope.reload();
  });
})

.controller('ArchivesCtrl', function($scope, $rootScope, $stateParams) {
  $scope.archives = [{name:"Now Loading...", time:"", url:""}]
  $scope.reload = function() {
    $.getJSON('http://whateverorigin.org/get?url=' +
      encodeURIComponent('http://wmbr.org/cgi-bin/arch') + '&callback=?',
      function (data) {
        var len = 0;
        $(data.contents).find('tr').each( function(index) {
          $($(this).html()).find('td').each(function (index) {
            if($(this).text().indexOf("MP3") > -1) {
              $scope.archives[len].url = $(this).children().first().attr('href')
              $scope.archives.push({name:"", time:"", url:""})
              len++;
            } else {
            $scope.archives[len].name = $scope.archives[len].time;
            $scope.archives[len].time = $(this).text();
            }
          })
        });
        $scope.archives[len].name = "No more archives avaialble."
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  $scope.$on('$ionicView.enter', function(e) {
    $scope.reload();
  });
});

