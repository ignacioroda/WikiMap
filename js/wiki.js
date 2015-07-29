var currentPageId;


function getWiki(gps, lang) {
    gps = gps.replace(",", "|");
    gps = gps.replace(" ", "");

    var zoom = view.getZoom();
    var distance = 10000;
    var maxItems = '20';
    if (zoom > 16) {
        maxItems = '30';
        distance = 1000;
    } else if (zoom > 15) {
        maxItems = '25';
        distance = 3000;
    } else if (zoom > 14) {
        maxItems = '20';
        distance = 6000;
    }

    $.ajax({
        type: "GET",
        url: "http://" + lang + ".wikipedia.org/w/api.php",
        data: {action: 'query', list: 'geosearch', gscoord: gps, gsradius: distance, gslimit: maxItems, uselang: lang, format: 'json'},
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp",
        success: function (data, textStatus, jqXHR) {
            


            var len = data.query.geosearch.length;



            var text = "";
            clearFeatures();
            for (i = 0; i < len; i++) {

                addIcon(data.query.geosearch[i].lat, data.query.geosearch[i].lon, data.query.geosearch[i].title, data.query.geosearch[i].pageid);

            }



        },
        error: function (errorMessage) {
        }
    });

}

function getContent(feature) {
    var number = 0;

    var geo = feature.getGeometry().getCoordinates();

    var features = vectorSource.getFeatures();

    var html = "";

    var index = -1;
    var len = features.length - 1;
    for (len = features.length - 1; len >= 0; len--) {

        var f = features[len];


        var g = f.getGeometry().getCoordinates();

        if (g[0] === geo[0] && g[1] === geo[1]) {
            html += "<div onclick='getPage(" + len + ");' class='option'>" + f.get("name") + "</div>";
            number++;
            index = len;
        }

    }

    if (number === 1) {
        getPage(index);
    } else {
        showDialog("Select:", html);
    }
}

function getPage(index) {
    var feature = vectorSource.getFeatures()[index];
    selectedFeature = feature;
    var title = feature.get("name");
    currentPageId = feature.get("pageid");

    $.ajax({
        type: "GET",
        url: "http://" + lang + ".wikipedia.org/w/api.php",
        data: {action: 'parse', prop: 'text', section: 0, pageid: currentPageId, format: 'json'},
        contentType: "application/json; charset=utf-8",
        dataType: "jsonp",
        success: function (data, textStatus, jqXHR) {
            var markup = data.parse.text["*"];
            var blurb = $('<div></div>').html(markup);

            // remove links as they will not work
            blurb.find('a').each(function () {
                $(this).replaceWith($(this).html());
            });

            // remove any references
            blurb.find('sup').remove();

            // remove cite error
            blurb.find('.mw-ext-cite-error').remove();

            //new Messi( $(blurb).find('p') , { viewport: {width: '80%' , height: '60%' , top: '20%', left: '10%'}} );
            //$('#article_content').html($(blurb).find('p'));

            showDialogWithPage(title, $(blurb).find('p'));
        },
        error: function (errorMessage) {
        }
    });
}

