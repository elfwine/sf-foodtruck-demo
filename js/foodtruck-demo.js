/**
 * San Francisco Food truck Finder Demo
 *
 */
var limit = 10; // the maximum number of food trucks to search.
var foodTrucksUrl = "https://data.sfgov.org/resource/6a9r-agq8.json";

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
        pointer.setPosition(e.latLng);
        var pos = e.latLng, o = "(" + pos.lat().toFixed(6) + ", " + pos.lng().toFixed(6) + ")";
        infowindow.setContent(o);

        // Fetch closest food trucks
        $.ajax({
            url: foodTrucksUrl,
            type: "GET",
            data: {
                "status" : "APPROVED",
                "$where": "expirationdate > '" + (new Date()).toISOString().replace(/Z/, '') + "'"
                  + " AND within_circle(location, "
                  + pos.lat() + ", "
                  + pos.lat() + ", 500)",
                "$select": "*, distance_in_meters(location, 'POINT(" + pos.lat() + " " + pos.lng() + ")') AS range",
                "$order" : "range",
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
                    // Add an InfoWindow with details about the truck
                    var markerInfo = new google.maps.InfoWindow({
                      content: '<div class="info-window">'
                        + '<h4>' + truck.applicant + '</h4>'
                        + '<h5>' + Math.round(parseFloat(truck.range)) + ' meters away.</h5>'
                        + '<p>' + truck.fooditems + '</p>'
                        + '</div>'
                    });
                    google.maps.event.addListener(marker, 'click', function() {
                      markerInfo.open(map, marker);
                    });
                }
            } else {
                // No Food trucks nearby
                alert("No Food trucks found nearby the pointer.");
            }
        });
    });
}
