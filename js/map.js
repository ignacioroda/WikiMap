var map;
var vectorSource;
var view;
var selectedFeature;

var cancelClick = false;

function setCenter(gps) {

    var latlon = gps.split(",");

    map.getView().setCenter(ol.proj.transform([Number(latlon[1].trim()), Number(latlon[0].trim())], 'EPSG:4326', 'EPSG:3857'));
}

function setMapFromIP( IP ){
    
    $.get( "http://ip-api.com/json/"+IP, function( data ) {
        setMap( data.lat , data.lon );
    }).fail( function(){
        setMap( 0 , 0 );
    });
   
}
function setMap(lat, lng) {
    if( lat === 0 ){
        lat = 37.788061;
    }
    if( lng === 0 ){
        lng = -122.407414;
    }
    var coords = new Array(lng, lat);
    view = new ol.View({
        center: ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857'),
        zoom: 17,
        minZoom: 13
    });





    vectorSource = new ol.source.Vector({
        
        wrapX: false
    });

    var vectorLayer = new ol.layer.Vector({
        source: vectorSource

    });



    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.MapQuest({layer: 'osm'})
            }),
            vectorLayer
        ],
        view: view,
        interactions: ol.interaction.defaults().extend([
            new ol.interaction.DragRotateAndZoom()
        ])
    });

    map.on('moveend', function (e) {
        var lonlat = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
        var lon = lonlat[0];
        var lat = lonlat[1];


        if( mode === 0 )
            getWiki(lat + "," + lon, lang);

    });

    map.getViewport().addEventListener("touchstart", function(e) {
        map.forEachFeatureAtPixel(map.getEventPixel(e), function (feature, layer) {
            getContent(feature);
            cancelClick = true;
        });
    });
    
    map.getViewport().addEventListener("click", function(e) {
        map.forEachFeatureAtPixel(map.getEventPixel(e), function (feature, layer) {
            if( cancelClick ){
                cancelClick = false;
            }else{
                getContent(feature);
            }
        });
    });
    /*
    map.on("click", function (e) {
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
            //getPage(feature.get("name"), feature.get("pageid"));+
            getContent(feature);
        });
    });*/
}

function clearFeatures(){
    vectorSource.clear();
}

function showAll(){
    
    
    var lonlat = ol.proj.transform( view.getCenter() , 'EPSG:3857', 'EPSG:4326');
    var lon = lonlat[0];
    var lat = lonlat[1];
         
    
    getWiki(lat + "," + lon, lang);
}



function showFavs(){
    clearFeatures();
    
    var len = favs.length;
    
    for (var key in favs) {
        
        var value = favs[key];
        
        
        addIcon( value[1] , value[2] , value[0] , Number(key) );
    }
   
}

function addIcon( lat, lng, name, pageid ) {
    
    var geo = new ol.geom.Point(ol.proj.transform([lng, lat], 'EPSG:4326',
            'EPSG:3857'));

    // Let's check if there are several points in the same location.
    // If so, we will add extra offset to the label
    var offsetY = -35;
    var features = vectorSource.getFeatures();


    var len = features.length - 1;
    for (len = features.length - 1; len >= 0; len--) {
        var g = features[len].getGeometry().getCoordinates();

        if (g[0] === geo.j[0] && g[1] === geo.j[1]) {
            offsetY -= 30;
        }

    }





    if (name.length > 30)
        name = name.substring(30) + "...";

    var style = [
        new ol.style.Style({
            image: new ol.style.Icon(({
                scale: 0.4,
                anchor: [0.5, 0.5],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: './images/mark.png',
            }))
        }),
        new ol.style.Style({
            text: new ol.style.Text({
                text: name,
                offsetY: offsetY,
                fill: new ol.style.Fill({
                    color: '#FFF'
                }),
                stroke: new ol.style.Stroke({
                    color: '#000',
                    width: 3
                }),
                scale: 1.1


            })
        })
    ];


    var iconFeature = new ol.Feature({
        geometry: geo,
        name: name,
        pageid: pageid


    });

    iconFeature.setStyle(style);


    vectorSource.addFeature(iconFeature);

}

