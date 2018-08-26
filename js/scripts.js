
///Set basemap and view to Amersfoort
var map = L.map('map',{wheelPxPerZoomLevel:250}).setView([52.165, 5.3575], 12);  
L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <br> Dutch municipal elections 2018 data by <a href="https://amersfoort.dataplatform.nl/">Gemeente Amersfoort</a> ',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
}).addTo(map); 

var boundary_style = {
    weight: 2,
    opacity: 1,
    color: '#ff6b6b'
};

//amersfoort_wgs.geojson multilinestring
var amersfoort_boundary = L.geoJson(amersfoort,{style:boundary_style}).addTo(map);

var custom_mark= L.icon({
    iconUrl:'https://png.icons8.com/ultraviolet/40/ff6b6b/marker.png',
    iconSize:[22,22]
});


//select event (under construction)//
function select_json(sel){
    var text = sel.options[sel.selectedIndex].text;
    alert('Sorry this option is currently unavailable...');
    if (text == 'Gemeenteraadsverkiezingen 2018'){
    

    } else if (text == 'Gemeenteraadsverkiezingen 2014'){
 

    } else if (text == 'Gemeenteraadsverkiezingen 2010'){


    } else {
        console.log('Geen jaartal gekozen')
    }
}
///


////////////Add the stembureaus GeoJSON features to map**/
var stembureaus;
var stemmen_container = []
var partijen_container=[]
var myChart;

function create_markers(dataset){
    stembureaus=L.geoJson(dataset, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {icon:custom_mark,title:feature.properties.stemburo});
        }
    }).addTo(map);

    $.each(dataset.features,function(key,val){
        var stemlocaties =val.properties.stemburo;
        var newElement= document.createElement('a');
        newElement.id= stemlocaties;
        newElement.className='list-group-item list-group-item-action';
        newElement.innerHTML=stemlocaties;
        document.getElementById('stemlocaties').appendChild(newElement);
    
        });

    dataset.features.map(function(feature){
        //return keys
        var partijen = Object.keys(feature.properties).filter(item => !['aantal_stemmen','lat','lng'].includes(item));
        partijen_container.push(partijen.slice(1));
            
        //return values
        var stemmen = partijen.map((naam) =>feature.properties[naam]);
        stemmen_container.push(stemmen);
    });

}

//call the create_markers function from GR2018.json
//the whole json object is stored in dataset_2018 variable
create_markers(dataset_2018);
///////////////////////////////


//////layer legend control
var legends={
    " <img src='https://png.icons8.com/ultraviolet/40/ff6b6b/marker.png' height=20> Polling place":stembureaus,
    "<img src='https://png.icons8.com/ios-glyphs/40/ff6b6b/line.png' height=20> Amersfoort municipality  " : amersfoort_boundary,
};
L.control.layers(null,legends,{collapsed:false}).addTo(map);
L.control.scale({imperial: false}).addTo(map);
$(".leaflet-control-layers-overlays").prepend("<label><b>Legend<b></label>");
L.easyButton( 'fas fa-home', function(){
    map.setView([52.165, 5.3575], 12);
  }).addTo(map);
  L.Control.jaartal = L.Control.extend({
    options: {
        position: 'topright'
    }
    ,
    onAdd: function(map) {
        var div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = "<select id='jaartal_select' onChange='select_json(this)'><option>Choose election year</option><option>Municipal elections 2018</option><option>Municipal elections 2014</option><option>Municipal elections 2010</option></select>";
        div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
        return div;
    },
    onRemove: function(map) {
        // Nothing to do here
    }
});
L.control.jaartal = function(opts) {
    return new L.Control.jaartal(opts);
}
L.control.jaartal().addTo(map);
///////////////


