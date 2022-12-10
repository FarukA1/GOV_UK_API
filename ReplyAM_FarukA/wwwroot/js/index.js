const API_URL = 'https://api.tfl.gov.uk/AccidentStats/2012';

var averLat;
var averLon;

var greenIcon;
var redIcon

var totalSlight;
var totalSerious;


async function getData() {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log(data);


    totalSlight = data.filter(x => x.severity == "Slight").length;

    totalSerious = data.filter(x => x.severity == "Serious").length;

    greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    function getIcon(severity) {
        return severity == "Slight" ? greenIcon :
            severity == "Serious" ? redIcon :
                redIcon;
    }

    averageLatLon(data);

    var map = L.map('map').setView([averLat, averLon], 13);


    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmFydWthMSIsImEiOiJjbDJxbGJiaGMwMmlvM2tydHAwZmU3aG9xIn0.YHkk-jT_s3u-IRtNhTg66g', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'your.mapbox.access.token'
    }).addTo(map);

    var plotDataLayer = L.layerGroup();
    var plotSlightDataLayer = L.layerGroup();
    var plotSeriousDataLayer = L.layerGroup();

    for (var i = 0; i < 500; ++i) {
        const plotData = L.marker([data[i].lat, data[i].lon], { icon: getIcon(data[i].severity) })
            .bindPopup('<p style="text-align:center; font-size: 15px;font-weight: bold;">' + data[i].location + '</p>' +
                '<p> Date: ' + data[i].date.substring(0, 10) + '</p>' +
                '<p> Borough: ' + data[i].borough + '</p>' +
                '<p> Severity: ' + data[i].severity + '</p>' +
                '<p> Number of casualties: ' + data[i].casualties.length + '</p>' +
            '<p> Number of vehicles involved: ' + data[i].vehicles.length + '</p>'
        );
        plotData.addTo(map);
        plotDataLayer.addLayer(plotData);


        if (data[i].severity == "Slight") {
            const plotSlightData = L.marker([data[i].lat, data[i].lon], { icon: getIcon(data[i].severity) })
                .bindPopup('<p style="text-align:center; font-size: 15px;font-weight: bold;">' + data[i].location + '</p>' +
                    '<p> Date: ' + data[i].date.substring(0, 10) + '</p>' +
                    '<p> Borough: ' + data[i].borough + '</p>' +
                    '<p> Severity: ' + data[i].severity + '</p>' +
                    '<p> Number of casualties: ' + data[i].casualties.length + '</p>' +
                    '<p> Number of vehicles involved: ' + data[i].vehicles.length + '</p>'
            );
            //plotSlightData.addTo(map);
            plotSlightDataLayer.addLayer(plotSlightData);
        }

        if (data[i].severity == "Serious") {
            const plotSeriousData = L.marker([data[i].lat, data[i].lon], { icon: getIcon(data[i].severity) })
                .bindPopup('<p style="text-align:center; font-size: 15px;font-weight: bold;">' + data[i].location + '</p>' +
                    '<p> Date: ' + data[i].date.substring(0, 10) + '</p>' +
                    '<p> Borough: ' + data[i].borough + '</p>' +
                    '<p> Severity: ' + data[i].severity + '</p>' +
                    '<p> Number of casualties: ' + data[i].casualties.length + '</p>' +
                    '<p> Number of vehicles involved: ' + data[i].vehicles.length + '</p>'
            );
            //plotSeriousData.addTo(map);
            plotSeriousDataLayer.addLayer(plotSeriousData);
        }
        
    }

    var layerControl = L.control.layers().addTo(map);
    layerControl.addOverlay(plotDataLayer, "All");
    layerControl.addOverlay(plotSlightDataLayer, "Slight");
    layerControl.addOverlay(plotSeriousDataLayer, "Serious");


    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Severity</h4>";
        div.innerHTML += '<i style="background: #00FF00"></i><span>Slight</span><br>';
        div.innerHTML += '<i style="background: #FF0000"></i><span>Serious</span><br>';

        return div;
    };
    legend.addTo(map);

    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Slight', 'Serious'],
            datasets: [{
                label: 'Accident Severity',
                data: [totalSlight, totalSerious],
                backgroundColor: [
                    'rgb(50, 128, 0)',
                    'rgb(255, 0, 0)',
                ],
                hoverOffset: 4
            }]
        }
    });


    var accidentDetails = document.getElementById("accident");
    var sumAcc = totalSlight + totalSerious;
    accidentDetails.innerHTML = '<p>Total Accident: ' + sumAcc + ' incidents</p>' +
        '<p> Slight Accident: ' + totalSlight + ' incidents</p>' +
        '<p> Serious Accident: ' + totalSerious + ' incidents</p>';

    
}

getData();

function averageLatLon(data) {
    let totalLat = 0;
    let totalLon = 0;

    for (let i = 0; i < data.length; ++i) {
        totalLat += data[i].lat;
        averLat = totalLat / data.length;

        totalLon += data[i].lon;
        averLon = totalLon / data.length;
        
    }
}

