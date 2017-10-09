/**
 * San Francisco Food truck Finder Demo
 *
 */
var limit = 10; // the maximum number of food trucks to search.
var foodTrucksUrl = "https://data.sfgov.org/resource/6a9r-agq8.json";
var gmarkers = []; // global variable for foodtruck markers
// Map initialization (callback)
function initMap() {
    // options for Google map display (Center[Lat, Long]: San Francisco, CA)
    var options = {
        center: new google.maps.LatLng(37.77493, -122.41942),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    // google map initialization
    var map = new google.maps.Map($("#map")[0], options);
    var pointer = new google.maps.Marker({position: options.center, map: map});
    var infowindow = new google.maps.InfoWindow({content: "(1.10, 1.10)"});
    // Pointer click event
    google.maps.event.addListener(pointer, 'click', function() {
        infowindow.open(map, pointer);
    });
    // Click event to the map to emulate current position
    google.maps.event.addListener(map, "click", function (e) {
        // delete all markers
        deleteMarkers();
        // set position
        pointer.setPosition(e.latLng);
        var pos = e.latLng, o = "(" + pos.lat().toFixed(6) + ", " + pos.lng().toFixed(6) + ")";
        infowindow.setContent(o);
        infowindow.open(map, pointer);

        // Fetch closest food trucks
        $.ajax({
            url: foodTrucksUrl,
            type: "GET",
            data: {
                "status" : "APPROVED",
                "$where": "expirationdate > '" + (new Date()).toISOString().replace(/Z/, '') + "'"
                  + " AND within_circle(location, "
                  + pos.lat().toFixed(6) + ", "
                  + pos.lng().toFixed(6) + ", 1000)",
                "$select": "*", // , distance_in_meters(location, 'POINT(" + pos.lat().toFixed(6) + " " + pos.lng().toFixed(6) + ")')
                //"$order" : "range",
                "$limit" : limit,
                "$$app_token": "YATDx7e2s5IEl8TBGenHRVYgJ"
            }
        }).done(function(trucks) {
            if(trucks && trucks.length > 0) {
                $.each(trucks, function(idx, truck) {
                    // Add a marker for the location of the food truck
                    var marker = new google.maps.Marker({
                      position: new google.maps.LatLng(truck.location.coordinates[1],
                                    truck.location.coordinates[0]),
                      map: map,
                      animation: google.maps.Animation.DROP,
                      icon: "./img/foodtruck.png",
                      title: truck.applicant,
                      optimized: false
                    });
                    // add marker to global array
                    gmarkers.push(marker);
                    // get the distance
                    var range = calcDistance(pos.lat(), pos.lng(), truck.location.coordinates[1], truck.location.coordinates[0]);
                    // Add an InfoWindow with details about the truck
                    var markerInfo = new google.maps.InfoWindow({
                      content: '<div class="info-window">'
                        + '<h4>' + truck.applicant + '</h4>'
                        + '<h5>' + Math.round(parseFloat(range)) + ' meters away.</h5>'
                        + '<p>' + truck.fooditems + '</p>'
                        + '</div>'
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                      markerInfo.open(map, marker);
                    });
                });
            } else {
                // No Food trucks nearby
                alert("No Food trucks found nearby the pointer.");
            }
        });
    });
}
// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    for (var i = 0; i < gmarkers.length; i++) {
        gmarkers[i].setMap(null);
    }
    gmarkers = [];
}
//This function takes in latitude and longitude of two location and returns the distance between them (in meters)
function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d * 1000;
}
// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}
