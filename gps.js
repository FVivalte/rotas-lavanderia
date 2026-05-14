function iniciarGPS() {  
    if (!("geolocation" in navigator)) return;  
    navigator.geolocation.watchPosition(  
        (position) => {  
            userLat = position.coords.latitude;  
            userLng = position.coords.longitude;  
            const gpsInfo = document.getElementById("gps-info");  
            if (gpsInfo) {  
                gpsInfo.innerHTML = `
<span style="color:#4caf50">●</span> GPS Ativo
`;  
            }  
            detectarHotelMaisProximo();  
        },  
        (error) => console.error(error),  
        { enableHighAccuracy: true }  
    );  
}