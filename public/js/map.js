const mapDiv = document.getElementById('map');

if (mapDiv) {
    const latitude = parseFloat(mapDiv.dataset.lat);
    const longitude = parseFloat(mapDiv.dataset.lng);
    const tomtomKey = mapDiv.dataset.key;

    const map = tt.map({
        key: tomtomKey,
        container: 'map',
        center: [longitude, latitude],
        zoom: 10
    });

    new tt.Marker().setLngLat([longitude, latitude]).addTo(map);
}