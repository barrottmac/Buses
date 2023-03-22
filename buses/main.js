(function(){

    //create map in leaflet and tie it to the div called 'theMap'
    const map = L.map('theMap').setView([44.650627, -63.597140], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    L.marker([44.650690, -63.596537]).addTo(map)
        .bindPopup('This is a sample popup. You can put any html structure in this including extra bus data. You can also swap this icon out for a custom icon. A png file has been provided for you to use if you wish.')
        .openPopup();

        let busMarkersLayer;

        const fetchBuses =() =>{
            fetch('https://prog2700.onrender.com/hrmbuses')
            .then((response)=>response.json())
            .then((json)=>{
                //REQ-1: Demonstrate Retrieval of the Required Raw Transit Data
                console.log(json);

                //filter resulting data to routes 1-10
                const busRoute = json.entity.filter(bus=> 
                    bus.vehicle.trip.routeId >= 1 && bus.vehicle.trip.routeId <=10);
                    console.log(busRoute);
                    

                //REQ-2: Convert Raw Data into GeoJSON format
                const busGeoJson = {
                    type: "FeatureCollection",
                    features: busRoute.map((bus) => {
                        return {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates:[bus.vehicle.position.longitude, bus.vehicle.position.latitude], 
                            },
                            properties: {
                                routeId: bus.vehicle.trip.routeId,
                                vehicleId: bus.vehicle.vehicle.id,
                                bearing: bus.vehicle.position.bearing,
                            },
                        };
                    })
                };
                console.log(busGeoJson);

                //REQ-3: Plot Markers on Map to Show Position of each Vehicle
                if (busMarkersLayer) {
                    // remove the existing markers
                    busMarkersLayer.clearLayers();
                  }
        
                  busMarkersLayer = L.geoJSON(busGeoJson, {
                    pointToLayer: (feature, latlng) => {
                      // Calculate the rotation angle based on the bearing
                      const rotationAngle = feature.properties.bearing;
                      console.log(rotationAngle);
                      
                      // Create the icon with the rotation transform
                      const icon = L.icon({
                        iconUrl: 'bus.png',
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                        popupAnchor: [0, -20],
                        // Rotate the icon based on the bearing
                        iconAngle: rotationAngle,
                      });
                      // Replace the default display icon with the custom icon
                      return L.marker(latlng, { icon, rotationAngle });
                    },
                    onEachFeature: (feature, layer) => {
                      // Marker popup containing information about the vehicle.
                      layer.bindPopup(`<b>Route ID:</b> ${feature.properties.routeId}<br>
                                      <b>Vehicle ID:</b> ${feature.properties.vehicleId}<br>`);
                    },
                  }).addTo(map);


            })//end json fetch
        }//end of function for fetch
        
        fetchBuses();

        //refresh bus markers
        setInterval(()=>{
            fetchBuses();
        }, 15000);

})();