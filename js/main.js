/*
 * Open the drawer when the menu icon is clicked.
 */
var menu = document.querySelector('#menu');
var main = document.querySelector('main');
var drawer = document.querySelector('.nav');

menu.addEventListener('click', function(e) {
    drawer.classList.toggle('open');
    e.stopPropagation();
});
main.addEventListener('click', function() {
    drawer.classList.remove('open');
});

var map;
// Create a new blank array for all the listing markers.
var markers = [];
var markersActive;
var largeInfowindow;
var locations = [{
        title: 'Kingdom Centre',
        location: {
            lat: 24.711309,
            lng: 46.674447
        }
    },
    {
        title: 'Al Faisaliyah Center',
        location: {
            lat: 24.69028,
            lng: 46.684976
        }
    },
    {
        title: 'King Fahd International Stadium',
        location: {
            lat: 24.736122,
            lng: 46.574961
        }
    },
    {
        title: 'Prince Faisal bin Fahd Stadium',
        location: {
            lat: 24.669558,
            lng: 46.734377
        }
    },
    {
        title: 'Royal Saudi Air Force Museum',
        location: {
            lat: 24.753497,
            lng: 46.740142
        }
    },
    {
        title: 'National Museum of Saudi Arabia',
        location: {
            lat: 24.638242,
            lng: 46.653041
        }
    }
];

function ViewModel() {
    var self = this;
    self.keywords = ko.observable("");
    self.list = ko.observableArray(locations);

    self.clickLink = function(index) {
 largeInfowindow = new google.maps.InfoWindow();

        populateInfoWindow(markers[index], largeInfowindow);

        drawer.classList.remove('open');
    };
    self.filterclick = function() {
      if (self.keywords() ===""){
        alert("Please enter search keywords ");
      }
      else{
        var result = [];
        locations.forEach(function(item) {
            if (item.title.toLowerCase().includes(self.keywords().toLowerCase())) {
                result.push(item);
            }

        });
        if (result.length === 0) {
            alert("the location does not exit");
        }
        self.list(result);

        hideMarkers(markers);
        creatMaker(result);
        showListings();
    }
  };
    self.showAll = function() {
        self.list(locations);

        hideMarkers(markers);
        creatMaker(locations);
        showListings();
    };
    self.hideAll = function() {
        hideMarkers(markers);
    };

}
ko.applyBindings(new ViewModel());

function creatMaker(list) {
    markers = [];

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');


    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < list.length; i++) {
        // Get the position from the location array.
        var position = list[i].location;
        var title = list[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', ClickMaker);
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
      //  marker.addListener('mouseover', mouseoverFunction);
      //  marker.addListener('mouseout', mouseoutFunction);
    }

}
function ClickMaker() {
largeInfowindow = new google.maps.InfoWindow();

 populateInfoWindow(this, largeInfowindow);

}
/*function mouseoverFunction() {
// Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');
 this.setIcon(highlightedIcon);
}

function mouseoutFunction() {
// Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
 this.setIcon(defaultIcon);
}*/

function initMap() {

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 24.713552,
            lng: 46.675296
        },
        zoom: 13,
        mapTypeControl: false
    });
    creatMaker(locations);
    showListings();
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  var defaultIcon = makeMarkerIcon('0091ff');

  if (markersActive != marker && markersActive){
    markersActive.setIcon(defaultIcon);
  }
map.panTo(marker.getPosition());
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      markersActive=marker;
      var highlightedIcon = makeMarkerIcon('FFFF24');
      marker.setIcon(highlightedIcon);
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
       marker.setIcon(defaultIcon);
            infowindow.marker = null;
        });

        gewiki(marker, infowindow);

        infowindow.open(map, marker);
    }
}


function gewiki(marker, infowindow) {

    var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + marker.title + "&format=json&callback=wikiCallback";
    $.ajax({

        url: wikiUrl,
        dataType: "jsonp",
        // jasonp: "callback",
        success: function(response) {

            var smallDiscription = response[2][0];
            var link = response[3][0];
            var articlelink = link;

            infowindow.setContent('<div id="pano"><h2>' + marker.title + '</h2><p>' +
                smallDiscription + '</p>' + '<a href="' + articlelink +
                '">> Read More</a></div>');


        },
        error: function() {
            infowindow.setContent(" Error on Wikipedia");
        }
    });
}
// This function will loop through the markers array and display them all.
function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {

    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
//ErrorHandlingFunction
function ErrorHandlingFunction(){
  alert("Error when connect to Google API");
}