//////trigger popup events
var my_markers = []
stembureaus.eachLayer(function(layer){
    my_markers.push(layer);
});
//popup events on marker
stembureaus.on('click', function (event) {  
    var clicked_stemburo=event.layer.feature.properties.stemburo;           
    try{
        for (var i in my_markers){
            var markerID = my_markers[i].options.title;
            if (markerID === clicked_stemburo){
                var coord=my_markers[i]._latlng;
                L.popup()
                .setLatLng(coord)
                .setContent("<b> Polling place: </b>" + my_markers[i].feature.properties.stemburo + '<br>' +
                "<b> Total votes:  </b>" + my_markers[i].feature.properties.aantal_stemmen.toString()
                )
                .openOn(map);
            } 
        }
    }
    catch(err){
        //Ignore warnings
    }

});
//popup events when clicked on a list item
$(document).click(function(event){
    try{
        for (var i in my_markers){
            var markerID = my_markers[i].options.title;
            if (markerID === event.target.id){
                var coord=my_markers[i]._latlng;
                L.popup()
                .setLatLng(coord)
                .setContent("<b> Polling place: </b>" + my_markers[i].feature.properties.stemburo + '<br>' +
                "<b> Total votes:  </b>" + my_markers[i].feature.properties.aantal_stemmen.toString()
                )
                .openOn(map);
                map.setView(coord,13);
            } 
        }
    }
    catch(err){
        //Ignore warnings
    }

});
/////////////////////

//////////dougnut chart
//dummy chart to be replaced
var ctx_dummy = document.getElementById("myChart").getContext("2d");
var myChart = new Chart(ctx_dummy, {
    type: 'doughnut',
    data: {
        labels: ['','','','',],
        datasets: [{
            data: [5,1,8,34],
            borderWidth:1
        }]
    },
    options: {
        legend:{
            position:'left'
        },
        title: {
            display: true,
            text: 'Click on a polling place to display the results',
            position:'top',
            fontSize:16
        }
    }
});

//create chart when a marker is clicked
stembureaus.on('click', function(e){
    $('#myChart').remove();
    $(".row").append('<canvas id="myChart"></canvas>');
    var ctx = document.getElementById("myChart").getContext("2d");

    //get clicked marker
    var clicked_stemburo=e.layer.feature.properties.stemburo;
    
    for (var i in stemmen_container){
        if (stemmen_container[i][0]==clicked_stemburo){
            var clicked_array = stemmen_container[i].slice(1);
            
            myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: partijen_container[0],
                    datasets: [{
                        backgroundColor:[
                            '#FFC312','#C4E538','#12CBC4','#FDA7DF','#ED4C67','#F79F1F','#A3CB38',
                            '#1289A7','#D980FA','#B53471','#0652DD','#006266','#1B1464','#6F1E51'
                        ],
                        data: clicked_array,
                        borderWidth:1
                    }]
                },
                options: {
                    legend:{
                        position:'left'
                    },
                    title: {
                        display: true,
                        text: clicked_stemburo,
                        position:'top',
                        fontSize:16
                    }
                }
            });


           
        }
    }
    
      
});

//create chart when a list item is clicked
$('a').click(function(event){

    $('#myChart').remove();
    $(".row").append('<canvas id="myChart"></canvas>');
    var ctx = document.getElementById("myChart").getContext("2d");

    for (var i in stemmen_container){
        if (stemmen_container[i][0]==event.target.id){
            var clicked_array = stemmen_container[i].slice(1);
            
            myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: partijen_container[0],
                    datasets: [{
                        backgroundColor:[
                            '#FFC312','#C4E538','#12CBC4','#FDA7DF','#ED4C67','#F79F1F','#A3CB38',
                            '#1289A7','#D980FA','#B53471','#0652DD','#006266','#1B1464','#6F1E51'
                        ],
                        data: clicked_array,
                        borderWidth:1
                    }]
                },
                options: {
                    legend:{
                        position:'left'
                    },
                    title: {
                        display: true,
                        text: event.target.id,
                        position:'top',
                        fontSize:16
                    }
                }
            });


           
        }
    }
});
/////////////////////////

