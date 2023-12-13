export const showMapBox = (loactions) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicG9wNGV2ZXIiLCJhIjoiY2tvMTR0bHdnMDU3MTJucTlvNWl5bWI4ZCJ9.8hmwdvwZZTCz9R2oabSabQ';
  mapboxgl.setRTLTextPlugin(
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
    null,
    true, // Lazy load the plugin
  );

  const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/pop4ever/clpc16rgc009k01po83jqfsx6',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  loactions.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
