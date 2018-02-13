/**
 * ChicagoPrecincts.js
 * 2016-11-11 HJD
 */

function ChicagoPrecincts(id, features, results) {
	
	const map = L.map(id);
	const center = [ 41.8781, -87.6298 ]; // Chicago lat long
	map.setView(center);

	// Add basemap
	const osmUrl = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
	const osmAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
	const osm = L.tileLayer(osmUrl, {
		minZoom : 11,
		maxZoom : 15,
		attribution : osmAttribution
	});
	map.addLayer(osm);
	
	// Chloropleth color palette
	const colors = [
		'transparent',
		'pink',
		'red'	
	];
	colors.breaks = [
		25,
		50
	];
	colors.get = function(x) {
		const index = colors.breaks.findIndex(function(element) {
			return x <= element;
		});
		return index == -1 ? colors[colors.length - 1] : colors[index];		
	};
	
	// 1st as a percentage of sum
	const percent = function(a, b) { 
		const sum = a + b;
		return sum == 0 ? 0 : (100 * a / sum);
	};	
	
	// Add accessor for results
	results.get = function(ward, precinct) {
		return this.find(function(element) {
			return element.Ward == ward && element.Precinct == precinct;
		});
	};

	// Add precincts
    const br = '<br>';
    const pct = '&percnt;';
    const precinctsLayer = L.geoJSON(features, {

    	style: function(feature) {
    		const returnValue = {color: 'black', weight: 0.9, fillOpacity: 0.5, dashArray: '2,3', fillColor: 'transparent'};
	    	const result = results.get(feature.properties.ward, feature.properties.precinct);
    		const pct = percent(result["Trump & Pence"], result["Clinton & Kaine"]);
        	returnValue.fillColor = colors.get(pct);
    		return returnValue;
    	},

    	onEachFeature: function(feature, layer) {
        	
        	// Add pop-up
	    	const result = results.get(feature.properties.ward, feature.properties.precinct);
	    	layer.bindPopup(
    			"Ward: " + feature.properties.ward + br +
    			"Precinct: " + feature.properties.precinct + br +
       			"Clinton-Kaine: " + result["Clinton & Kaine"] + " (" +
       				percent(result["Clinton & Kaine"], result["Trump & Pence"]).toFixed(1) + pct + ")" + br +
       			"Trump-Pence: " + result["Trump & Pence"] + " (" +
       				percent(result["Trump & Pence"], result["Clinton & Kaine"]).toFixed(1) + pct + ")"
	    	);
	    	
	    	// Add hover
	    	layer.on({
	    		mouseover: function(e) {
	    			e.target.setStyle({fillOpacity: 0.3, dashArray: ''});
    			},
				mouseout: function(e) {
					precinctsLayer.resetStyle(e.target);
	    		}
	    	});
        },
        
        smoothFactor: 0.8
        
    });
    map.addLayer(precinctsLayer);
    map.fitBounds(precinctsLayer.getBounds());
    
    // Add legend    
    const legend = L.control({position: 'topright'});
    legend.onAdd = function(map) {

        const div = L.DomUtil.create('div', 'info legend');
        
        const colorSquare = function(color) {
        	return '<i style="background:' + color + '"></i>';
        };

        // loop through intervals and generate a label with a colored square for each interval
        div.innerHTML += colorSquare(colors[0]) + ' &lt ' + colors.breaks[0] + pct + br;
        for (var i = 1; i < colors.length - 1; i++) {
            div.innerHTML += colorSquare(colors[i]) + colors.breaks[i - 1] + '&ndash;' + colors.breaks[i] + pct + br;
        }; // end for
        div.innerHTML += colorSquare(colors[colors.length - 1]) + ' &gt ' + colors.breaks[colors.length - 2] + pct;

        return div;
    };

    legend.addTo(map);
	return map;
} // end function initmap
