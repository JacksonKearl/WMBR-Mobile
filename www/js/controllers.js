angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $rootScope.player = {
    playing : false,
    audio : new Audio('http://wmbr.org/WMBR_live_128.m3u'),
    toggleStream : function() {
      if ($rootScope.player.playing) {
        $rootScope.player.audio.pause();
        $rootScope.player.playing = false;
      } else {
        $rootScope.player.audio.play();
        $rootScope.player.playing = true;
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
          var are_playing = true;
          if (!are_playing) {
            // handle case when off air
          }

          var nowOnTheAirLines = $(xmlDoc).find('wmbr_show').text().split('\n');

          $scope.nowPlaying = {showTitle:nowOnTheAirLines[0],
                               currentDJ:nowOnTheAirLines[2],
                         showDescription:nowOnTheAirLines[4]};

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
  
  $scope.$on('$ionicView.enter', function(e) {
    $scope.reload();
  });

  setInterval($scope.reload, 45000);

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
