
var user;
var userId;
var init = false;
var mode = 0;

var favs = {};



function login(instance, lang, os, country, locality) {
    if (!init) {
        // This will start the Moback's SDK. You should have an account at moback.com
        // Enter your app's credentials in config.txt
        Moback.initialize(moBack_Application_key, moBack_Development_key);
        init = true;
    }

    var mobackUser = new Moback.userMgr();

    mobackUser.login(instance, "pass123", function (data) {


        if (data.hasOwnProperty('objectId')) {
            user = data;
            userId = data.objectId;
            loadFavs();
        } else {
            newAccount(instance, lang, os, country, locality);
        }


    });
}

function newAccount(instance, lang, os, country, locality) {
    //Instatiate a moback user object
    var mobackUser = new Moback.userMgr();

    try { 
      

        //Set properties of the user object
        mobackUser.set("userId", instance);
        mobackUser.set("password", "pass123");
        mobackUser.set("email", "wikimap" + instance + "@mobincubeapp.com");
        mobackUser.set("firstname", instance);

        mobackUser.set("lang", lang);
        if (os !== undefined)
            mobackUser.set("os", os);
        if (country !== undefined)
            mobackUser.set("country", country);
        if (locality !== undefined)
            mobackUser.set("locality", locality);



        mobackUser.createUser(function (data) {
            //alert( data.code +" "+data.message );

            if (data.code === "1000") {
                login(instance, lang, os, country, locality);
            }

        });
    } catch (err) {
        //alert(err.message);
    }

}

function loadFavs() {
    var mobackQuery = new Moback.queryMgr('favs');
    mobackQuery.equalTo("userId", userId);

    mobackQuery.fetch(function (results) {

        var len = results.length;

        for (var i = 0; i < len; i++) {
            var object = results[i];
                
            var pageid = object.get('pageid');
            
            favs[pageid] = [ object.get('name') , object.get('lat') , object.get('lng') ];


        }
        
        if( len > 0 ){
            $('#favfilter').css('display', 'inline');
        }


    });
}

function favorite(value) {
    
    if (value) {
        var geo = selectedFeature.getGeometry().getCoordinates();
         
        var lonlat = ol.proj.transform( geo , 'EPSG:3857', 'EPSG:4326');
        var lon = lonlat[0];
        var lat = lonlat[1];
    
        var name = selectedFeature.get("name");
        var pageid = currentPageId.toString();
        // Save fav
        var mobackObject = new Moback.objMgr("favs");
        mobackObject.set("userId", userId );
        mobackObject.set("pageid", pageid );
        mobackObject.set("name", name );
        mobackObject.set("lat", lat );
        mobackObject.set("lng", lon );
        
        
        mobackObject.save(function (data) {
            
            favs[pageid] = [ name , lat , lon ];
            
            $('#yes_fav').css('display', 'inline');
            $('#no_fav').css('display', 'none');
            $('#favfilter').css('display', 'inline');
        });
    }else{
        // Delete fav
        var mobackQuery = new Moback.queryMgr('favs');
        mobackQuery.equalTo("userId", userId );
        mobackQuery.equalTo("pageid", currentPageId.toString() );
        mobackQuery.limit(1);
        mobackQuery.fetch(function (results) {

            var len = results.length;
            
            if( len === 1 ){
                var object = results[0];
                var pageid = object.get('pageid');
                object.remove(function(data){
                    delete favs[ pageid ];
                
                    $('#yes_fav').css('display', 'none');
                    $('#no_fav').css('display', 'inline');
                });
                
            }
            


        });
    }
    
}


function setFavoritesMode(){
    if( favs.length === 0 )
        return;
    
    switch( mode ){
        case 0:
            showFavs();
            mode = 1;
            $("#favfilter_button").attr("src","./images/fav_ac.png");
            break;
        case 1:
            showAll();
            mode = 0;
            $("#favfilter_button").attr("src","./images/fav_in.png");
            break;
    }
}